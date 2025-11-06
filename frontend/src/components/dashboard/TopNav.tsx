"use client";

import React from 'react';
import { Play, Search, Plus, Bell } from 'lucide-react';

export default function TopNav() {
  return (
    <nav className="fixed top-0 w-full bg-zinc-950 border-b border-zinc-800 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cyan-500 flex items-center justify-center">
                <Play className="w-5 h-5 text-zinc-950" fill="currentColor" />
              </div>
              <span className="text-xl font-bold">Forescene</span>
            </div>

            <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 px-4 py-2 w-96">
              <Search className="w-4 h-4 text-zinc-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search predictions, users..." 
                className="bg-transparent outline-none text-sm w-full text-white placeholder-zinc-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-cyan-500 text-zinc-950 font-semibold text-sm hover:bg-cyan-400 transition flex items-center">
              <Plus className="w-4 h-4 mr-1" />
              Create Prediction
            </button>
            <button className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-cyan-500 transition">
              <Bell className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-cyan-500 text-zinc-950 font-bold flex items-center justify-center">
              JD
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}


