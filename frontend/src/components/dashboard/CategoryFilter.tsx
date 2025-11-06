import React from 'react';
import { Filter } from 'lucide-react';

type Props = {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
};

export default function CategoryFilter({ categories, selectedCategory, setSelectedCategory }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex gap-2 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-zinc-950'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      <button className="p-2 bg-zinc-900 border border-zinc-800 hover:border-cyan-500 transition">
        <Filter className="w-5 h-5" />
      </button>
    </div>
  );
}


