"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { Address, formatUnits } from "viem";

import { getContract, getNetworkConfig } from "@/config/contracts";
import { prophetPortfolioAbi } from "@/abis/prophetPortfolio";
import { useAllPredictions } from "./usePredictions";

export type LeaderboardEntry = {
  address: Address;
  rank: number;
  prophetScore: bigint;
  formattedProphetScore: string;
  totalPredictions: bigint;
  correctPredictions: bigint;
  totalEarnings: bigint;
  formattedEarnings: string;
  copiedPredictions: bigint;
  accuracy: number;
  hasPortfolio: boolean;
};

export function useLeaderboard() {
  const network = getNetworkConfig();
  const portfolio = getContract("prophetPortfolio");
  const publicClient = usePublicClient({ chainId: network.chainId });

  // Get all predictions to extract unique creators
  const { data: allPredictions, isLoading: isPredictionsLoading } =
    useAllPredictions();

  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ["leaderboard", network.chainId],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error("Public client unavailable");
      }
      if (!allPredictions || allPredictions.length === 0) {
        return [];
      }

      // Extract unique creator addresses
      const creatorAddresses = new Set<Address>();
      allPredictions.forEach((prediction) => {
        creatorAddresses.add(prediction.creator);
      });

      const uniqueCreators = Array.from(creatorAddresses);

      if (uniqueCreators.length === 0) {
        return [];
      }

      // Fetch portfolio data for all creators in parallel using multicall
      const portfolioResults = await publicClient.multicall({
        contracts: uniqueCreators.map(
          (creator) =>
            ({
              address: portfolio.address,
              abi: prophetPortfolioAbi,
              functionName: "getPortfolio",
              args: [creator],
            } as const)
        ),
        allowFailure: true,
      });

      // Combine addresses with their portfolio data
      const entries: LeaderboardEntry[] = [];

      for (let i = 0; i < uniqueCreators.length; i++) {
        const creator = uniqueCreators[i];
        const portfolioResult = portfolioResults[i];

        if (!portfolioResult || portfolioResult.status !== "success") {
          // User might not have a portfolio yet, but we can still include them with default values
          entries.push({
            address: creator,
            rank: 0, // Will be set after sorting
            prophetScore: BigInt(0),
            formattedProphetScore: "0",
            totalPredictions: BigInt(0),
            correctPredictions: BigInt(0),
            totalEarnings: BigInt(0),
            formattedEarnings: "0",
            copiedPredictions: BigInt(0),
            accuracy: 0,
            hasPortfolio: false,
          });
          continue;
        }

        const portfolioData = portfolioResult.result as {
          tokenId: bigint;
          owner: Address;
          prophetScore: bigint;
          totalPredictions: bigint;
          correctPredictions: bigint;
          totalEarnings: bigint;
          createdAt: bigint;
          copiedPredictions: bigint;
        };

        const totalPredictions = portfolioData.totalPredictions;
        const correctPredictions = portfolioData.correctPredictions;
        const accuracy =
          totalPredictions > BigInt(0)
            ? Math.round(
                Number((correctPredictions * BigInt(100)) / totalPredictions)
              )
            : 0;

        entries.push({
          address: creator,
          rank: 0, // Will be set after sorting
          prophetScore: portfolioData.prophetScore,
          formattedProphetScore: formatUnits(portfolioData.prophetScore, 18),
          totalPredictions,
          correctPredictions,
          totalEarnings: portfolioData.totalEarnings,
          formattedEarnings: formatUnits(portfolioData.totalEarnings, 18),
          copiedPredictions: portfolioData.copiedPredictions,
          accuracy,
          hasPortfolio: true,
        });
      }

      // Sort by prophet score (descending), then by total earnings, then by accuracy
      entries.sort((a, b) => {
        // First sort by prophet score
        if (a.prophetScore > b.prophetScore) return -1;
        if (a.prophetScore < b.prophetScore) return 1;

        // If scores are equal, sort by earnings
        if (a.totalEarnings > b.totalEarnings) return -1;
        if (a.totalEarnings < b.totalEarnings) return 1;

        // If earnings are equal, sort by accuracy
        if (a.accuracy > b.accuracy) return -1;
        if (a.accuracy < b.accuracy) return 1;

        return 0;
      });

      // Assign ranks
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return entries;
    },
    enabled:
      Boolean(publicClient) && !isPredictionsLoading && Boolean(allPredictions),
    staleTime: 60_000, // Leaderboard updates less frequently
    refetchInterval: 120_000, // Refresh every 2 minutes
  });
}

