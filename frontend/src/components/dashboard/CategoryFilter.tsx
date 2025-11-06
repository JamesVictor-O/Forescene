import React from 'react';
import { Filter } from 'lucide-react';

type Props = {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
};

export default function CategoryFilter({ categories, selectedCategory, setSelectedCategory }: Props) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 sm:-mx-0 px-3 sm:px-0 flex-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all rounded-sm ${
              selectedCategory === cat
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                : 'bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700/50'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      <button className="p-2 sm:p-2.5 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 hover:border-cyan-500/50 transition-all rounded-sm flex-shrink-0">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
      </button>
    </div>
  );
}


