import React from 'react';
import { Clock, Users, Video, ThumbsUp, ThumbsDown } from 'lucide-react';

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

export default function PredictionsFeed({ predictions }: { predictions: Prediction[] }) {
  return (
    <div className="space-y-4">
      {predictions.map(pred => (
        <PredictionCard key={pred.id} prediction={pred} />
      ))}
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: Prediction }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 hover:border-cyan-500 transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyan-500 text-zinc-950 font-bold flex items-center justify-center">
            {prediction.avatar}
          </div>
          <div>
            <div className="font-semibold">{prediction.user}</div>
            <div className="text-xs text-zinc-500">{prediction.category}</div>
          </div>
        </div>
        <div className="text-xs px-3 py-1 bg-zinc-950 border border-zinc-800 text-cyan-500">
          Active
        </div>
      </div>

      <div className="mb-4">
        <p className="text-lg font-semibold mb-3">{prediction.prediction}</p>
        <div className="flex items-center space-x-4 text-sm text-zinc-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {prediction.deadline}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {prediction.backers} backers
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="text-xs text-zinc-500 mb-1">Confidence</div>
          <div className="font-semibold">{prediction.confidence}%</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Stake</div>
          <div className="font-semibold">{prediction.stake}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Potential</div>
          <div className="font-semibold text-cyan-500">{prediction.odds}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-cyan-500 text-zinc-950 font-semibold text-sm hover:bg-cyan-400 transition flex items-center justify-center">
          <ThumbsUp className="w-4 h-4 mr-2" />
          Believe
        </button>
        <button className="px-4 py-2 bg-zinc-950 border border-zinc-800 font-semibold text-sm hover:border-cyan-500 transition flex items-center">
          <ThumbsDown className="w-4 h-4 mr-2" />
          Doubt
        </button>
        <button className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-sm hover:border-cyan-500 transition" title="Watch clip">
          <Video className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


