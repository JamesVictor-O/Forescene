import React from 'react';
import { ChevronRight, ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 h-screen">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1 bg-zinc-900 border border-zinc-800 mb-6">
          <span className="text-cyan-500 text-sm font-semibold">TikTok meets Polymarket</span>
        </div>

        {/* Main headline - classic dapp style */}
        <div className="mb-6">
          <div className="text-zinc-400 text-sm md:text-2xl font-light mb-4 tracking-wider uppercase">
          Predict the Future
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-4 leading-none tracking-tight">
          Prove You Were Right
          </h1>
         
        </div>

        {/* Description */}
        <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto mb-12 font-light leading-relaxed">
          Create short-form video or text predictions. Stake belief or doubt. Build your on-chain reputation.
        </p>

        {/* CTA Button - minimal */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button className="group px-8 py-3.5 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 text-white font-medium text-sm hover:border-cyan-500/50 hover:bg-zinc-900 transition-all duration-300 rounded-sm">
            CONNECT WALLET
            <ChevronRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-3.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium text-sm hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 rounded-sm">
            EXPLORE PREDICTIONS
          </button>
        </div>
      </div>
    </section>
  );
}


