import React from 'react';
import { Trophy, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';

type UserStats = {
  totalPredictions: number;
  correctPredictions: number;
  earnings: string;
  accuracy: number;
};

export default function StatsOverview({ userStats }: { userStats: UserStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard icon={<Trophy className="w-5 h-5" />} label="Total Predictions" value={userStats.totalPredictions} color="cyan" />
      <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Correct" value={userStats.correctPredictions} color="cyan" />
      <StatCard icon={<DollarSign className="w-5 h-5" />} label="Total Earnings" value={`${userStats.earnings} FORE`} color="cyan" />
      <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Win Rate" value={`${userStats.accuracy}%`} color="cyan" />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800">
      <div className={`w-10 h-10 bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-3 text-${color}-500`}>
        {icon}
      </div>
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}


