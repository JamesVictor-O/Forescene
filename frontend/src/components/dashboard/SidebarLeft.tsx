"use client";

import React, { useMemo } from "react";
import { useWallets } from "@privy-io/react-auth";
import {
  Home,
  Trophy,
  Target,
  Users,
  BarChart3,
  LucideIcon,
} from "lucide-react";

type ForeBalance = {
  formatted: string;
  symbol: string;
  error?: unknown;
};

type SidebarLeftProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userStats: {
    prophetScore: number;
    rank: number;
    accuracy: number;
    earnings: string;
  };
  balance: ForeBalance;
};

type NavConfig = {
  id: string;
  icon: LucideIcon;
  label: string;
};

const NAV_ITEMS: NavConfig[] = [
  { id: "feed", icon: Home, label: "Feed" },
  { id: "predictions", icon: Trophy, label: "My Predictions" },
  { id: "backed", icon: Target, label: "Backed" },
  { id: "squads", icon: Users, label: "Squads" },
  { id: "leaderboard", icon: BarChart3, label: "Leaderboard" },
];

export default function SidebarLeft({
  activeTab,
  setActiveTab,
  userStats,
  balance,
}: SidebarLeftProps) {
  const { wallets } = useWallets();
  const primaryWalletAddress = wallets?.[0]?.address;

  const formattedBalance = useMemo(() => {
    if (!primaryWalletAddress || !balance) return userStats.earnings;

    const numeric = Number(balance.formatted);
    if (!Number.isFinite(numeric)) return balance.formatted;

    return numeric.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: numeric < 1 ? 4 : 2,
    });
  }, [primaryWalletAddress, balance, userStats.earnings]);

  return (
    <aside className="fixed left-0 w-64 h-screen bg-zinc-950 border-r border-zinc-800 hidden lg:block">
      <div className="p-6 space-y-6">
        {/* Navigation */}
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        {/* Prophet Score Card */}
        <ProphetScoreCard userStats={userStats} />

        {/* Balance Card */}
        <BalanceCard
          balance={formattedBalance}
          symbol={balance?.symbol ?? "FORE"}
        />
      </div>
    </aside>
  );
}


function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold transition rounded-md ${
        active
          ? "bg-zinc-900 border border-cyan-500 text-cyan-500"
          : "text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

function ProphetScoreCard({
  userStats,
}: {
  userStats: SidebarLeftProps["userStats"];
}) {
  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-zinc-500">Prophet Score</span>
      </div>
      <div className="text-3xl font-bold text-cyan-500 mb-1">
        {userStats.prophetScore}
      </div>
      <div className="text-xs text-zinc-500">
        Rank #{userStats.rank} globally
      </div>
      <div className="mt-3 pt-3 border-t border-zinc-800">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-zinc-500">Accuracy</span>
          <span className="font-semibold">{userStats.accuracy}%</span>
        </div>
        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-cyan-500 h-1 transition-all duration-300"
            style={{ width: `${userStats.accuracy}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ balance, symbol }: { balance: string; symbol: string }) {
  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md">
      <div className="text-xs text-zinc-500 mb-1">Balance</div>
      <div className="text-2xl font-bold mb-3">
        {balance} <span className="text-sm text-zinc-500">{symbol}</span>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 bg-cyan-500 text-zinc-950 text-xs font-semibold rounded-md hover:bg-cyan-400 transition">
          Deposit
        </button>
        <button className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs font-semibold rounded-md hover:bg-zinc-900 transition">
          Withdraw
        </button>
      </div>
    </div>
  );
}
