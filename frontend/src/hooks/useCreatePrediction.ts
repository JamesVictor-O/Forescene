"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  useAccount,
  useWalletClient,
  usePublicClient,
  useReadContract,
} from "wagmi";
import { useState } from "react";
import {
  Address,
  decodeEventLog,
  Hex,
  parseUnits,
  formatUnits,
  maxUint256,
} from "viem";
import { getContract, getNetworkConfig } from "@/config/contracts";
import { predictionRegistryAbi } from "@/abis/predictionRegistry";
import { foreAbi } from "@/abis/fore";
import { usePinataUpload } from "./usePinataUpload";

type PredictionFormat = "video" | "text";

export type CreatePredictionInput = {
  format: PredictionFormat;
  category: string;
  deadline: number | Date;
  creatorFeeBps?: number;
  creatorStake: string;
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
  const registry = getContract("predictionRegistry");
  const market = getContract("predictionMarket");
  const foreToken = getContract("foreToken");

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: foreToken.address,
    abi: foreAbi,
    functionName: "allowance",
    args: address ? [address, market.address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Check user's FORE token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: foreToken.address,
    abi: foreAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

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

      const fee = input.creatorFeeBps ?? 0;
      if (fee < 0 || fee > 10_000) {
        throw new Error("Creator fee must be between 0 and 10,000 bps.");
      }

      const stakeAmount = parseFloat(input.creatorStake);
      if (!Number.isFinite(stakeAmount) || stakeAmount <= 0) {
        throw new Error("Creator stake must be greater than 0.");
      }
      const stakeAmountWei = parseUnits(input.creatorStake, 18);

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

      // Check balance
      setStep("checking-allowance");
      await refetchBalance();
      const userBalance = balance ?? BigInt(0);

      if (userBalance < stakeAmountWei) {
        throw new Error(
          `Insufficient FORE balance. You have ${formatUnits(
            userBalance,
            18
          )} FORE, but need ${
            input.creatorStake
          } FORE to create this prediction.`
        );
      }

      // Check allowance
      await refetchAllowance();
      const currentAllowance = allowance ?? BigInt(0);

  

      if (currentAllowance < stakeAmountWei) {
        setStep("approving");

      

        try {
      

          const { request } = await publicClient.simulateContract({
            address: foreToken.address,
            abi: foreAbi,
            functionName: "approve",
            args: [market.address, maxUint256],
            account: address as Address,
          });


          const approveHash = await wagmiWalletClient.writeContract(request);

         
          const approveReceipt = await publicClient.waitForTransactionReceipt({
            hash: approveHash,
            confirmations: 1,
          });
          // Refresh allowance
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await refetchAllowance();

          const newAllowance = allowance ?? BigInt(0);
        } catch (error: unknown) {

          const errorMessage =
            error instanceof Error ? error.message : String(error);

          // More detailed error messages
          if (errorMessage.toLowerCase().includes("user rejected")) {
            throw new Error("Transaction rejected by user");
          }

          if (errorMessage.toLowerCase().includes("insufficient funds")) {
            throw new Error(
              "Insufficient ETH for gas fees. Please add ETH to your wallet."
            );
          }

          if (
            errorMessage.toLowerCase().includes("json-rpc") ||
            errorMessage.toLowerCase().includes("network")
          ) {
            throw new Error(
              "Network error. Please check your RPC connection and try again. Consider switching to a different RPC provider."
            );
          }

          // Generic error with details
          throw new Error(`Approval failed: ${errorMessage}`);
        }
      }

      // Create prediction
      setStep("submitting");

      try {

        const { request } = await publicClient.simulateContract({
          address: registry.address,
          abi: predictionRegistryAbi,
          functionName: "createPrediction",
          args: [
            cid,
            formatValue,
            category,
            BigInt(deadlineSeconds),
            fee,
            stakeAmountWei,
          ],
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
              abi: predictionRegistryAbi,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "PredictionCreated") {
              predictionId = Number(
                (decoded.args as { predictionId: bigint }).predictionId
              );
              break;
            }
          } catch {
            // Ignore non-matching logs
          }
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
