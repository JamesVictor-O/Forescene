import React from 'react';

type StepProps = {
  number: string;
  title: string;
  description: string;
};

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-zinc-500 text-sm">{description}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-zinc-900 border-y border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="inline-block px-4 py-1 bg-cyan-500 text-zinc-950 font-semibold mb-6">
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

          <div>
            <div className="inline-block px-4 py-1 bg-purple-500 text-zinc-950 font-semibold mb-6">
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


