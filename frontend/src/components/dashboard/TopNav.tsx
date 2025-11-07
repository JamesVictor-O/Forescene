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
    <nav className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800/50 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - mobile first */}
          <div className="flex items-center space-x-2">
            <Image
              src="/Logo2.png"
              alt="Forescene"
              width={28}
              height={28}
              className="sm:w-8 sm:h-8 object-contain"
            />
            <span className="text-sm sm:text-base font-medium text-zinc-300 hidden sm:inline">
              FORESCENE
            </span>
          </div>

          {/* Search - mobile toggle */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden sm:flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-sm text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Actions - mobile optimized */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile search button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="sm:hidden w-9 h-9 bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center rounded-sm hover:border-cyan-500/50 transition-colors"
            >
              <Search className="w-4 h-4 text-zinc-400" />
            </button>

            {/* Create button - mobile icon only */}
            <button
              onClick={() => setCreateOpen(true)}
              className="w-9 h-9 sm:w-auto sm:px-4 sm:py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium text-xs sm:text-sm hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all rounded-sm flex items-center justify-center"
            >
              <Plus className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Create</span>
            </button>

            {/* Notifications */}
            <button className="w-9 h-9 bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center rounded-sm hover:border-cyan-500/50 transition-colors relative">
              <Bell className="w-4 h-4 text-zinc-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full" />
            </button>

            <ConnectWalletButton
              variant="subtle"
              className="hidden sm:inline-flex"
              showChevron={false}
            />
            <ConnectWalletButton
              variant="glass"
              className="sm:hidden w-9 h-9 px-0 py-0 text-xs"
              showChevron={false}
              showDisconnectIcon={false}
            />
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="sm:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search predictions, users..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-sm text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
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
