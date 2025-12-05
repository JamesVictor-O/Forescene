import React from "react";
import Navbar from "@/components/navigation/Navbar";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/Features";
import Footer from "@/components/footer/Footer";

export default function Page() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-brand-dark overflow-x-hidden font-display selection:bg-primary selection:text-black">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,147,13,0.15),transparent_40%)] pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="w-full max-w-[1280px] px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col">
          <Navbar />
          <main className="flex-1 w-full flex flex-col items-center">
            <Hero />
            <HowItWorks />
            <Features />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
