import { useEffect, useState, useCallback } from "react";
import { createPublicClient, http } from "viem";
import { predictionManagerAbi } from "@/abis/predictionManager";
import { getContract, getNetworkConfig } from "@/config/contracts";

export type OnchainMarket = {
  id: number;
  contentCID: string;
  category: string;
  oracle: string;
  deadlineTimestamp: number;
  status: number; // 0 ACTIVE, 1 LOCKED, 2 RESOLVED
};

const BLOCKDAG_RPC = "https://rpc.awakening.bdagscan.com";

export function useOnchainMarkets() {
  const [markets, setMarkets] = useState<OnchainMarket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictionManager = getContract("predictionManager");
  const chainId = getNetworkConfig().chainId;

  const fetchMarkets = useCallback(async () => {
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

      const nextMarketId = (await client.readContract({
        address: predictionManager.address,
        abi: predictionManagerAbi,
        functionName: "nextMarketId",
      })) as bigint;

      const ids = Array.from(
        { length: Number(nextMarketId) - 1 },
        (_, i) => i + 1
      );
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const m = (await client.readContract({
              address: predictionManager.address,
              abi: predictionManagerAbi,
              functionName: "markets",
              args: [BigInt(id)],
            })) as any;
            return {
              id,
              oracle: m[0],
              deadlineTimestamp: Number(m[2]),
              totalYesStakedRaw: m[3],
              totalNoStakedRaw: m[4],
              totalYesStakedWeighted: m[5],
              totalNoStakedWeighted: m[6],
              platformFeeBps: m[7],
              status: Number(m[8]),
              winningOutcome: Number(m[9]),
              contentCID: m[10],
              category: m[11],
              creator: m[12],
            };
          } catch (err) {
            return null;
          }
        })
      );

      const active = results
        .filter(Boolean)
        .filter((m) => (m as any).status === 0)
        .map((m) => ({
          id: (m as any).id,
          contentCID: (m as any).contentCID,
          category: (m as any).category,
          oracle: (m as any).oracle,
          deadlineTimestamp: (m as any).deadlineTimestamp,
          status: (m as any).status,
        }));

      setMarkets(active);
    } catch (e: any) {
      setError(e?.message || "Failed to load markets");
    } finally {
      setLoading(false);
    }
  }, [chainId, predictionManager.address]);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return { markets, loading, error, refetch: fetchMarkets };
}
