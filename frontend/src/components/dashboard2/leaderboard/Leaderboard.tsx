import React, { useState } from "react";
import { Player, LeaderboardType } from "../types";
import { Search, UserPlus, Plus, ArrowUp } from "lucide-react";
import { cn, formatNumber } from "../lib/utils";

interface LeaderboardProps {
  players: Player[];
  currentUserId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  const [activeTab, setActiveTab] =
    useState<LeaderboardType>("Global Leaderboard");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Switcher */}
      <div className="flex px-1">
        <div className="flex h-12 w-full md:w-auto items-center rounded-full bg-black/5 dark:bg-[#393228] p-1.5">
          {(["Global Leaderboard", "Friend Leagues"] as LeaderboardType[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 md:flex-none px-6 h-full rounded-full text-sm font-semibold transition-all duration-200",
                  activeTab === tab
                    ? "bg-white dark:bg-background-dark text-black dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-muted hover:text-black dark:hover:text-white"
                )}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:flex-1">
          <div className="group relative flex h-12 items-center rounded-xl bg-black/5 dark:bg-[#393228] focus-within:ring-2 focus-within:ring-primary/50 transition-all">
            <div className="flex h-full w-12 items-center justify-center text-gray-500 dark:text-muted">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Find a player"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-full w-full bg-transparent text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-muted focus:outline-none text-base pr-4"
            />
          </div>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <button className="flex-1 md:flex-none h-12 px-6 rounded-full bg-primary/20 text-primary hover:bg-primary/30 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
            <UserPlus size={18} />
            <span>Join League</span>
          </button>
          <button className="flex-1 md:flex-none h-12 px-6 rounded-full bg-primary text-black hover:bg-primary/90 text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20">
            <Plus size={18} />
            <span>Create League</span>
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-500 dark:text-muted uppercase tracking-wider">
        <div className="col-span-2 md:col-span-1">Rank</div>
        <div className="col-span-7 md:col-span-8">Player</div>
        <div className="col-span-3 text-right">Points</div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.map((player) => (
          <div
            key={player.rank}
            className={cn(
              "grid grid-cols-12 items-center gap-4 p-4 rounded-xl border transition-all duration-200",
              player.isCurrentUser
                ? "bg-primary/10 dark:bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(242,147,13,0.1)]"
                : "bg-white/60 dark:bg-background-card border-transparent hover:bg-white dark:hover:bg-[#322c23]"
            )}
          >
            {/* Rank */}
            <div className="col-span-2 md:col-span-1 font-bold text-center">
              <span
                className={cn(
                  player.isCurrentUser
                    ? "text-primary"
                    : "text-gray-600 dark:text-gray-300"
                )}
              >
                #{player.rank}
              </span>
            </div>

            {/* Player Info */}
            <div className="col-span-7 md:col-span-8 flex items-center gap-3 md:gap-4 overflow-hidden">
              <div
                className="h-10 w-10 min-w-[2.5rem] rounded-full bg-cover bg-center border border-white/10 shadow-sm"
                style={{ backgroundImage: `url("${player.avatar}")` }}
              />
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    "font-bold truncate",
                    player.isCurrentUser
                      ? "text-black dark:text-white"
                      : "text-gray-800 dark:text-gray-200"
                  )}
                >
                  {player.name}
                </span>
                {player.trend && (
                  <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                    <ArrowUp size={12} strokeWidth={3} />
                    <span>+{player.trend} Places</span>
                  </div>
                )}
              </div>
            </div>

            {/* Points */}
            <div className="col-span-3 text-right font-bold text-black dark:text-white text-sm md:text-base">
              {formatNumber(player.points)} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
