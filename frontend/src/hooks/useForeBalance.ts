"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { Address, createPublicClient, formatUnits, http } from "viem";
import { bscTestnet } from "viem/chains";

import { getContract, getNetworkConfig } from "@/config/contracts";

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
  refetch: () => Promise<void>;
};

export function useForeBalance(): UseForeBalanceResult {
  const { wallets } = useWallets();
  const account = wallets[0]?.address as Address | undefined;

  const network = getNetworkConfig();
  const foreToken = getContract("foreToken");

  const client = useMemo(
    () =>
      createPublicClient({
        chain:
          network.chainId === bscTestnet.id
            ? bscTestnet
            : {
                ...bscTestnet,
                id: network.chainId,
              },
        transport: http(network.rpcUrl),
      }),
    [network.chainId, network.rpcUrl]
  );

  const [balance, setBalance] = useState<ForeBalance | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchBalance = useCallback(async () => {
    if (!account) {
      setBalance(undefined);
      setError(undefined);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const [raw, decimals, symbol] = await Promise.all([
        client.readContract({
          address: foreToken.address as Address,
          abi: foreToken.abi,
          functionName: "balanceOf",
          args: [account],
        }) as Promise<bigint>,
        client.readContract({
          address: foreToken.address as Address,
          abi: foreToken.abi,
          functionName: "decimals",
        }) as Promise<number | bigint>,
        client.readContract({
          address: foreToken.address as Address,
          abi: foreToken.abi,
          functionName: "symbol",
        }) as Promise<string>,
      ]);

      const decimalValue =
        typeof decimals === "bigint" ? Number(decimals) : decimals;

      setBalance({
        raw,
        decimals: decimalValue,
        formatted: formatUnits(raw, decimalValue),
        symbol,
      });
    } catch (err) {
      setBalance(undefined);
      setError(
        err instanceof Error ? err.message : "Failed to fetch FORE balance"
      );
    } finally {
      setIsLoading(false);
    }
  }, [account, client, foreToken.address, foreToken.abi]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
