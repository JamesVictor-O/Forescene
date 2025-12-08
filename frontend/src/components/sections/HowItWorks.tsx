
import React from "react";
import { Calendar, MousePointerClick, Trophy } from "lucide-react";

const StepCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="flex flex-1 gap-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-8 flex-col items-center text-center transition-all hover:bg-white/10 hover:border-primary/40 hover:-translate-y-1 duration-300 group">
    <div className="p-4 bg-primary/10 rounded-full border border-primary/20 text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-300">
      {icon}
    </div>
    <div className="flex flex-col gap-3">
      <h3 className="text-white text-xl font-bold leading-tight">{title}</h3>
      <p className="text-[#baad9c] text-base font-normal leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="w-full py-16 px-4">
      <div className="max-w-[1080px] mx-auto">
        <h2 className="text-white text-center text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StepCard
            icon={<Calendar size={32} />}
            title="1. Browse Events"
            description="Explore upcoming cultural events, music releases, and more from across the continent."
          />
          <StepCard
            icon={<MousePointerClick size={32} />}
            title="2. Make Predictions"
            description="Use your insight and knowledge to predict outcomes, winners, and trends."
          />
          <StepCard
            icon={<Trophy size={32} />}
            title="3. Win Points"
            description="Earn points for every correct prediction, climb the global leaderboard, and win prizes."
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;