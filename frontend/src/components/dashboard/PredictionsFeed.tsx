"use client";

import React from "react";
import { Clock, Users, Video } from "lucide-react";

import type { PredictionRecord } from "@/hooks/usePredictions";

type PredictionsFeedProps = {
  predictions: PredictionRecord[];
};

export default function PredictionsFeed({ predictions }: PredictionsFeedProps) {
  if (!predictions.length) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 text-center text-sm text-zinc-500">
        No predictions found yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {predictions.map((prediction) => (
        <PredictionCard key={prediction.id} prediction={prediction} />
      ))}
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: PredictionRecord }) {
  const display = extractDisplayFields(prediction);

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
          <StatusBadge status={prediction.status} />
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 pb-4 border-b border-zinc-800/60">
          <Stat label="Creator Fee" value={`${display.creatorFeeBps} bps`} />
          <Stat label="Copy Count" value={String(prediction.copyCount)} />
          <Stat
            label="Pool Odds"
            value={`${display.oddsFor.toFixed(
              2
            )} : ${display.oddsAgainst.toFixed(2)}`}
            highlight
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {prediction.format === "video" && display.contentUrl && (
            <a
              href={display.contentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-200 rounded-md hover:bg-cyan-500/20 transition"
            >
              <Video className="w-4 h-4" />
              Watch on IPFS
            </a>
          )}
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-950/60 border border-zinc-800/70 text-xs font-semibold rounded-md">
            ID #{prediction.id}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PredictionRecord["status"] }) {
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

function extractDisplayFields(prediction: PredictionRecord) {
  const metadata = (prediction.metadata ?? {}) as Record<string, unknown>;
  const title =
    typeof metadata.title === "string"
      ? metadata.title
      : typeof metadata.content === "string"
      ? metadata.content
      : `Prediction #${prediction.id}`;
  const summary =
    typeof metadata.summary === "string"
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
