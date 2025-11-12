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
  // Pool data
  totalStaked?: bigint;
  forPool?: bigint;
  againstPool?: bigint;
  formattedTotalStaked?: string;
  formattedForPool?: string;
  formattedAgainstPool?: string;
};

const DEFAULT_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "https://gateway.pinata.cloud/ipfs";

type CachedContent = {
  url: string;
  metadata?: Record<string, unknown>;
  pinataMetadata?: { name?: string };
};

const CONTENT_CACHE = new Map<string, CachedContent>();

/**
 * Validates if a string looks like a valid IPFS CID
 */
function isValidCID(cid: string): boolean {
  if (!cid || typeof cid !== "string") return false;
  const trimmed = cid.trim();

  // Reject obvious test/invalid CIDs first
  if (trimmed.toLowerCase().includes("test") || trimmed === "testcid")
    return false;

  if (trimmed.length < 10 || trimmed.length > 200) return false;

  // Check if it looks like a valid CID format
  // CIDs are base58 (v0) or base32 (v1) encoded, so alphanumeric only
  // v0: Qm... (46 chars), v1: bafy... or similar
  return (
    /^[a-zA-Z0-9]+$/.test(trimmed) &&
    (trimmed.startsWith("Qm") || trimmed.startsWith("b"))
  );
}

/**
 * Fetches Pinata metadata for a given CID (non-blocking, optional)
 * Only called when necessary to avoid rate limiting
 */
async function fetchPinataMetadata(
  cid: string
): Promise<{ name?: string } | null> {
  if (!isValidCID(cid)) return null;

  const apiKey = process.env.NEXT_PUBLIC_PINATA_API;
  const secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET;

  if (!apiKey || !secretKey) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(
      `https://api.pinata.cloud/data/pinList?hashContains=${cid}`,
      {
        method: "GET",
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: secretKey,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      rows?: Array<{ metadata?: { name?: string } }>;
    };

    const pin = data.rows?.[0];
    if (pin?.metadata?.name) {
      return { name: pin.metadata.name };
    }

    return null;
  } catch {
    return null;
  }
}

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
  // Prioritize Pinata gateway, then public gateways as fallback
  // Limit to 2 gateways to reduce requests
  const gatewayCandidates = [
    DEFAULT_GATEWAY,
    process.env.NEXT_PUBLIC_PINATA_GATEWAY,
  ]
    .filter(Boolean)
    .map((url) => url!.replace(/\/$/, ""))
    .slice(0, 2); // Only try first 2 gateways to reduce requests

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

      const [predictionResults, copyCountResults] = await Promise.all([
        publicClient.multicall({
          contracts: ids.map(
            (id) =>
              ({
                address: registry.address,
                abi: predictionRegistryAbi,
                functionName: "getPrediction",
                args: [id],
              } as const)
          ),
          allowFailure: true,
        }),
        publicClient.multicall({
          contracts: ids.map(
            (id) =>
              ({
                address: registry.address,
                abi: predictionRegistryAbi,
                functionName: "getCopyCount",
                args: [id],
              } as const)
          ),
          allowFailure: true,
        }),
      ]);

      const predictions: (PredictionRecord | null)[] = await Promise.all(
        ids.map(async (id, index): Promise<PredictionRecord | null> => {
          const predictionResult = predictionResults[index];
          if (!predictionResult || predictionResult.status !== "success") {
            return null;
          }

          const prediction = predictionResult.result as unknown as {
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

          const copyCountResult = copyCountResults[index];
          const copyCount =
            copyCountResult && copyCountResult.status === "success"
              ? (copyCountResult.result as bigint)
              : BigInt(0);

          // Skip invalid CIDs to avoid unnecessary requests
          if (!isValidCID(prediction.contentCID)) {
            return null;
          }

          let resolvedContentUrl = `${gateway}/${prediction.contentCID}`;
          let metadata: Record<string, unknown> | undefined;

          const cached = CONTENT_CACHE.get(prediction.contentCID);
          let pinataMetadata: { name?: string } | null = null;

          if (cached) {
            resolvedContentUrl = cached.url;
            metadata = cached.metadata;
            pinataMetadata = cached.pinataMetadata ?? null;
          } else {
            // Only try to fetch metadata if it's a text prediction or we need to determine format
            // For video predictions, we'll skip metadata fetch unless we have a specific need
            const shouldFetchMetadata =
              FORMAT_LABEL[prediction.format] === "text" ||
              prediction.format === undefined;

            if (shouldFetchMetadata) {
              // Try gateways with timeout to avoid hanging
              for (const base of gatewayCandidates) {
                const candidateUrl = `${base}/${prediction.contentCID}`;
                try {
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout per gateway

                  const response = await fetch(candidateUrl, {
                    method: "GET",
                    headers: {
                      Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
                    },
                    signal: controller.signal,
                  });

                  clearTimeout(timeoutId);

                  if (!response.ok) {
                    continue;
                  }
                  resolvedContentUrl = candidateUrl;
                  const contentType =
                    response.headers.get("content-type") ?? "";
                  if (contentType.includes("application/json")) {
                    metadata = (await response.json()) as Record<
                      string,
                      unknown
                    >;
                  }
                  break;
                } catch {
                  // Try next gateway
                }
              }
            }

            // Only fetch Pinata metadata for video files if we don't have metadata and it's really needed
            // This is expensive, so we do it sparingly
            if (
              FORMAT_LABEL[prediction.format] === "video" &&
              !metadata &&
              !pinataMetadata
            ) {
              // Only fetch if we have credentials and CID is valid
              pinataMetadata = await fetchPinataMetadata(prediction.contentCID);
            }

            CONTENT_CACHE.set(prediction.contentCID, {
              url: resolvedContentUrl,
              metadata,
              pinataMetadata: pinataMetadata ?? undefined,
            });
          }

          let mediaType: PredictionRecord["mediaType"];
          let mediaCid: string | undefined;
          let mediaUrl: string | undefined;
          let mediaMimeType: string | undefined;
          let textContent: string | undefined;
          let title: string | undefined;
          let summary: string | undefined;

          if (metadata) {
            summary =
              typeof metadata.summary === "string"
                ? metadata.summary
                : undefined;
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

              // Extract title: prefer metadata.title, but if it's "Prediction" (default) or empty, use content
              const metadataTitle =
                typeof metadata.title === "string" && metadata.title.trim()
                  ? metadata.title.trim()
                  : undefined;

              if (metadataTitle && metadataTitle !== "Prediction") {
                title = metadataTitle;
              } else if (textContent) {
                // Use first line of content as title
                const firstLine = textContent.split("\n")[0].trim();
                if (firstLine && firstLine.length > 0) {
                  title =
                    firstLine.length > 100
                      ? firstLine.slice(0, 100) + "..."
                      : firstLine;
                }
              } else {
                // Fallback to Pinata metadata name
                title =
                  typeof metadata.name === "string" && metadata.name.trim()
                    ? metadata.name.trim()
                    : undefined;
              }
            } else {
              // For video/image, use metadata.title or metadata.name
              title =
                typeof metadata.title === "string" && metadata.title.trim()
                  ? metadata.title.trim()
                  : typeof metadata.name === "string" && metadata.name.trim()
                  ? metadata.name.trim()
                  : undefined;
            }
          } else {
            // Fallback for legacy predictions where CID points directly to media/text
            if (FORMAT_LABEL[prediction.format] === "text") {
              mediaType = "text";
              // Try to fetch content directly if metadata wasn't found
              // This handles cases where the CID points directly to text content
              try {
                const response = await fetch(resolvedContentUrl, {
                  method: "GET",
                  headers: {
                    Accept: "text/plain, application/json, */*",
                  },
                  signal: new AbortController().signal,
                });
                if (response.ok) {
                  const contentType =
                    response.headers.get("content-type") ?? "";
                  if (contentType.includes("application/json")) {
                    const jsonData = (await response.json()) as Record<
                      string,
                      unknown
                    >;
                    if (typeof jsonData.content === "string") {
                      textContent = jsonData.content;
                      const firstLine = textContent.split("\n")[0].trim();
                      if (firstLine && !title) {
                        title =
                          firstLine.length > 100
                            ? firstLine.slice(0, 100) + "..."
                            : firstLine;
                      }
                    }
                    if (
                      typeof jsonData.title === "string" &&
                      jsonData.title.trim() &&
                      jsonData.title !== "Prediction"
                    ) {
                      title = jsonData.title.trim();
                    }
                  } else if (
                    contentType.includes("text/plain") ||
                    contentType.includes("text/")
                  ) {
                    const text = await response.text();
                    textContent = text;
                    const firstLine = text.split("\n")[0].trim();
                    if (firstLine && !title) {
                      title =
                        firstLine.length > 100
                          ? firstLine.slice(0, 100) + "..."
                          : firstLine;
                    }
                  }
                }
              } catch {
                // Ignore fetch errors in fallback
              }
            } else {
              mediaType = "video";
            }
          }

          // Also check Pinata metadata for video files (after processing metadata)
          if (!title && pinataMetadata?.name) {
            title = pinataMetadata.name.trim();
          }

          // Final fallback: if still no title and we have textContent, use first line
          if (!title && textContent) {
            const firstLine = textContent.split("\n")[0].trim();
            if (firstLine) {
              title =
                firstLine.length > 100
                  ? firstLine.slice(0, 100) + "..."
                  : firstLine;
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

      const filteredPredictions: PredictionRecord[] = predictions.filter(
        (prediction): prediction is PredictionRecord =>
          prediction !== null && prediction !== undefined
      ) as PredictionRecord[];

      if (filteredPredictions.length === 0) {
        return [];
      }

      const oddsResults = await publicClient.multicall({
        contracts: filteredPredictions.map(
          (prediction) =>
            ({
              address: market.address,
              abi: market.abi,
              functionName: "getPool",
              args: [BigInt(prediction.id)],
            } as const)
        ),
        allowFailure: true,
      });

      const poolDataMap = new Map<
        number,
        {
          forPool: bigint;
          againstPool: bigint;
          totalStaked: bigint;
          oddsFor: number;
          oddsAgainst: number;
        }
      >();

      filteredPredictions.forEach((prediction, index) => {
        const oddsResult = oddsResults[index];
        if (oddsResult && oddsResult.status === "success") {
          const pool = oddsResult.result as {
            forPool: bigint;
            againstPool: bigint;
            totalStaked: bigint;
            feeBps: number;
          };

          poolDataMap.set(prediction.id, {
            forPool: pool.forPool,
            againstPool: pool.againstPool,
            totalStaked: pool.totalStaked,
            oddsFor: Number(formatUnits(pool.forPool, 18)),
            oddsAgainst: Number(formatUnits(pool.againstPool, 18)),
          });
        } else {
          poolDataMap.set(prediction.id, {
            forPool: BigInt(0),
            againstPool: BigInt(0),
            totalStaked: BigInt(0),
            oddsFor: 0,
            oddsAgainst: 0,
          });
        }
      });

      return filteredPredictions.map((prediction): PredictionRecord => {
        const poolData = poolDataMap.get(prediction.id) ?? {
          forPool: BigInt(0),
          againstPool: BigInt(0),
          totalStaked: BigInt(0),
          oddsFor: 0,
          oddsAgainst: 0,
        };

        return {
          ...prediction,
          totalStaked: poolData.totalStaked,
          forPool: poolData.forPool,
          againstPool: poolData.againstPool,
          formattedTotalStaked: formatUnits(poolData.totalStaked, 18),
          formattedForPool: formatUnits(poolData.forPool, 18),
          formattedAgainstPool: formatUnits(poolData.againstPool, 18),
          metadata: {
            ...prediction.metadata,
            odds: {
              for: poolData.oddsFor,
              against: poolData.oddsAgainst,
            },
          },
        };
      });
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
