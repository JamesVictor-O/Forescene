"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

const Hero: React.FC = () => {
  const router = useRouter();
  const { authenticated, ready, login } = usePrivy();

  const handleCtaClick = () => {
    if (!ready) return;
    if (authenticated) {
      router.push("/dashboard");
    } else {
      login();
    }
  };

  return (
    <section className="@container w-full">
      <div className="flex flex-col gap-10 px-4 py-16 text-center items-center md:py-24 lg:py-32">
        <div className="flex flex-col gap-6 items-center max-w-4xl mx-auto">
          <div className="flex flex-col gap-6 text-center">
            <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tight">
              Predict. Compete. <span className="text-primary">Win.</span>
            </h1>
            <h2 className="text-white/80 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
              This is Forescene the ultimate prediction game on African culture.
              Test your foresight on music, events, and trends. Rise to the
              challenge and claim your spot on the leaderboard.
            </h2>
          </div>

          <button
            onClick={handleCtaClick}
            className="group relative flex w-auto min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 sm:h-14 sm:px-10 bg-primary text-black text-base sm:text-lg font-bold leading-normal tracking-wide shadow-button-glow hover:bg-primary-light transition-all transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!ready}
          >
            <span className="relative z-10">Play Now & Prove Your Insight</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </div>

        {/* Hero Image Container */}
        <div className="relative w-full max-w-5xl mx-auto mt-8 sm:mt-12 group perspective-1000">
          {/* Glow Effect behind image */}
          <div className="absolute -inset-1 sm:-inset-4 rounded-xl sm:rounded-3xl bg-primary/30 blur-2xl sm:blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>

          {/* Main Image */}
          <div className="relative w-full bg-black/50 aspect-[16/9] rounded-xl sm:rounded-2xl border border-primary/30 overflow-hidden shadow-2xl">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhTX2q7BgmJTCVWDwaiWFjPbJ7uQ_dRWGMGAM_QU6qZ8iEPFsHAfu7P1x6ifbUE6AD6YEdMs6fPSBYOhZaLmbmstoO14wCm-qxwaYQDMUZ3PA0LaKh3kS7u0_b6sjzLe0-3JfpnaRmHt0shk1Qj78bAWUbqE-iZl1pNSj8-jGsuszOGJ3DI5URY6Kl8Uo-eRLvkRJjr97kweWSZPWf1v3aTnXfN4jUgf26B1_6R6gTKPd2UigoeXPIg41k-wF306J5v74ezpXVbqwB"
              alt="Forescene App Interface Abstract"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
