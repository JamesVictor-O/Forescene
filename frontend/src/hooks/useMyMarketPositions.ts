import { useEffect, useState, useCallback } from "react";
import { createPublicClient, http } from "viem";
import { predictionManagerAbi } from "@/abis/predictionManager";
import { getContract, getNetworkConfig } from "@/config/contracts";
import type { OnchainMarket } from "./useOnchainMarkets";

export type UserPosition = {
  marketId: number;
  yesAmountRaw: bigint;
  noAmountRaw: bigint;
  yesAmountWeighted: bigint;
  noAmountWeighted: bigint;
};

const BLOCKDAG_RPC = "https://rpc.awakening.bdagscan.com";

export function useMyMarketPositions(
  markets: OnchainMarket[],
  account?: string
) {
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictionManager = getContract("predictionManager");
  const chainId = getNetworkConfig().chainId;

  const fetchPositions = useCallback(async () => {
    if (!account) {
      setPositions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const client = createPublicClient({
        chain: {
          id: chainId,
          name: getNetworkConfig().name,
          nativeCurrency: { name: "BDAG", symbol: "BDAG", decimals: 18 },
          rpcUrls: { default: { http: [BLOCKDAG_RPC] } },
        },
        transport: http(BLOCKDAG_RPC),
      });

      const results = await Promise.all(
        markets.map(async (m) => {
          try {
            const stake = (await client.readContract({
              address: predictionManager.address,
              abi: predictionManagerAbi,
              functionName: "userStakes",
              args: [BigInt(m.id), account],
            })) as any;
            return {
              marketId: m.id,
              yesAmountWeighted: stake[0] as bigint,
              noAmountWeighted: stake[1] as bigint,
              yesAmountRaw: stake[2] as bigint,
              noAmountRaw: stake[3] as bigint,
            } satisfies UserPosition;
          } catch (err) {
            return null;
          }
        })
      );

      setPositions(results.filter(Boolean) as UserPosition[]);
    } catch (e: any) {
      setError(e?.message || "Failed to load positions");
    } finally {
      setLoading(false);
    }
  }, [account, chainId, markets, predictionManager.address]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return { positions, loading, error, refetch: fetchPositions };
}
