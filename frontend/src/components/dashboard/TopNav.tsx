"use client";

import React, { useState } from "react";
import { Search, Plus, Bell, Menu, X } from "lucide-react";
import Image from "next/image";
import ConnectWalletButton from "@/components/shared/ConnectWalletButton";
import { usePrivy, useWallets } from "@privy-io/react-auth";

function shortenAddress(address: string): string {
  return `${address.slice(0, 5)}…${address.slice(-3)}`;
}

type TopNavProps = {
  onOpenCreate: () => void;
};

export default function TopNav({ onOpenCreate }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { authenticated, ready, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const primaryWalletAddress = wallets?.[0]?.address;
  const mobileWalletLabel = !ready
    ? "…"
    : authenticated && primaryWalletAddress
    ? shortenAddress(primaryWalletAddress)
    : "Connect";

  const handleMobileWalletClick = () => {
    if (!ready) return;
    if (authenticated) {
      logout();
    } else {
      login();
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-zinc-950/85 backdrop-blur-md border-b border-zinc-900/70 shadow-[0_10px_40px_rgba(8,8,12,0.55)] z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-5">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - mobile first */}
          <button
            onClick={() => setMenuOpen(false)}
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
            {/* Create button - hidden on mobile (handled by MobileBottomNav) */}
            <button
              onClick={onOpenCreate}
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 font-medium text-sm hover:bg-cyan-500/25 hover:border-cyan-500/50 transition-all rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>

            {/* Notifications */}
            <button className="hidden sm:flex w-10 h-10 bg-zinc-900/55 border border-zinc-800/70 items-center justify-center rounded-xl hover:border-cyan-500/50 hover:bg-zinc-900/75 transition-colors relative">
              <Bell className="w-4 h-4 text-zinc-200" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
            </button>

            {/* Mobile wallet pill */}
            <button
              onClick={handleMobileWalletClick}
              className="lg:hidden px-3 py-2 bg-zinc-900/60 border border-zinc-800/70 text-xs font-medium text-zinc-200 rounded-xl hover:border-cyan-500/50 hover:text-cyan-100 transition-colors"
            >
              {mobileWalletLabel}
            </button>

            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="lg:hidden w-10 h-10 bg-zinc-900/55 border border-zinc-800/70 flex items-center justify-center rounded-xl hover:border-cyan-500/50 hover:bg-zinc-900/75 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="w-5 h-5 text-zinc-200" />
              ) : (
                <Menu className="w-5 h-5 text-zinc-200" />
              )}
            </button>
            <div className="hidden lg:inline-flex">
              <ConnectWalletButton
                variant="subtle"
                className="lg:inline-flex"
                showChevron={false}
              />
            </div>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-40" aria-hidden="true">
          <div
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-16 right-3 left-3 bg-zinc-950 border border-zinc-900/70 rounded-2xl shadow-[0_20px_60px_rgba(8,8,12,0.65)] p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search predictions or users"
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-900/50 border border-zinc-800/60 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
                />
              </div>
              <button className="w-10 h-10 bg-zinc-900/55 border border-zinc-800/70 flex items-center justify-center rounded-xl hover:border-cyan-500/50 hover:bg-zinc-900/75 transition-colors relative">
                <Bell className="w-4 h-4 text-zinc-200" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
              </button>
            </div>
            <ConnectWalletButton
              variant="glass"
              fullWidth
              showChevron={false}
              showDisconnectIcon
              className="rounded-xl py-3"
            />
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <button className="px-4 py-2 bg-zinc-900/60 border border-zinc-800/70 rounded-xl text-left">
                Discover
              </button>
              <button className="px-4 py-2 bg-zinc-900/60 border border-zinc-800/70 rounded-xl text-left">
                Leaderboard
              </button>
              <button className="px-4 py-2 bg-zinc-900/60 border border-zinc-800/70 rounded-xl text-left">
                My Predictions
              </button>
              <button className="px-4 py-2 bg-zinc-900/60 border border-zinc-800/70 rounded-xl text-left">
                Squads
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
