"use client";

import React, { useState } from "react";
import { Search, Plus, Bell } from "lucide-react";
import Image from "next/image";
import ConnectWalletButton from "@/components/shared/ConnectWalletButton";
import CreatePredictionModal from "@/components/dashboard/CreatePredictionModal";

export default function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-zinc-950/85 backdrop-blur-md border-b border-zinc-900/70 shadow-[0_10px_40px_rgba(8,8,12,0.55)] z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-5">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - mobile first */}
          <button
            onClick={() => setSearchOpen(false)}
            className="flex items-center gap-2"
            aria-label="Go to dashboard feed"
          >
            <Image
              src="/Logo2.png"
              alt="Forescene"
              width={28}
              height={28}
              className="sm:w-8 sm:h-8 object-contain"
            />
            <span className="text-sm sm:text-base font-medium tracking-wide text-zinc-100 hidden sm:inline">
              FORESCENE
            </span>
          </button>

          {/* Search - mobile toggle */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900/40 border border-zinc-800/60 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
              />
            </div>
          </div>

          {/* Actions - mobile optimized */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile search button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="sm:hidden w-10 h-10 bg-zinc-900/55 border border-zinc-800/70 flex items-center justify-center rounded-xl hover:border-cyan-500/50 hover:bg-zinc-900/75 transition-colors"
            >
              <Search className="w-4.5 h-4.5 text-zinc-200" />
            </button>

            {/* Create button - mobile icon only */}
            <button
              onClick={() => setCreateOpen(true)}
              className="w-10 h-10 sm:w-auto sm:px-4 sm:py-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 font-medium text-xs sm:text-sm hover:bg-cyan-500/25 hover:border-cyan-500/50 transition-all rounded-xl flex items-center justify-center shadow-[0_6px_18px_rgba(34,211,238,0.35)]"
            >
              <Plus className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Create</span>
            </button>

            {/* Notifications */}
            <button className="w-10 h-10 bg-zinc-900/55 border border-zinc-800/70 flex items-center justify-center rounded-xl hover:border-cyan-500/50 hover:bg-zinc-900/75 transition-colors relative">
              <Bell className="w-4 h-4 text-zinc-200" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
            </button>

            <ConnectWalletButton
              variant="subtle"
              className="hidden sm:inline-flex"
              showChevron={false}
            />
            <ConnectWalletButton
              variant="glass"
              className="sm:hidden w-10 h-10 px-0 py-0 text-xs rounded-xl"
              showChevron={false}
              showDisconnectIcon={false}
            />
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="sm:hidden pb-3">
            <div className="relative animate-slide-down">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search predictions, users..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
      <CreatePredictionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </nav>
  );
}
