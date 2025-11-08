"use client";

import React from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import ConnectWalletButton from "@/components/shared/ConnectWalletButton";

export default function Hero() {
  const { authenticated, ready } = usePrivy();

  const showExplore = ready && authenticated;

  return (
    <section className="pt-32 pb-20 px-4 h-screen">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1 bg-zinc-900 border border-zinc-800 mb-6">
          <span className="text-cyan-500 text-sm font-semibold">
            TikTok meets Polymarket
          </span>
        </div>

        {/* Main headline - classic dapp style */}
        <div className="mb-6">
          <div className="text-zinc-400 text-sm md:text-4xl font-light mb-4 tracking-wider uppercase">
            Drop a Prediction.
          </div>
          <h1 className="text-6xl md:text-5xl lg:text-7xl font-bold mb-4 leading-none tracking-tight">
            Watch It Blow Up, 
            <br />
            Profit If You Called It.
          </h1>
        </div>

        {/* Description */}
        <p className="text-zinc-400 text-base md:text-2xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
          The social prediction platform where you can drop short-form video or text predictions. Stake belief or doubt.
          Build your on-chain reputation.
        </p>

        {/* CTA Button - minimal */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          {showExplore ? (
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium text-sm hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 rounded-sm"
            >
              EXPLORE PREDICTIONS
            </Link>
          ) : (
            <ConnectWalletButton variant="primary" showChevron />
          )}
        </div>
      </div>
    </section>
  );
}
