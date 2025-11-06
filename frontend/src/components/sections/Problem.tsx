import React from 'react';
import { X } from 'lucide-react';

export default function Problem() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-zinc-500 text-sm uppercase tracking-wider mb-4 font-light">
            The Problem
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            The World Is Full of Opinions
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
            But there's no proof of who was actually right when things play out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-sm hover:border-zinc-700/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 flex items-center justify-center rounded-sm">
                <X className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="font-semibold text-lg">Current Prediction Markets</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">
              Text-heavy, complex, and boring. Desktop-focused platforms that lack social engagement.
            </p>
          </div>
          
          <div className="p-8 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-sm hover:border-zinc-700/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 flex items-center justify-center rounded-sm">
                <X className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="font-semibold text-lg">Social Media Predictions</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">
              Lost in the feed. No tracking, no rewards, no accountability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


