import React from 'react';

type FeatureCardProps = {
  title: string;
  description: string;
};

function FeatureCard({  title, description }: FeatureCardProps) {
  return (
    <div className="group p-8 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-sm hover:border-cyan-500/30 hover:bg-zinc-900/60 transition-all duration-300">
    
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed font-light">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Unique Features</h2>
          <p className="text-zinc-400 text-lg font-light">Everything you need to predict, prove, and profit</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Video Predictions" 
            description="Engage with short-form video content, not boring charts and text." 
          />
          <FeatureCard 
            title="Prophet Portfolios" 
            description="Your prediction history as a verified, tradeable NFT identity." 
          />
          <FeatureCard 
            title="Prediction Battles" 
            description="Challenge others with opposing predictions. Community decides the winner." 
          />
          <FeatureCard 
            title="Squad Mode" 
            description="Form teams, pool knowledge, and share winnings together." 
          />
          <FeatureCard 
            title="Multiple Earnings" 
            description="Earn from accuracy, influence fees, reputation growth, and sponsorships." 
          />
          <FeatureCard 
            title="AI-Powered" 
            description="Automatic claim extraction and verification using advanced AI." 
          />
        </div>
      </div>
    </section>
  );
}


