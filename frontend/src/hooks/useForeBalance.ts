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

const DEFAULT_DECIMALS = 18;
const DEFAULT_SYMBOL = "FORE";

export function useForeBalance(): UseForeBalanceResult {
  const { address } = useAccount();
  const foreToken = getContract("foreToken");

  const decimalsQuery = useReadContract({
    address: foreToken.address as `0x${string}`,
    abi: foreToken.abi,
    functionName: "decimals",
    query: {
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  });

  const symbolQuery = useReadContract({
    address: foreToken.address as `0x${string}`,
    abi: foreToken.abi,
    functionName: "symbol",
    query: {
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  });

  const balanceQuery = useReadContract({
    address: foreToken.address as `0x${string}`,
    abi: foreToken.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchOnWindowFocus: false,
    },
  });

  const decimals =
    typeof decimalsQuery.data === "bigint"
      ? Number(decimalsQuery.data)
      : decimalsQuery.data ?? DEFAULT_DECIMALS;
  const symbol = symbolQuery.data ?? DEFAULT_SYMBOL;

  const balance = useMemo<ForeBalance | undefined>(() => {
    if (!balanceQuery.data) return undefined;
    const raw = balanceQuery.data as bigint;
    return {
      raw,
      decimals,
      symbol,
      formatted: formatUnits(raw, decimals),
    };
  }, [balanceQuery.data, decimals, symbol]);

  const error =
    balanceQuery.error?.message ??
    decimalsQuery.error?.message ??
    symbolQuery.error?.message;

  return {
    balance,
    isLoading:
      balanceQuery.isPending ||
      decimalsQuery.isPending ||
      symbolQuery.isPending,
    error,
    refetch: balanceQuery.refetch,
  };
}
