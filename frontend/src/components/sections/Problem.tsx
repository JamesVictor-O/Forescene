import React from 'react';

export default function Problem() {
  return (
    <section className="py-20 px-4 bg-zinc-900 border-y border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            The World Is Full of Opinions
          </h2>
          <p className="text-xl text-zinc-400 mb-12">
            But there's no proof of who was actually right when things play out.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-zinc-950 border border-zinc-800">
              <div className="text-red-500 mb-3">❌</div>
              <h3 className="font-semibold mb-2">Current Prediction Markets</h3>
              <p className="text-zinc-500 text-sm">Text-heavy, complex, and boring. Desktop-focused platforms that lack social engagement.</p>
            </div>
            
            <div className="p-6 bg-zinc-950 border border-zinc-800">
              <div className="text-red-500 mb-3">❌</div>
              <h3 className="font-semibold mb-2">Social Media Predictions</h3>
              <p className="text-zinc-500 text-sm">Lost in the feed. No tracking, no rewards, no accountability.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


