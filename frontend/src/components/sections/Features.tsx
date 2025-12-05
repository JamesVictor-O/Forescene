import React from "react";
import { Activity, Brain, Medal } from "lucide-react";

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="flex flex-1 gap-5 rounded-2xl border border-white/5 bg-[#1a1714] p-8 flex-col items-start text-left transition-all hover:border-primary/30 hover:bg-[#201c18] group">
    <div className="text-primary/80 group-hover:text-primary transition-colors mb-2">
      {icon}
    </div>
    <div className="flex flex-col gap-2">
      <h3 className="text-white text-lg font-bold leading-tight">{title}</h3>
      <p className="text-[#baad9c] text-sm font-normal leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

const Features: React.FC = () => {
  return (
    <section className="w-full py-20 px-4 mt-8">
      <div className="max-w-[1080px] mx-auto flex flex-col gap-16">
        <div className="flex flex-col gap-4 text-center items-center">
          <h2 className="text-white text-4xl md:text-5xl font-bold leading-tight tracking-tight max-w-3xl">
            Everything you need to compete and win
          </h2>
          <p className="text-white/70 text-lg font-normal leading-relaxed max-w-2xl">
            Engage with a vibrant community, showcase your cultural knowledge,
            and rise to the top with our powerful features.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Activity size={40} />}
            title="Live Event Predictions"
            description="Make predictions on events as they happen and see results in real-time. Feel the pulse of the culture."
          />
          <FeatureCard
            icon={<Brain size={40} />}
            title="Cultural Quizzes"
            description="Test your knowledge on a wide range of topics in African culture, from Afrobeats history to cinema."
          />
          <FeatureCard
            icon={<Medal size={40} />}
            title="Community Leaderboards"
            description="See how you stack up against other players and friends. Weekly, monthly, and all-time champions."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
