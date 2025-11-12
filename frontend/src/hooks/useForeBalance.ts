"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";

import { getContract } from "@/config/contracts";

type ForeBalance = {
  raw: bigint;
  formatted: string;
  symbol: string;
  decimals: number;
};

type UseForeBalanceResult = {
  balance?: ForeBalance;
  isLoading: boolean;
  error?: string;
  refetch: () => Promise<unknown>;
};


export function useForeBalance(): UseForeBalanceResult {
  const { address } = useAccount();
  const foreToken = getContract("foreToken");

  const balanceQuery = useReadContract({
    address: foreToken.address as `0x${string}`,
    abi: foreToken.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchOnWindowFocus: false,
      staleTime: 30_000, // cache for 30s
      gcTime: 5 * 60_000, // 5 min garbage collection
    },
  });

  const balance = useMemo<ForeBalance | undefined>(() => {
    if (!balanceQuery.data) return undefined;
    const raw = balanceQuery.data as bigint;
    return {
      raw,
      decimals: 18,
      symbol: "FORE",
      formatted: formatUnits(raw, 18),
    };
  }, [balanceQuery.data]);

  return {
    balance,
    isLoading: balanceQuery.isPending,
    error: balanceQuery.error?.message,
    refetch: balanceQuery.refetch,
  };
}

