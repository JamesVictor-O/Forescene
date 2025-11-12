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
import { Address, Hex, parseUnits, maxUint256 } from "viem";
import { getContract, getNetworkConfig } from "@/config/contracts";
import { predictionMarketAbi } from "@/abis/predictionMarket";
import { foreAbi } from "@/abis/fore";

export type CopyPredictionResult = {
  hash: Hex;
  amount: bigint;
};

export type CopyPredictionStep =
  | "idle"
  | "checking-allowance"
  | "approving"
  | "copying"
  | "waiting"
  | "success"
  | "error";

export function useCopyPrediction() {
  const { ready, authenticated } = usePrivy();
  const { address, chain } = useAccount();
  const { data: wagmiWalletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<CopyPredictionStep>("idle");
  const [txHash, setTxHash] = useState<Hex | null>(null);

  const network = getNetworkConfig();
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

  const mutation = useMutation<
    CopyPredictionResult,
    Error,
    { predictionId: number; amount: string }
  >({
    mutationKey: ["copy-prediction"],
    mutationFn: async ({ predictionId, amount }) => {
      if (!ready || !authenticated) {
        throw new Error("Connect your wallet to copy prediction.");
      }
      if (!address) {
        throw new Error("Wallet address not found.");
      }
      if (!publicClient) {
        throw new Error("Public client unavailable.");
      }
      if (chain?.id !== network.chainId) {
        throw new Error(
          `Wrong network. Please switch to ${network.name} (Chain ID: ${network.chainId})`
        );
      }

      // Get wallet client inside mutation - it should be ready by now
      const activeWalletClient = wagmiWalletClient;
      if (!activeWalletClient) {
        throw new Error(
          "Wallet client unavailable. Please reconnect your wallet."
        );
      }

      const amountWei = parseUnits(amount, 18);
      if (amountWei <= BigInt(0)) {
        throw new Error("Amount must be greater than zero.");
      }

      // Check and handle token approval
      setStep("checking-allowance");
      await refetchAllowance();

      const currentAllowance = allowance ?? BigInt(0);
      if (currentAllowance < amountWei) {
        setStep("approving");
        const approveHash = await activeWalletClient.writeContract({
          address: foreToken.address,
          abi: foreAbi,
          functionName: "approve",
          account: address as Address,
          args: [market.address, maxUint256], // Approve max for better UX
        });

        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        await refetchAllowance();
      }

      // Copy prediction
      setStep("copying");
      const hash = await activeWalletClient.writeContract({
        address: market.address,
        abi: predictionMarketAbi,
        functionName: "copyPrediction",
        account: address as Address,
        args: [BigInt(predictionId), amountWei],
      });

      console.log("✅ Copy prediction transaction submitted:", hash);
      setTxHash(hash);
      setStep("waiting");

      await publicClient.waitForTransactionReceipt({ hash });
      console.log("✅ Copy prediction transaction confirmed");

      // Invalidate relevant queries
      await queryClient.invalidateQueries({
        queryKey: ["predictions", network.chainId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["pool", predictionId],
      });

      setStep("success");
      return { hash, amount: amountWei };
    },
    onError: (error: Error) => {
      console.error("❌ Copy prediction error:", error);
      setStep("error");
    },
  });

  const reset = () => {
    setStep("idle");
    setTxHash(null);
    mutation.reset();
  };

  return {
    copyPrediction: mutation.mutateAsync,
    isCopying:
      mutation.status === "pending" &&
      (step === "copying" ||
        step === "waiting" ||
        step === "checking-allowance"),
    isApproving: step === "approving",
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    currentStep: step,
    transactionHash: txHash,
    data: mutation.data,
    reset,
  };
}
