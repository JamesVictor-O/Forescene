import React from 'react';

type StepProps = {
  number: string;
  title: string;
  description: string;
};

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center font-semibold text-sm flex-shrink-0 rounded-sm">
        {number}
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-base">{title}</h4>
        <p className="text-zinc-400 text-sm leading-relaxed font-light">{description}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-zinc-500 text-sm uppercase tracking-wider mb-4 font-light">
            How It Works
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">How It Works</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-8 rounded-sm">
              For Predictors
            </div>

            <div className="space-y-6">
              <Step 
                number="1" 
                title="Record Your Prediction" 
                description="Create a 15-60 second video stating your prediction. AI extracts and structures your claim automatically." 
              />
              <Step 
                number="2" 
                title="Stake Your Confidence" 
                description="Lock in reputation points or tokens. Higher stake means higher potential rewards." 
              />
              <Step 
                number="3" 
                title="Earn Multiple Ways" 
                description="Get accuracy rewards, influence fees, reputation growth, and brand sponsorships." 
              />
              <Step 
                number="4" 
                title="Build Your Legacy" 
                description="Every correct prediction adds to your on-chain Prophet Portfolio NFT." 
              />
            </div>
          </div>

          <div className="p-8 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-8 rounded-sm">
              For Investors
            </div>

            <div className="space-y-6">
              <Step 
                number="1" 
                title="Discover Predictions" 
                description="Scroll a TikTok-style feed of predictions across sports, crypto, politics, and more." 
              />
              <Step 
                number="2" 
                title="Back Predictions" 
                description="Support specific predictions or entire predictor portfolios you believe in." 
              />
              <Step 
                number="3" 
                title="Trade Positions" 
                description="Buy and sell your stakes as odds shift in real-time. Early believers profit most." 
              />
              <Step 
                number="4" 
                title="Earn Returns" 
                description="Correct predictions yield payouts and boost your influence on the platform." 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


