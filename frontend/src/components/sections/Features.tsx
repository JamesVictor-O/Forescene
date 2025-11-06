import React from 'react';
import { Play, Trophy, Zap, Users, TrendingUp } from 'lucide-react';

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 hover:border-cyan-500 transition">
      <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 text-cyan-500">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-zinc-500">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Unique Features</h2>
          <p className="text-xl text-zinc-400">Everything you need to predict, prove, and profit</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Play className="w-6 h-6" />} 
            title="Video Predictions" 
            description="Engage with short-form video content, not boring charts and text." 
          />
          <FeatureCard 
            icon={<Trophy className="w-6 h-6" />} 
            title="Prophet Portfolios" 
            description="Your prediction history as a verified, tradeable NFT identity." 
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />} 
            title="Prediction Battles" 
            description="Challenge others with opposing predictions. Community decides the winner." 
          />
          <FeatureCard 
            icon={<Users className="w-6 h-6" />} 
            title="Squad Mode" 
            description="Form teams, pool knowledge, and share winnings together." 
          />
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6" />} 
            title="Multiple Earnings" 
            description="Earn from accuracy, influence fees, reputation growth, and sponsorships." 
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />} 
            title="AI-Powered" 
            description="Automatic claim extraction and verification using advanced AI." 
          />
        </div>
      </div>
    </section>
  );
}


