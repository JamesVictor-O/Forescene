"use client";

import React, { useMemo } from "react";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  DollarSign,
  Target,
} from "lucide-react";
import { useAccount } from "wagmi";
import { Address } from "viem";

import { useLeaderboard, type LeaderboardEntry } from "@/hooks/useLeaderboard";
import LoadingSkeleton from "./LoadingSkeleton";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useLeaderboard();
  const { address: connectedAddress } = useAccount();

  const currentUserEntry = useMemo(() => {
    if (!connectedAddress || !leaderboard) return null;
    return leaderboard.find(
      (entry) => entry.address.toLowerCase() === connectedAddress.toLowerCase()
    );
  }, [connectedAddress, leaderboard]);

  const topThree = useMemo(() => {
    if (!leaderboard) return [];
    return leaderboard.slice(0, 3);
  }, [leaderboard]);

  const restOfLeaderboard = useMemo(() => {
    if (!leaderboard) return [];
    return leaderboard.slice(3);
  }, [leaderboard]);

  if (isLoading) {
    return (
      <LoadingSkeleton message="Loading leaderboard…" variant="list" rows={5} />
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 text-center text-sm text-zinc-500">
        No leaderboard data available yet. Create predictions to get on the
        board!
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6">
      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">
            Top Prophets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {topThree.map((entry, index) => {
              const position = index + 1;
              const isCurrentUser = Boolean(
                connectedAddress &&
                  entry.address.toLowerCase() === connectedAddress.toLowerCase()
              );

              return (
                <PodiumCard
                  key={entry.address}
                  entry={entry}
                  position={position}
                  isCurrentUser={isCurrentUser}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Current User Highlight */}
      {currentUserEntry && currentUserEntry.rank > 3 && (
        <div className="bg-cyan-500/10 border border-cyan-500/40 rounded-xl p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">
                #{currentUserEntry.rank}
              </div>
              <div>
                <div className="font-semibold text-sm sm:text-base text-white">
                  Your Rank
                </div>
                <div className="text-xs sm:text-sm text-zinc-400">
                  {shortenAddress(currentUserEntry.address)}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-base sm:text-lg font-bold text-cyan-400">
                {formatNumber(currentUserEntry.formattedProphetScore)} pts
              </div>
              <div className="text-xs text-zinc-400">
                {currentUserEntry.accuracy}% accuracy
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard - Mobile Cards / Desktop Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-zinc-800/60">
          <h2 className="text-lg sm:text-xl font-bold">Full Leaderboard</h2>
        </div>

        {/* Mobile: Card Layout */}
        <div className="block sm:hidden divide-y divide-zinc-800/60">
          {restOfLeaderboard.map((entry) => {
            const isCurrentUser = Boolean(
              connectedAddress &&
                entry.address.toLowerCase() === connectedAddress.toLowerCase()
            );

            return (
              <LeaderboardCard
                key={entry.address}
                entry={entry}
                isCurrentUser={isCurrentUser}
              />
            );
          })}
        </div>

        {/* Desktop: Table Layout */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-950/60 border-b border-zinc-800/60">
              <tr>
                <th className="px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Rank
                </th>
                <th className="px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Address
                </th>
                <th className="px-3 lg:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Score
                </th>
                <th className="px-3 lg:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Accuracy
                </th>
                <th className="px-3 lg:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Predictions
                </th>
                <th className="px-3 lg:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Earnings
                </th>
                <th className="px-3 lg:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Copies
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {restOfLeaderboard.map((entry) => {
                const isCurrentUser = Boolean(
                  connectedAddress &&
                    entry.address.toLowerCase() ===
                      connectedAddress.toLowerCase()
                );

                return (
                  <tr
                    key={entry.address}
                    className={`hover:bg-zinc-900/60 transition-colors ${
                      isCurrentUser ? "bg-cyan-500/10" : ""
                    }`}
                  >
                    <td className="px-3 lg:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {entry.rank <= 3 ? (
                          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
                        ) : (
                          <span className="text-xs sm:text-sm font-semibold text-zinc-400">
                            #{entry.rank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center rounded-sm text-[10px] sm:text-xs shrink-0">
                          {entry.address.slice(2, 4).toUpperCase()}
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-medium truncate ${
                            isCurrentUser ? "text-cyan-400" : "text-white"
                          }`}
                        >
                          {shortenAddress(entry.address)}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded shrink-0">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 py-2 sm:py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-cyan-400">
                          {formatNumber(entry.formattedProphetScore)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 py-2 sm:py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-emerald-400">
                          {entry.accuracy}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 py-2 sm:py-3 text-right">
                      <span className="text-xs sm:text-sm text-zinc-300">
                        {Number(entry.totalPredictions)}
                      </span>
                    </td>
                    <td className="px-3 lg:px-4 py-2 sm:py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-green-400">
                          {formatNumber(entry.formattedEarnings)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 py-2 sm:py-3 text-right">
                      <span className="text-xs sm:text-sm text-zinc-300">
                        {Number(entry.copiedPredictions)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({
  entry,
  position,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  position: number;
  isCurrentUser: boolean;
}) {
  const positionConfig = {
    1: {
      icon: Trophy,
      bg: "bg-yellow-500/20",
      border: "border-yellow-500/40",
      text: "text-yellow-400",
      label: "🥇 1st Place",
      height: "min-h-[200px] sm:min-h-[240px]",
    },
    2: {
      icon: Medal,
      bg: "bg-zinc-400/20",
      border: "border-zinc-400/40",
      text: "text-zinc-300",
      label: "🥈 2nd Place",
      height: "min-h-[180px] sm:min-h-[200px]",
    },
    3: {
      icon: Award,
      bg: "bg-orange-500/20",
      border: "border-orange-500/40",
      text: "text-orange-400",
      label: "🥉 3rd Place",
      height: "min-h-[160px] sm:min-h-[180px]",
    },
  }[position] || {
    icon: Trophy,
    bg: "bg-zinc-900/60",
    border: "border-zinc-800/60",
    text: "text-zinc-400",
    label: `#${position}`,
    height: "min-h-[140px] sm:min-h-[160px]",
  };

  const Icon = positionConfig.icon;

  return (
    <div
      className={`${positionConfig.bg} ${
        positionConfig.border
      } border-2 rounded-xl p-4 sm:p-6 ${
        positionConfig.height
      } flex flex-col justify-between ${
        isCurrentUser ? "ring-2 ring-cyan-500" : ""
      }`}
    >
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${positionConfig.text}`} />
        </div>
        <div
          className={`text-xs sm:text-sm font-bold mb-1 ${positionConfig.text}`}
        >
          {positionConfig.label}
        </div>
        {isCurrentUser && (
          <div className="text-[10px] sm:text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded mb-2 inline-block">
            You
          </div>
        )}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center rounded-full mx-auto mb-2 sm:mb-3 text-sm sm:text-lg">
          {entry.address.slice(2, 4).toUpperCase()}
        </div>
        <div className="text-[10px] sm:text-xs text-zinc-400 mb-3 sm:mb-4">
          {shortenAddress(entry.address)}
        </div>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-zinc-500">Score</span>
          <span
            className={`text-xs sm:text-sm font-bold ${positionConfig.text}`}
          >
            {formatNumber(entry.formattedProphetScore)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-zinc-500">Accuracy</span>
          <span className="text-xs sm:text-sm font-semibold text-emerald-400">
            {entry.accuracy}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-zinc-500">
            Predictions
          </span>
          <span className="text-xs sm:text-sm font-semibold text-white">
            {Number(entry.totalPredictions)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-zinc-500">Earnings</span>
          <span className="text-xs sm:text-sm font-semibold text-green-400">
            {formatNumber(entry.formattedEarnings)}
          </span>
        </div>
      </div>
    </div>
  );
}

function LeaderboardCard({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`p-3 sm:p-4 ${
        isCurrentUser ? "bg-cyan-500/10" : "hover:bg-zinc-900/60"
      } transition-colors`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            {entry.rank <= 3 ? (
              <Trophy className="w-4 h-4 text-yellow-500" />
            ) : (
              <span className="text-sm font-semibold text-zinc-400 w-8">
                #{entry.rank}
              </span>
            )}
            <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center rounded-sm text-xs">
              {entry.address.slice(2, 4).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium truncate ${
                  isCurrentUser ? "text-cyan-400" : "text-white"
                }`}
              >
                {shortenAddress(entry.address)}
              </span>
              {isCurrentUser && (
                <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded shrink-0">
                  You
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-2">
          <div className="text-[10px] text-zinc-500 mb-1">Score</div>
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-cyan-500" />
            <span className="text-xs font-semibold text-cyan-400">
              {formatNumber(entry.formattedProphetScore)}
            </span>
          </div>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-2">
          <div className="text-[10px] text-zinc-500 mb-1">Accuracy</div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-400">
              {entry.accuracy}%
            </span>
          </div>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-2">
          <div className="text-[10px] text-zinc-500 mb-1">Predictions</div>
          <span className="text-xs font-semibold text-white">
            {Number(entry.totalPredictions)}
          </span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-2">
          <div className="text-[10px] text-zinc-500 mb-1">Earnings</div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-green-500" />
            <span className="text-xs font-semibold text-green-400">
              {formatNumber(entry.formattedEarnings)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function shortenAddress(address: Address | string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatNumber(value: string): string {
  const num = parseFloat(value);
  if (num === 0) return "0";
  if (num < 0.01) return "< 0.01";
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(2);
}
