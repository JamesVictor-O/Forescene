"use client";

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800/50 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Image src="/Logo2.png" alt="Forescene" width={32} height={32} className="object-contain" />
            <span className="ml-2 text-sm font-medium text-zinc-300 hidden sm:block">FORESCENE</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-zinc-400 hover:text-white text-sm font-light transition-colors uppercase tracking-wider">Features</a>
            <a href="#how-it-works" className="text-zinc-400 hover:text-white text-sm font-light transition-colors uppercase tracking-wider">How It Works</a>
            <button className="px-5 py-2 bg-zinc-900/80 border border-zinc-800/50 text-white text-sm font-medium hover:border-cyan-500/50 transition-all duration-300 rounded-sm">
              CONNECT WALLET
            </button>
          </div>

          <button
            className="md:hidden text-zinc-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800/50">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block text-zinc-400 hover:text-white text-sm uppercase tracking-wider">Features</a>
            <a href="#how-it-works" className="block text-zinc-400 hover:text-white text-sm uppercase tracking-wider">How It Works</a>
            <button className="w-full px-5 py-2 bg-zinc-900/80 border border-zinc-800/50 text-white text-sm font-medium rounded-sm">
              CONNECT WALLET
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}


