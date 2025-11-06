"use client";

import React, { useState } from 'react';
import { Play, ThumbsUp, ThumbsDown, MessageCircle, Share2, Flame, TrendingUp, Clock, Video as VideoIcon, Award, Crown } from 'lucide-react';

type FeedItem = {
  id: number;
  format: 'video' | 'text';
  user: { name: string; avatar: string; prophetScore: number; accuracy: number; verified: boolean };
  prediction: string;
  category: string;
  thumbnail: 'crypto-bg' | 'sports-bg' | 'tech-bg';
  confidence: number;
  currentOdds: { for: number; against: number };
  stats: { backers: number; staked: string; comments: number; shares: number };
  deadline: string;
  timeLeft: string;
  isHot: boolean;
};

export default function MixedFeed() {
  const [stakeForItemId, setStakeForItemId] = useState<null | { id: number; type: 'for' | 'against' }>(null);
  const [stakeAmount, setStakeAmount] = useState('');

  const items: FeedItem[] = [
    { id: 1, format: 'video', user: { name: 'CryptoSage', avatar: 'CS', prophetScore: 1250, accuracy: 92, verified: true }, prediction: 'Bitcoin will hit $100K before December 31st, 2025', category: 'crypto', thumbnail: 'crypto-bg', confidence: 85, currentOdds: { for: 2.3, against: 1.4 }, stats: { backers: 1234, staked: '45.2K', comments: 89, shares: 234 }, deadline: '2025-12-31', timeLeft: '42d 15h', isHot: true },
    { id: 2, format: 'text', user: { name: 'SportsOracle', avatar: 'SO', prophetScore: 980, accuracy: 88, verified: true }, prediction: 'Lakers will win the 2025 NBA Championship', category: 'sports', thumbnail: 'sports-bg', confidence: 78, currentOdds: { for: 3.1, against: 1.2 }, stats: { backers: 892, staked: '32.8K', comments: 156, shares: 421 }, deadline: '2025-06-15', timeLeft: '7mo 9d', isHot: false },
    { id: 3, format: 'video', user: { name: 'TechVision', avatar: 'TV', prophetScore: 1100, accuracy: 85, verified: false }, prediction: 'Apple will announce AR glasses at WWDC 2025', category: 'tech', thumbnail: 'tech-bg', confidence: 72, currentOdds: { for: 1.8, against: 1.6 }, stats: { backers: 2103, staked: '67.5K', comments: 312, shares: 189 }, deadline: '2025-06-09', timeLeft: '7mo 3d', isHot: true },
    { id: 4, format: 'text', user: { name: 'MarketMaven', avatar: 'MM', prophetScore: 845, accuracy: 81, verified: false }, prediction: 'ETH flips $5K by Q1 2025, driven by ETF inflows', category: 'crypto', thumbnail: 'crypto-bg', confidence: 69, currentOdds: { for: 2.0, against: 1.7 }, stats: { backers: 512, staked: '12.1K', comments: 48, shares: 96 }, deadline: '2025-03-31', timeLeft: '78d 3h', isHot: false },
  ];

  const onOpenStake = (id: number, type: 'for' | 'against') => {
    setStakeForItemId({ id, type });
    setStakeAmount('');
  };

  const active = stakeForItemId ? items.find(i => i.id === stakeForItemId.id) : null;

  return (
    <div className="space-y-4">
      {items.map(item => (
        <FeedCard key={item.id} item={item} onStake={onOpenStake} />
      ))}

      {stakeForItemId && active && (
        <div className="fixed inset-0 bg-zinc-950/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{stakeForItemId.type === 'for' ? 'Stake FOR' : 'Stake AGAINST'}</h3>
                <button onClick={() => setStakeForItemId(null)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <p className="text-sm text-zinc-500">{stakeForItemId.type === 'for' ? 'I believe this prediction will come true' : 'I doubt this prediction will happen'}</p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="text-sm text-zinc-500 mb-2">Your prediction:</div>
                <div className="p-4 bg-zinc-950 border border-zinc-800">
                  <p className="font-semibold mb-2">{active.prediction}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>by {active.user.name}</span>
                    <span>{active.timeLeft} left</span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="text-sm font-semibold mb-2 block">Stake Amount</label>
                <div className="relative">
                  <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-lg font-semibold outline-none focus:border-cyan-500" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">FORE</div>
                </div>
                <div className="flex gap-2 mt-2">
                  {[10, 25, 50, 100].map(amount => (
                    <button key={amount} onClick={() => setStakeAmount(amount.toString())} className="flex-1 py-2 bg-zinc-950 border border-zinc-800 text-xs font-semibold hover:border-cyan-500 transition">{amount}</button>
                  ))}
                </div>
              </div>
              <div className="mb-6 p-4 bg-zinc-950 border border-zinc-800">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-zinc-500">Current Odds</span>
                  <span className={`text-sm font-bold ${stakeForItemId.type === 'for' ? 'text-cyan-500' : 'text-red-500'}`}>{stakeForItemId.type === 'for' ? active.currentOdds.for : active.currentOdds.against}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500">Potential Return</span>
                  <span className="text-sm font-bold text-white">{stakeAmount ? (parseFloat(stakeAmount) * (stakeForItemId.type === 'for' ? active.currentOdds.for : active.currentOdds.against)).toFixed(2) : '0.00'} FORE</span>
                </div>
              </div>
              <button className={`w-full py-4 font-bold text-zinc-950 ${stakeForItemId.type === 'for' ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-red-500 hover:bg-red-400'} transition`}>{stakeForItemId.type === 'for' ? 'Confirm Belief' : 'Confirm Doubt'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedCard({ item, onStake }: { item: FeedItem; onStake: (id: number, type: 'for' | 'against') => void }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyan-500 text-zinc-950 font-bold flex items-center justify-center">{item.user.avatar}</div>
          <div>
            <div className="font-semibold flex items-center">
              {item.user.name}
              {item.user.verified && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-cyan-500">
                  <Award className="w-3 h-3 text-zinc-950" />
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-500 flex items-center space-x-3">
              <span className="flex items-center"><Crown className="w-3 h-3 mr-1 text-cyan-500" />{item.user.prophetScore}</span>
              <span>{item.user.accuracy}% accuracy</span>
            </div>
          </div>
        </div>
        <div className="px-2 py-1 bg-zinc-950 border border-zinc-800 text-xs">{item.category}</div>
      </div>

      {item.isHot && (
        <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-orange-500 text-zinc-950 text-[10px] font-bold mb-2">
          <Flame className="w-3 h-3" />
          <span>HOT</span>
        </div>
      )}

      {item.format === 'video' ? (
        <div className="relative w-full mx-auto mb-3 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden aspect-9/16 max-w-[420px] md:max-w-[480px] lg:max-w-[520px]">
          <div className={`absolute inset-0 ${
            item.thumbnail === 'crypto-bg' ? 'bg-linear-to-br from-cyan-900/20 to-zinc-900' :
            item.thumbnail === 'sports-bg' ? 'bg-linear-to-br from-purple-900/20 to-zinc-900' :
            'bg-linear-to-br from-blue-900/20 to-zinc-900'
          }`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-20 h-20 text-zinc-800" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-zinc-950 to-transparent" />
          <div className="absolute top-2 right-2 bg-zinc-900/80 border border-zinc-800 text-xs px-2 py-1 flex items-center">
            <VideoIcon className="w-3 h-3 mr-1" />
            15s
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800 p-4 mb-3 mx-auto rounded-lg w-full max-w-[680px]">
          <p className="text-xl font-bold leading-snug">{item.prediction}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center text-zinc-400">
          <Clock className="w-4 h-4 mr-1" />
          <span>{item.timeLeft} left</span>
        </div>
        <div className="flex items-center text-cyan-500 font-semibold">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>{item.confidence}% confident</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-zinc-950 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-500 mb-1">Total Staked</div>
          <div className="font-bold">${item.stats.staked}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-500 mb-1">Backers</div>
          <div className="font-bold">{item.stats.backers}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-500 mb-1">Comments</div>
          <div className="font-bold">{item.stats.comments}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => onStake(item.id, 'for')} className="flex-1 px-4 py-2 bg-cyan-500 text-zinc-950 font-semibold text-sm hover:bg-cyan-400 transition flex items-center justify-center">
          <ThumbsUp className="w-4 h-4 mr-2" />
          Believe
        </button>
        <button onClick={() => onStake(item.id, 'against')} className="px-4 py-2 bg-zinc-950 border border-zinc-800 font-semibold text-sm hover:border-cyan-500 transition flex items-center">
          <ThumbsDown className="w-4 h-4 mr-2" />
          Doubt
        </button>
        <button className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-sm hover:border-cyan-500 transition">
          <MessageCircle className="w-4 h-4" />
        </button>
        <button className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-sm hover:border-cyan-500 transition">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


