"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { Address, formatUnits } from "viem";

import { getContract, getNetworkConfig } from "@/config/contracts";
import { predictionRegistryAbi } from "@/abis/predictionRegistry";

const STATUS_MAP = ["ACTIVE", "LOCKED", "RESOLVED", "CANCELLED"] as const;
const FORMAT_LABEL: Record<number, "video" | "text"> = {
  0: "video",
  1: "text",
};

export type PredictionStatus = (typeof STATUS_MAP)[number];

export type PredictionRecord = {
  id: number;
  creator: Address;
  contentCid: string;
  contentUrl: string;
  format: "video" | "text";
  category: string;
  deadline: number;
  lockTime: number;
  status: PredictionStatus;
  isActive: boolean;
  creatorFeeBps: number;
  copyCount: number;
  metadata?: Record<string, unknown>;
  timeRemaining?: string;
};

const DEFAULT_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "https://gateway.pinata.cloud/ipfs";

function formatTimeRemaining(deadline: number) {
  const diff = deadline * 1000 - Date.now();
  if (diff <= 0) return "Expired";

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function useAllPredictions() {
  const network = getNetworkConfig();
  const registry = getContract("predictionRegistry");
  const market = getContract("predictionMarket");
  const publicClient = usePublicClient({ chainId: network.chainId });

  return useQuery<PredictionRecord[], Error>({
    queryKey: ["predictions", network.chainId],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error("Public client unavailable");
      }
      const nextIdBig = (await publicClient.readContract({
        address: registry.address,
        abi: predictionRegistryAbi,
        functionName: "getNextPredictionId",
      })) as bigint;

      const nextId = Number(nextIdBig);
      if (Number.isNaN(nextId) || nextId <= 1) {
        return [];
      }

      const ids = Array.from({ length: nextId - 1 }, (_, index) =>
        BigInt(index + 1)
      );

      const gateway = DEFAULT_GATEWAY.replace(/\/$/, "");

      const predictions = await Promise.all(
        ids.map(async (id) => {
          const prediction = (await publicClient.readContract({
            address: registry.address,
            abi: predictionRegistryAbi,
            functionName: "getPrediction",
            args: [id],
          })) as unknown as {
            id: bigint;
            creator: Address;
            contentCID: string;
            format: number;
            category: string;
            deadline: bigint;
            lockTime: bigint;
            status: number;
            isActive: boolean;
            creatorFeeBps: number;
          };

          const copyCount = (await publicClient.readContract({
            address: registry.address,
            abi: predictionRegistryAbi,
            functionName: "getCopyCount",
            args: [id],
          })) as bigint;

          const contentUrl = `${gateway}/${prediction.contentCID}`;

          let metadata: Record<string, unknown> | undefined;
          if (FORMAT_LABEL[prediction.format] === "text") {
            try {
              const response = await fetch(contentUrl);
              if (response.ok) {
                metadata = await response.json();
              }
            } catch {
              // Ignore metadata fetch failures.
            }
          }

          return {
            id: Number(prediction.id),
            creator: prediction.creator,
            contentCid: prediction.contentCID,
            contentUrl,
            format: FORMAT_LABEL[prediction.format] ?? "text",
            category: prediction.category,
            deadline: Number(prediction.deadline),
            lockTime: Number(prediction.lockTime),
            status: STATUS_MAP[prediction.status] ?? "ACTIVE",
            isActive: prediction.isActive,
            creatorFeeBps: Number(prediction.creatorFeeBps),
            copyCount: Number(copyCount),
            metadata,
            timeRemaining: formatTimeRemaining(Number(prediction.deadline)),
          } satisfies PredictionRecord;
        })
      );

      const odds = await Promise.all(
        predictions.map(async (prediction) => {
          try {
            const pool = (await publicClient.readContract({
              address: market.address,
              abi: market.abi,
              functionName: "getPool",
              args: [BigInt(prediction.id)],
            })) as {
              forPool: bigint;
              againstPool: bigint;
              totalStaked: bigint;
              feeBps: number;
            };

            return {
              predictionId: prediction.id,
              for: Number(formatUnits(pool.forPool, 18)),
              against: Number(formatUnits(pool.againstPool, 18)),
            };
          } catch {
            return {
              predictionId: prediction.id,
              for: 0,
              against: 0,
            };
          }
        })
      );

      const oddsMap = new Map(odds.map((item) => [item.predictionId, item]));

      return predictions.map((prediction) => ({
        ...prediction,
        metadata: {
          ...prediction.metadata,
          odds: oddsMap.get(prediction.id) ?? { for: 0, against: 0 },
        },
      }));
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: Boolean(publicClient),
  });
}

export function useUserPredictions(address?: Address) {
  const { address: connectedAddress } = useAccount();
  const targetAddress = (address ?? connectedAddress)?.toLowerCase();
  const query = useAllPredictions();

  const filtered = query.data?.filter(
    (prediction) => prediction.creator.toLowerCase() === targetAddress
  );

  return {
    ...query,
    data: filtered ?? [],
  };
}
