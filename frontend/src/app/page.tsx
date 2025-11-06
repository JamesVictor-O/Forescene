import React from 'react';
import Navbar from '@/components/navigation/Navbar';
import Hero from '@/components/sections/Hero';
import Problem from '@/components/sections/Problem';
import Features from '@/components/sections/Features';
import HowItWorks from '@/components/sections/HowItWorks';
import Footer from '@/components/footer/Footer';

export default function Page() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-pop">
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}