"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { useState } from "react";
import { Address, decodeEventLog, Hex } from "viem";
import { getContract, getNetworkConfig } from "@/config/contracts";
import { predictionManagerAbi } from "@/abis/predictionManager";
import { usePinataUpload } from "./usePinataUpload";

type PredictionFormat = "video" | "text";

export type CreatePredictionInput = {
  format: PredictionFormat;
  category: string;
  deadline: number | Date;
  oracle: string;
  platformFeeBps?: number;
  title?: string;
  summary?: string;
  existingCid?: string;
  file?: File;
  textContent?: string;
};

export type CreatePredictionStep =
  | "idle"
  | "validating"
  | "uploading"
  | "checking-allowance"
  | "approving"
  | "submitting"
  | "waiting"
  | "success"
  | "error";

export type CreatePredictionResult = {
  hash: Hex;
  predictionId?: number;
  cid: string;
};

const FORMAT_MAP: Record<PredictionFormat, 0 | 1> = {
  video: 0,
  text: 1,
};

export function useCreatePrediction() {
  const { ready, authenticated } = usePrivy();
  const { address, chain } = useAccount();
  const { data: wagmiWalletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<CreatePredictionStep>("idle");
  const [txHash, setTxHash] = useState<Hex | null>(null);

  const {
    isUploading,
    progress: uploadProgress,
    error: uploadError,
    uploadFile,
    uploadJson,
    reset: resetUpload,
  } = usePinataUpload();

  const network = getNetworkConfig();
  const predictionManager = getContract("predictionManager");

  const mutation = useMutation({
    mutationKey: ["create-prediction"],
    mutationFn: async (
      input: CreatePredictionInput
    ): Promise<CreatePredictionResult> => {
      if (!ready || !authenticated) {
        throw new Error("Connect your wallet to create a prediction.");
      }
      if (!address) {
        throw new Error("Wallet address not found.");
      }
      if (!publicClient) {
        throw new Error("Public client unavailable.");
      }
      if (!wagmiWalletClient) {
        throw new Error(
          "Wallet client unavailable. Please reconnect your wallet."
        );
      }
      if (chain?.id !== network.chainId) {
        throw new Error(
          `Wrong network. Please switch to ${network.name} (Chain ID: ${network.chainId})`
        );
      }

      setStep("validating");

      const formatValue = FORMAT_MAP[input.format];
      const category = input.category.trim().toLowerCase();
      if (!category) {
        throw new Error("Category is required.");
      }

      const deadlineSeconds =
        typeof input.deadline === "number"
          ? input.deadline
          : Math.floor(input.deadline.getTime() / 1000);
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (
        !Number.isFinite(deadlineSeconds) ||
        deadlineSeconds <= nowSeconds + 3600
      ) {
        throw new Error("Deadline must be at least one hour in the future.");
      }

      const oracleAddress = input.oracle as Address;
      if (!oracleAddress) {
        throw new Error("Oracle address is required.");
      }

      const platformFeeBps = input.platformFeeBps ?? 500; // default 5%
      if (platformFeeBps < 0 || platformFeeBps > 10_000) {
        throw new Error("Platform fee must be between 0 and 10,000 bps.");
      }

      let cid = input.existingCid?.trim();
      if (!cid) {
        setStep("uploading");
        if (input.format === "video") {
          if (!input.file) {
            throw new Error("Select a video file to upload.");
          }
          const videoUpload = await uploadFile(input.file, {
            metadata: {
              name: input.title ?? input.file.name,
              keyvalues: {
                category,
                title: input.title ?? "",
                format: "video",
              },
            },
          });

          const metadataPayload = {
            version: "forescene-prediction-v1",
            format: "video",
            title: input.title ?? "Prediction",
            summary: input.summary ?? "",
            category,
            creator: address,
            createdAt: new Date().toISOString(),
            media: {
              cid: videoUpload.cid,
              url: videoUpload.url,
              mimeType: input.file.type || "video/mp4",
              size: input.file.size,
            },
          };

          const metadataUpload = await uploadJson(
            metadataPayload,
            `${category}-prediction-${Date.now()}-metadata.json`,
            {
              metadata: {
                name: input.title ?? "prediction-video-metadata",
                keyvalues: {
                  category,
                  format: "video",
                },
              },
            }
          );

          cid = metadataUpload.cid;
        } else {
          const textContent = input.textContent ?? "";
          const firstLine = textContent.split("\n")[0]?.trim() || "";
          const effectiveTitle =
            input.title?.trim() || firstLine || "Prediction";

          const metadataPayload = {
            version: "forescene-prediction-v1",
            format: "text",
            title: effectiveTitle,
            summary: input.summary ?? "",
            content: textContent,
            category,
            creator: address,
            createdAt: new Date().toISOString(),
          };
          const metadataUpload = await uploadJson(
            metadataPayload,
            `${category}-prediction-${Date.now()}.json`,
            {
              metadata: {
                name: effectiveTitle,
                keyvalues: {
                  category,
                  author: address,
                  format: "text",
                },
              },
            }
          );
          cid = metadataUpload.cid;
        }
      }

      if (!cid) {
        throw new Error("Unable to determine content CID.");
      }

      setStep("submitting");

      try {
        const question = input.title || cid;
        const { request } = await publicClient.simulateContract({
          address: predictionManager.address,
          abi: predictionManagerAbi,
          functionName: "createMarket",
          args: [
            1,
            question,
            category,
            BigInt(deadlineSeconds),
            BigInt(0),
            0,
            "",
          ] as any,
          account: address as Address,
        });

        const hash = await wagmiWalletClient.writeContract(request);
        setTxHash(hash);
        setStep("waiting");

        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });

        let predictionId: number | undefined;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: predictionManagerAbi,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "MarketCreated") {
              predictionId = Number(
                (decoded.args as { marketId: bigint }).marketId
              );
              break;
            }
          } catch {}
        }

        await queryClient.invalidateQueries({
          queryKey: ["predictions", network.chainId],
        });

        setStep("success");
        return { hash, predictionId, cid };
      } catch (error) {
        throw error;
      }
    },
    onError: (error: Error) => {
      setStep("error");
    },
  });

  const reset = () => {
    setStep("idle");
    setTxHash(null);
    resetUpload();
    mutation.reset();
  };

  return {
    createPrediction: mutation.mutateAsync,
    isCreating:
      mutation.status === "pending" &&
      (step === "submitting" ||
        step === "waiting" ||
        step === "validating" ||
        step === "checking-allowance" ||
        step === "approving"),
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? (uploadError ? new Error(uploadError) : null),
    uploadProgress,
    isUploading,
    currentStep: step,
    transactionHash: txHash,
    data: mutation.data,
    reset,
  };
}
