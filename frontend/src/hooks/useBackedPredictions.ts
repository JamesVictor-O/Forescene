"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { Address, formatUnits } from "viem";

import { getContract, getNetworkConfig } from "@/config/contracts";
import { predictionMarketAbi } from "@/abis/predictionMarket";
import { useAllPredictions, type PredictionRecord } from "./usePredictions";

export type BackedPrediction = PredictionRecord & {
  stakeFor: bigint;
  stakeAgainst: bigint;
  totalStaked: bigint;
  stakeSide: "for" | "against" | "both";
  formattedStakeFor: string;
  formattedStakeAgainst: string;
  formattedTotalStaked: string;
};

export function useBackedPredictions(address?: Address) {
  const { address: connectedAddress } = useAccount();
  const targetAddress = (address ?? connectedAddress)?.toLowerCase();
  const network = getNetworkConfig();
  const market = getContract("predictionMarket");
  const publicClient = usePublicClient({ chainId: network.chainId });

  // Get all predictions first
  const { data: allPredictions, isLoading: isPredictionsLoading } =
    useAllPredictions();

  return useQuery<BackedPrediction[], Error>({
    queryKey: ["backed-predictions", network.chainId, targetAddress],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error("Public client unavailable");
      }
      if (!targetAddress) {
        return [];
      }
      if (!allPredictions || allPredictions.length === 0) {
        return [];
      }

      // Filter to only active predictions (user might have staked on expired ones too, but let's focus on active)
      const activePredictions = allPredictions.filter(
        (p) => p.isActive && p.status === "ACTIVE"
      );

      if (activePredictions.length === 0) {
        return [];
      }

      // Fetch positions for all predictions in parallel using multicall
      const positionResults = await publicClient.multicall({
        contracts: activePredictions.map(
          (prediction) =>
            ({
              address: market.address,
              abi: predictionMarketAbi,
              functionName: "getPosition",
              args: [BigInt(prediction.id), targetAddress as Address],
            } as const)
        ),
        allowFailure: true,
      });

      // Combine predictions with their positions
      const backedPredictions: BackedPrediction[] = [];

      for (let i = 0; i < activePredictions.length; i++) {
        const prediction = activePredictions[i];
        const positionResult = positionResults[i];

        if (!positionResult || positionResult.status !== "success") {
          continue;
        }

        const position = positionResult.result as {
          forAmount: bigint;
          againstAmount: bigint;
        };

        const stakeFor = position.forAmount;
        const stakeAgainst = position.againstAmount;
        const totalStaked = stakeFor + stakeAgainst;

        // Only include predictions where user has actually staked
        if (totalStaked === BigInt(0)) {
          continue;
        }

        // Determine stake side
        let stakeSide: "for" | "against" | "both";
        if (stakeFor > BigInt(0) && stakeAgainst > BigInt(0)) {
          stakeSide = "both";
        } else if (stakeFor > BigInt(0)) {
          stakeSide = "for";
        } else {
          stakeSide = "against";
        }

        backedPredictions.push({
          ...prediction,
          stakeFor,
          stakeAgainst,
          totalStaked,
          stakeSide,
          formattedStakeFor: formatUnits(stakeFor, 18),
          formattedStakeAgainst: formatUnits(stakeAgainst, 18),
          formattedTotalStaked: formatUnits(totalStaked, 18),
        });
      }

      // Sort by total staked amount (descending)
      backedPredictions.sort((a, b) => {
        if (a.totalStaked > b.totalStaked) return -1;
        if (a.totalStaked < b.totalStaked) return 1;
        return 0;
      });

      return backedPredictions;
    },
    enabled:
      Boolean(publicClient) &&
      Boolean(targetAddress) &&
      !isPredictionsLoading &&
      Boolean(allPredictions),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

