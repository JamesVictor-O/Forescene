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
  mediaType?: "video" | "image" | "text";
  mediaCid?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  textContent?: string;
  title?: string;
  summary?: string;
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
  const gatewayCandidates = [
    DEFAULT_GATEWAY,
    process.env.NEXT_PUBLIC_PINATA_GATEWAY,
    "https://ipfs.io/ipfs",
    "https://cloudflare-ipfs.com/ipfs",
  ]
    .filter(Boolean)
    .map((url) => url!.replace(/\/$/, ""));

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

          let resolvedContentUrl = `${gateway}/${prediction.contentCID}`;
          let metadata: Record<string, unknown> | undefined;
          for (const base of gatewayCandidates) {
            const candidateUrl = `${base}/${prediction.contentCID}`;
            try {
              const response = await fetch(candidateUrl, {
                method: "GET",
                headers: { Accept: "application/json, text/plain;q=0.9, */*;q=0.8" },
              });
              if (!response.ok) {
                continue;
              }
              resolvedContentUrl = candidateUrl;
              const contentType = response.headers.get("content-type") ?? "";
              if (contentType.includes("application/json")) {
                metadata = (await response.json()) as Record<string, unknown>;
              }
              break;
            } catch {
              // Try next gateway
            }
          }

          let mediaType: PredictionRecord["mediaType"];
          let mediaCid: string | undefined;
          let mediaUrl: string | undefined;
          let mediaMimeType: string | undefined;
          let textContent: string | undefined;
          let title: string | undefined;
          let summary: string | undefined;

          if (metadata) {
            title =
              typeof metadata.title === "string" ? metadata.title : undefined;
            summary =
              typeof metadata.summary === "string" ? metadata.summary : undefined;
            const formatField =
              typeof metadata.format === "string"
                ? metadata.format.toLowerCase()
                : undefined;
            if (formatField === "video" || prediction.format === 0) {
              mediaType = "video";
            } else if (formatField === "image") {
              mediaType = "image";
            } else {
              mediaType = "text";
            }

            const media = metadata.media as
              | {
                  cid?: string;
                  url?: string;
                  mimeType?: string;
                  posterCid?: string;
                  posterUrl?: string;
                }
              | undefined;

            if (media) {
              mediaCid = typeof media.cid === "string" ? media.cid : undefined;
              mediaMimeType =
                typeof media.mimeType === "string" ? media.mimeType : undefined;
              mediaUrl =
                typeof media.url === "string"
                  ? media.url
                  : mediaCid
                  ? `${gateway}/${mediaCid}`
                  : undefined;
            }

            if (mediaType === "text") {
              if (typeof metadata.content === "string") {
                textContent = metadata.content;
              } else if (typeof metadata.body === "string") {
                textContent = metadata.body;
              }
            }
          } else {
            // Fallback for legacy predictions where CID points directly to media/text
            if (FORMAT_LABEL[prediction.format] === "text") {
              mediaType = "text";
            } else {
              mediaType = "video";
            }
          }

          const finalContentUrl =
            mediaUrl ??
            (mediaCid ? `${gateway}/${mediaCid}` : resolvedContentUrl);

          return {
            id: Number(prediction.id),
            creator: prediction.creator,
            contentCid: prediction.contentCID,
            contentUrl: finalContentUrl,
            format: FORMAT_LABEL[prediction.format] ?? "text",
            mediaType,
            mediaCid,
            mediaUrl: finalContentUrl,
            mediaMimeType,
            textContent,
            title,
            summary,
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
