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
    <div className="p-3 sm:p-4 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-sm hover:border-zinc-700/50 transition-all duration-300">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-950/50 border border-zinc-800/50 flex items-center justify-center mb-2 sm:mb-3 text-cyan-500 rounded-sm">
        {icon}
      </div>
      <div className="text-[10px] sm:text-xs text-zinc-500 mb-1 uppercase tracking-wider font-light">{label}</div>
      <div className="text-lg sm:text-xl font-bold">{value}</div>
    </div>
  );
}


