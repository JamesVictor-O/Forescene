import React from 'react';
import { ChevronRight, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 h-screen">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1 bg-zinc-900 border border-zinc-800 mb-6">
          <span className="text-cyan-500 text-sm font-semibold">TikTok meets Polymarket</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Predict the Future.<br />
          <span className="text-cyan-500">Prove You Were Right.</span>
        </h1>

        <p className="text-xl text-zinc-400 mb-10 max-w-3xl mx-auto">
          Create short-form video predictions about real-world events and earn rewards for accuracy and influence. Your insights, your reputation, your rewards.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-cyan-500 text-zinc-950 font-semibold text-lg hover:bg-cyan-400 transition flex items-center justify-center">
            Get Early Access
            <ChevronRight className="ml-2" />
          </button>
          <button className="px-8 py-4 bg-zinc-900 border border-zinc-800 font-semibold text-lg hover:bg-zinc-800 transition">
            Watch Demo
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-cyan-500">15-60s</div>
            <div className="text-sm text-zinc-500 mt-1">Video Predictions</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-500">On-Chain</div>
            <div className="text-sm text-zinc-500 mt-1">Verification</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-500">Real</div>
            <div className="text-sm text-zinc-500 mt-1">Rewards</div>
          </div>
        </div>
      </div>
    </section>
  );
}


