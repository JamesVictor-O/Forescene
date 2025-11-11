"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useMemo, useState } from "react";
import {
  Address,
  createWalletClient,
  custom,
  decodeEventLog,
  Hex,
  type WalletClient,
  walletActions,
} from "viem";
import { bscTestnet } from "viem/chains";
import { useAccount, useConnectorClient, usePublicClient } from "wagmi";

import { getContract } from "@/config/contracts";
import { predictionRegistryAbi } from "@/abis/predictionRegistry";
import { usePinataUpload } from "./usePinataUpload";

type PredictionFormat = "video" | "text";

export type CreatePredictionInput = {
  format: PredictionFormat;
  category: string;
  deadline: number | Date;
  creatorFeeBps?: number;
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
  const { wallets } = useWallets();
  const { address, isConnected } = useAccount();
  const { data: connectorClient } = useConnectorClient({
    query: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  });
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

  const registry = getContract("predictionRegistry");
  const publicClient = usePublicClient();
  const chain = useMemo(
    () => publicClient?.chain ?? bscTestnet,
    [publicClient?.chain]
  );

  const mutation = useMutation<
    CreatePredictionResult,
    Error,
    CreatePredictionInput
  >({
    mutationKey: ["create-prediction"],
    mutationFn: async (input) => {
      if (!ready || !authenticated || !isConnected || !address) {
        throw new Error("Wallet client unavailable. Reconnect your wallet.");
      }
      if (!publicClient) {
        throw new Error("Public client unavailable. Reconnect your wallet.");
      }
      let walletClient: WalletClient | undefined = connectorClient as
        | WalletClient
        | undefined;

      if (!walletClient && wallets.length > 0) {
        const embeddedWallet = wallets.find(
          (wallet) => wallet.walletClientType === "privy"
        );
        const externalWallet = wallets[0]; // fallback to first wallet

        const activeWallet = embeddedWallet || externalWallet;

        if (activeWallet) {
          const provider = await activeWallet.getEthereumProvider();
          walletClient = createWalletClient({
            account: address as Address,
            chain,
            transport: custom(provider),
          });
        }
      }

      if (!walletClient) {
        throw new Error("Wallet client unavailable. Reconnect your wallet.");
      }
      const wallet = walletClient.extend(walletActions);
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

      let cid = input.existingCid?.trim();
      if (!cid) {
        setStep("uploading");

        if (input.format === "video") {
          if (!input.file) {
            throw new Error("Select a video file to upload.");
          }
          const uploadResult = await uploadFile(input.file, {
            metadata: {
              name: input.title ?? input.file.name,
              keyvalues: {
                category,
                title: input.title ?? "",
              },
            },
          });
          cid = uploadResult.cid;
        } else {
          const textPayload = {
            title: input.title ?? "Prediction",
            summary: input.summary ?? "",
            content: input.textContent ?? "",
            author: address,
            category,
            createdAt: new Date().toISOString(),
          };
          const uploadResult = await uploadJson(
            textPayload,
            `${category}-prediction-${Date.now()}.json`,
            {
              metadata: {
                name: input.title ?? "prediction-text",
                keyvalues: {
                  category,
                  author: address,
                },
              },
            }
          );
          cid = uploadResult.cid;
        }
      }

      if (!cid) {
        throw new Error("Unable to determine content CID.");
      }

      setStep("submitting");

      const hash = await wallet.writeContract({
        chain,
        address: registry.address,
        abi: predictionRegistryAbi,
        functionName: "createPrediction",
        account: address as Address,
        args: [cid, formatValue, category, BigInt(deadlineSeconds), fee],
      });

      setTxHash(hash);
      setStep("waiting");

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

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
          // Ignore non-matching logs.
        }
      }

      await queryClient.invalidateQueries({
        queryKey: ["predictions", chain.id],
      });

      setStep("success");

      return { hash, predictionId, cid };
    },
    onError: () => {
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
      (step === "submitting" || step === "waiting" || step === "validating"),
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
