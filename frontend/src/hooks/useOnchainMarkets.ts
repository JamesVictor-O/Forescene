import { useEffect, useState, useCallback } from "react";
import { createPublicClient, http } from "viem";
import { predictionManagerAbi } from "@/abis/predictionManager";
import { getContract, getNetworkConfig } from "@/config/contracts";

export type OnchainMarket = {
  id: number;
  marketType?: number;
  question: string;
  category: string;
  oracle: string;
  deadlineTimestamp: number;
  status: number;
  totalStaked?: bigint;
  initialOutcomeLabel?: string;
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
              marketType: Number(m[0]),
              oracle: m[1],
              marketStartTimestamp: Number(m[2]),
              deadlineTimestamp: Number(m[3]),
              totalYesStakedRaw: m[4],
              totalNoStakedRaw: m[5],
              totalYesStakedWeighted: m[6],
              totalNoStakedWeighted: m[7],
              platformFeeBps: m[8],
              status: Number(m[9]),
              winningOutcome: Number(m[10]),
              question: m[11] || "",
              category: m[12] || "",
              initialOutcomeLabel: m[13] || "",
              creator: m[14],
            };
          } catch (err) {
            return null;
          }
        })
      );

      const active = results
        .filter(Boolean)
        .filter((m) => (m as any).status === 0)
        .map((m) => {
          const yesStaked = (m as any).totalYesStakedRaw || BigInt(0);
          const noStaked = (m as any).totalNoStakedRaw || BigInt(0);
          return {
            id: (m as any).id,
            marketType: (m as any).marketType ?? 1, // Default to Binary if not set
            question: (m as any).question || "",
            category: (m as any).category || "",
            oracle: (m as any).oracle || "",
            deadlineTimestamp: (m as any).deadlineTimestamp,
            status: (m as any).status,
            totalStaked: yesStaked + noStaked,
            initialOutcomeLabel: (m as any).initialOutcomeLabel || "",
          };
        });

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
