"use client";

import React from 'react';
import { Home, Compass, Trophy, Target, Users, BarChart3, Award } from 'lucide-react';

type SidebarLeftProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userStats: { prophetScore: number; rank: number; accuracy: number; earnings: string };
};

export default function SidebarLeft({ activeTab, setActiveTab, userStats }: SidebarLeftProps) {
  return (
    <aside className="fixed left-0 w-64 h-screen bg-zinc-950 border-r border-zinc-800 hidden lg:block">
      <div className="p-6 space-y-6">
        <nav className="space-y-2">
          <NavItem icon={<Home className="w-5 h-5" />} label="Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
          <NavItem icon={<Compass className="w-5 h-5" />} label="Discover" active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
          <NavItem icon={<Trophy className="w-5 h-5" />} label="My Predictions" active={activeTab === 'predictions'} onClick={() => setActiveTab('predictions')} />
          <NavItem icon={<Target className="w-5 h-5" />} label="Backed" active={activeTab === 'backed'} onClick={() => setActiveTab('backed')} />
          <NavItem icon={<Users className="w-5 h-5" />} label="Squads" active={activeTab === 'squads'} onClick={() => setActiveTab('squads')} />
          <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Leaderboard" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
        </nav>

        <div className="p-4 bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-500">Prophet Score</span>
            <Award className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-bold text-cyan-500 mb-1">{userStats.prophetScore}</div>
          <div className="text-xs text-zinc-500">Rank #{userStats.rank} globally</div>
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Accuracy</span>
              <span className="font-semibold">{userStats.accuracy}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1">
              <div className="bg-cyan-500 h-1" style={{ width: `${userStats.accuracy}%` }}></div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800">
          <div className="text-xs text-zinc-500 mb-1">Balance</div>
          <div className="text-2xl font-bold mb-3">{userStats.earnings} <span className="text-sm text-zinc-500">FORE</span></div>
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 bg-cyan-500 text-zinc-950 text-xs font-semibold">Deposit</button>
            <button className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs font-semibold">Withdraw</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold transition ${
        active
          ? 'bg-zinc-900 border border-cyan-500 text-cyan-500'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}


