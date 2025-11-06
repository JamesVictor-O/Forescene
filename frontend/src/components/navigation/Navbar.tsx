"use client";

import React, { useState } from 'react';
import { Menu, Play, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-zinc-950 border-b border-zinc-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-cyan-500 flex items-center justify-center">
              <Play className="w-5 h-5 text-zinc-950" fill="currentColor" />
            </div>
            <span className="text-xl font-bold">Forescene</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-zinc-400 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-zinc-400 hover:text-white transition">How It Works</a>
            <button className="px-6 py-2 bg-cyan-500 text-zinc-950 font-semibold hover:bg-cyan-400 transition">
              Connect Wallet
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block text-zinc-400 hover:text-white">Features</a>
            <a href="#how-it-works" className="block text-zinc-400 hover:text-white">How It Works</a>
        
            <button className="w-full px-6 py-2 bg-cyan-500 text-zinc-950 font-semibold">
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}


