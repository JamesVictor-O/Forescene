"use client";

import React from "react";
import Image from "next/image";
import { Clock, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatUnits } from "viem";

import type { BackedPrediction } from "@/hooks/useBackedPredictions";

type BackedPredictionsFeedProps = {
  predictions: BackedPrediction[];
};

export default function BackedPredictionsFeed({
  predictions,
}: BackedPredictionsFeedProps) {
  if (!predictions.length) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 text-center text-sm text-zinc-500">
        You haven't staked on any predictions yet. Start backing predictions from the Feed!
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {predictions.map((prediction) => (
        <BackedPredictionCard key={prediction.id} prediction={prediction} />
      ))}
    </div>
  );
}

function BackedPredictionCard({ prediction }: { prediction: BackedPrediction }) {
  const display = extractDisplayFields(prediction);

  // Determine stake side badge
  const stakeSideBadge = () => {
    if (prediction.stakeSide === "both") {
      return (
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 border border-purple-500/40 text-purple-200 rounded-full text-[11px] font-medium">
          <Minus className="w-3 h-3" />
          BOTH SIDES
        </div>
      );
    } else if (prediction.stakeSide === "for") {
      return (
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/10 border border-cyan-500/40 text-cyan-200 rounded-full text-[11px] font-medium">
          <TrendingUp className="w-3 h-3" />
          STAKED FOR
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/40 text-red-200 rounded-full text-[11px] font-medium">
          <TrendingDown className="w-3 h-3" />
          STAKED AGAINST
        </div>
      );
    }
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center rounded-sm">
              {display.avatar}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm sm:text-base text-white">
                {display.author}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide">
                {display.category}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stakeSideBadge()}
            <StatusBadge status={prediction.status} />
          </div>
        </div>

        {/* Content Rendering - Video, Image, or Text */}
        {prediction.mediaType === "video" && prediction.mediaUrl ? (
          <div className="w-full flex justify-center rounded-sm overflow-hidden bg-black mb-4">
            <video
              src={prediction.mediaUrl}
              className="w-full max-h-[480px] object-cover"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        ) : prediction.mediaType === "image" && prediction.mediaUrl ? (
          <div className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-sm overflow-hidden mb-4">
            <Image
              src={prediction.mediaUrl}
              alt={display.title}
              width={720}
              height={1024}
              className="w-full h-auto object-cover"
            />
          </div>
        ) : prediction.textContent ? (
          <div className="bg-zinc-950/50 border border-zinc-800/50 p-3 sm:p-4 md:p-5 mb-4 rounded-sm">
            <p className="text-base sm:text-lg md:text-xl font-bold leading-snug text-white">
              {prediction.textContent}
            </p>
          </div>
        ) : null}

        <div className="mb-4">
          <p className="text-base sm:text-lg md:text-xl font-semibold text-white mb-3 leading-snug">
            {display.title}
          </p>
          {display.summary && (
            <p className="text-xs sm:text-sm text-zinc-400 mb-3">
              {display.summary}
            </p>
          )}
          <div className="flex flex-col xs:flex-row xs:items-center xs:gap-4 text-xs sm:text-sm text-zinc-500 gap-2">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {display.deadline}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {display.backers} backers
            </div>
          </div>
        </div>

        {/* Stake Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 pb-4 border-b border-zinc-800/60">
          <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">
              Your Total Stake
            </div>
            <div className="text-lg font-bold text-white">
              {parseFloat(prediction.formattedTotalStaked).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}{" "}
              FORE
            </div>
            <div className="flex gap-3 mt-2 text-xs text-zinc-400">
              {prediction.stakeFor > BigInt(0) && (
                <span className="text-cyan-400">
                  FOR: {parseFloat(prediction.formattedStakeFor).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </span>
              )}
              {prediction.stakeAgainst > BigInt(0) && (
                <span className="text-red-400">
                  AGAINST: {parseFloat(prediction.formattedStakeAgainst).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </span>
              )}
            </div>
          </div>
          <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">
              Total Pool Staked
            </div>
            <div className="text-lg font-bold text-cyan-400">
              {prediction.totalStaked !== undefined
                ? formatStakeAmount(formatUnits(prediction.totalStaked, 18))
                : "0"}{" "}
              FORE
            </div>
            <div className="flex gap-3 mt-2 text-xs text-zinc-400">
              <span className="text-cyan-300">
                FOR: {prediction.formattedForPool 
                  ? formatStakeAmount(prediction.formattedForPool)
                  : "0"}
              </span>
              <span className="text-red-300">
                AGAINST: {prediction.formattedAgainstPool 
                  ? formatStakeAmount(prediction.formattedAgainstPool)
                  : "0"}
              </span>
            </div>
          </div>
          <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">
              Pool Odds
            </div>
            <div className="text-sm sm:text-base font-semibold text-cyan-400">
              {display.oddsFor.toFixed(2)} : {display.oddsAgainst.toFixed(2)}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              Current market odds
            </div>
          </div>
          <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">
              Backers
            </div>
            <div className="text-lg font-bold text-white">
              {prediction.copyCount.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              Total copies/stakes
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 pb-4 border-b border-zinc-800/60">
          <Stat label="Creator Fee" value={`${display.creatorFeeBps} bps`} />
          <Stat label="Copy Count" value={String(prediction.copyCount)} />
          <Stat label="Prediction ID" value={`#${prediction.id}`} />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-950/60 border border-zinc-800/70 text-xs font-semibold rounded-md">
            Total Staked: {parseFloat(prediction.formattedTotalStaked).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}{" "}
            FORE
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: BackedPrediction["status"] }) {
  const statusClass =
    status === "ACTIVE"
      ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-200"
      : status === "RESOLVED"
      ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-200"
      : "bg-zinc-900/60 border border-zinc-800/60 text-zinc-300";

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium ${statusClass}`}
    >
      {status}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-3">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">
        {label}
      </div>
      <div
        className={`text-sm sm:text-base font-semibold ${
          highlight ? "text-cyan-400" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function formatStakeAmount(amount: string): string {
  const num = parseFloat(amount);
  if (num === 0) return "0";
  if (num < 0.01) return "< 0.01";
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(2);
}

function extractDisplayFields(prediction: BackedPrediction) {
  const metadata = (prediction.metadata ?? {}) as Record<string, unknown>;
  // Use title from prediction record (which includes Pinata metadata.name)
  // Fallback to textContent for text predictions, then metadata, then ID
  const title =
    typeof prediction.title === "string" && prediction.title.trim()
      ? prediction.title.trim()
      : typeof prediction.textContent === "string" && prediction.textContent.trim()
      ? prediction.textContent.split("\n")[0].trim().slice(0, 100)
      : typeof metadata.title === "string" && metadata.title.trim()
      ? metadata.title.trim()
      : typeof metadata.name === "string" && metadata.name.trim()
      ? metadata.name.trim()
      : typeof metadata.content === "string" && metadata.content.trim()
      ? metadata.content.trim().slice(0, 100)
      : `Prediction #${prediction.id}`;
  const summary =
    typeof prediction.summary === "string"
      ? prediction.summary
      : typeof metadata.summary === "string"
      ? metadata.summary
      : typeof metadata.description === "string"
      ? metadata.description
      : undefined;
  const oddsData = metadata.odds as
    | { for?: number; against?: number }
    | undefined;

  const deadlineDate = new Date(prediction.deadline * 1000);
  const deadlineLabel = isNaN(deadlineDate.getTime())
    ? "TBD"
    : deadlineDate.toLocaleDateString();

  const creatorShort = `${prediction.creator.slice(
    0,
    6
  )}…${prediction.creator.slice(-4)}`;

  return {
    title,
    summary,
    author: creatorShort,
    avatar: prediction.creator.slice(2, 4).toUpperCase(),
    category: prediction.category,
    backers: prediction.copyCount.toLocaleString(),
    deadline: deadlineLabel,
    creatorFeeBps: prediction.creatorFeeBps,
    oddsFor: Number(oddsData?.for ?? 0),
    oddsAgainst: Number(oddsData?.against ?? 0),
    contentUrl: prediction.contentUrl,
  };
}

