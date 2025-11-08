import React from "react";
import { Clock, Users, Video, ThumbsUp, ThumbsDown } from "lucide-react";

type Prediction = {
  id: number;
  user: string;
  avatar: string;
  prediction: string;
  category: string;
  confidence: number;
  backers: number;
  stake: string;
  deadline: string;
  status: string;
  odds: string;
};

export default function PredictionsFeed({
  predictions,
}: {
  predictions: Prediction[];
}) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {predictions.map((pred) => (
        <PredictionCard key={pred.id} prediction={pred} />
      ))}
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: Prediction }) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center rounded-sm">
            {prediction.avatar}
          </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm sm:text-base text-white">
                {prediction.user}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide">
                {prediction.category}
              </div>
            </div>
          </div>
          <div className="inline-flex items-center px-3 py-1 bg-zinc-950/60 border border-zinc-800/60 rounded-full text-[11px] font-medium text-cyan-400 w-fit self-start sm:self-auto">
            Active
          </div>
        </div>
        <div className="mb-4">
          <p className="text-base sm:text-lg md:text-xl font-semibold text-white mb-3 leading-snug">
            {prediction.prediction}
          </p>
          <div className="flex flex-col xs:flex-row xs:items-center xs:gap-4 text-xs sm:text-sm text-zinc-500 gap-2">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {prediction.deadline}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {prediction.backers.toLocaleString()} backers
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 pb-4 border-b border-zinc-800/60">
          <Stat label="Confidence" value={`${prediction.confidence}%`} />
          <Stat label="Stake" value={prediction.stake} />
          <Stat
            label="Potential"
            value={prediction.odds}
            highlight
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button className="flex-1 px-4 py-2.5 bg-cyan-500/80 text-zinc-950 font-semibold text-sm hover:bg-cyan-500 transition flex items-center justify-center rounded-lg shadow-[0_8px_24px_rgba(34,211,238,0.35)]">
            <ThumbsUp className="w-4 h-4 mr-2" />
            Believe
          </button>
          <button className="flex-1 sm:flex-none sm:px-4 py-2.5 bg-zinc-950/60 border border-zinc-800/70 font-semibold text-sm hover:border-cyan-500/50 transition flex items-center justify-center rounded-lg">
            <ThumbsDown className="w-4 h-4 mr-2" />
            Doubt
          </button>
          <button
            className="px-4 py-2.5 bg-zinc-950/60 border border-zinc-800/70 text-sm hover:border-cyan-500/50 transition rounded-lg"
            title="Watch clip"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>
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


