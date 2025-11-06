"use client";

import React, { useState } from 'react';
import { Play, ThumbsUp, ThumbsDown, MessageCircle, Share2, Flame, TrendingUp, Clock, Users, Zap, Award, Volume2, VolumeX, ChevronUp, ChevronDown, Crown } from 'lucide-react';

export default function VideoFeed() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState<null | 'for' | 'against'>(null);
  const [stakeAmount, setStakeAmount] = useState('');

  const predictions = [
    {
      id: 1,
      format: 'video' as const,
      user: { name: 'CryptoSage', avatar: 'CS', prophetScore: 1250, accuracy: 92, verified: true },
      prediction: 'Bitcoin will hit $100K before December 31st, 2025',
      category: 'crypto',
      thumbnail: 'crypto-bg',
      confidence: 85,
      currentOdds: { for: 2.3, against: 1.4 },
      stats: { backers: 1234, staked: '45.2K', comments: 89, shares: 234 },
      deadline: '2025-12-31',
      timeLeft: '42d 15h',
      isHot: true,
    },
    {
      id: 2,
      format: 'text' as const,
      user: { name: 'SportsOracle', avatar: 'SO', prophetScore: 980, accuracy: 88, verified: true },
      prediction: 'Lakers will win the 2025 NBA Championship',
      category: 'sports',
      thumbnail: 'sports-bg',
      confidence: 78,
      currentOdds: { for: 3.1, against: 1.2 },
      stats: { backers: 892, staked: '32.8K', comments: 156, shares: 421 },
      deadline: '2025-06-15',
      timeLeft: '7mo 9d',
      isHot: false,
    },
    {
      id: 3,
      format: 'video' as const,
      user: { name: 'TechVision', avatar: 'TV', prophetScore: 1100, accuracy: 85, verified: false },
      prediction: 'Apple will announce AR glasses at WWDC 2025',
      category: 'tech',
      thumbnail: 'tech-bg',
      confidence: 72,
      currentOdds: { for: 1.8, against: 1.6 },
      stats: { backers: 2103, staked: '67.5K', comments: 312, shares: 189 },
      deadline: '2025-06-09',
      timeLeft: '7mo 3d',
      isHot: true,
    },
  ];

  const handleStake = (type: 'for' | 'against') => setShowStakeModal(type);

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentVideo > 0) setCurrentVideo(currentVideo - 1);
    else if (direction === 'down' && currentVideo < predictions.length - 1) setCurrentVideo(currentVideo + 1);
  };

  const pred = predictions[currentVideo];

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0">
        <div className={`absolute inset-0 ${
          pred.thumbnail === 'crypto-bg' ? 'bg-gradient-to-br from-cyan-900/20 to-zinc-900' :
          pred.thumbnail === 'sports-bg' ? 'bg-gradient-to-br from-purple-900/20 to-zinc-900' :
          'bg-gradient-to-br from-blue-900/20 to-zinc-900'
        }`}>
          {pred.format === 'video' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-32 h-32 text-zinc-800" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="max-w-xl w-full bg-zinc-950/60 border border-zinc-800 p-6">
                <div className="text-sm text-zinc-500 mb-2">Text Prediction</div>
                <div className="text-2xl md:text-3xl font-bold leading-tight">
                  “{pred.prediction}”
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-zinc-950/80 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-zinc-950 to-transparent z-10" />
      </div>

      {/* Compact Top Bar (no brand – TopNav already exists) */}
      <div className="absolute top-0 right-0 p-4 flex items-center space-x-2 z-20">
        <div className="px-3 py-1 bg-zinc-900/80 border border-zinc-800 text-xs font-semibold">
          {pred.category}
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pb-28 md:pb-6">
        <div className="max-w-2xl">
          {pred.isHot && (
            <div className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-500 text-zinc-950 text-xs font-bold mb-3">
              <Flame className="w-4 h-4" />
              <span>HOT</span>
            </div>
          )}

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-cyan-500 text-zinc-950 font-bold text-lg flex items-center justify-center border-2 border-white">
              {pred.user.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg">{pred.user.name}</span>
                {pred.user.verified && (
                  <div className="w-5 h-5 bg-cyan-500 flex items-center justify-center">
                    <Award className="w-3 h-3 text-zinc-950" />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-zinc-400">
                <span className="flex items-center">
                  <Crown className="w-3 h-3 mr-1 text-cyan-500" />
                  {pred.user.prophetScore}
                </span>
                <span>{pred.user.accuracy}% accuracy</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-cyan-500 text-zinc-950 font-bold text-sm">Follow</button>
          </div>

          <div className="mb-4">
            <p className="text-2xl font-bold mb-3 leading-tight">{pred.prediction}</p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center text-zinc-400">
                <Clock className="w-4 h-4 mr-1" />
                <span>{pred.timeLeft} left</span>
              </div>
              <div className="flex items-center text-cyan-500 font-semibold">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{pred.confidence}% confident</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-zinc-900/80 border border-zinc-800 p-3">
              <div className="text-xs text-zinc-500 mb-1">Total Staked</div>
              <div className="font-bold">${pred.stats.staked}</div>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 p-3">
              <div className="text-xs text-zinc-500 mb-1">Backers</div>
              <div className="font-bold">{pred.stats.backers}</div>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 p-3">
              <div className="text-xs text-zinc-500 mb-1">Comments</div>
              <div className="font-bold">{pred.stats.comments}</div>
            </div>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 p-4 mb-4">
            <div className="text-xs text-zinc-500 mb-2">Current Odds</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Stake FOR</div>
                <div className="text-2xl font-bold text-cyan-500">{pred.currentOdds.for}x</div>
              </div>
              <div className="text-zinc-600 text-2xl">VS</div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Stake AGAINST</div>
                <div className="text-2xl font-bold text-red-500">{pred.currentOdds.against}x</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-4 bottom-28 md:bottom-24 z-30 flex flex-col items-center space-y-6">
        <button onClick={() => handleStake('for')} className="relative group">
          <div className="w-16 h-16 bg-cyan-500 flex flex-col items-center justify-center hover:bg-cyan-400 transition">
            <ThumbsUp className="w-7 h-7 text-zinc-950" />
          </div>
          <div className="text-center mt-2">
            <div className="text-xs font-bold">BELIEVE</div>
            <div className="text-xs text-zinc-500">{pred.stats.backers}</div>
          </div>
        </button>
        <button onClick={() => handleStake('against')} className="relative group">
          <div className="w-16 h-16 bg-red-500 flex flex-col items-center justify-center hover:bg-red-400 transition">
            <ThumbsDown className="w-7 h-7 text-zinc-950" />
          </div>
          <div className="text-center mt-2">
            <div className="text-xs font-bold">DOUBT</div>
            <div className="text-xs text-zinc-500">789</div>
          </div>
        </button>
        <button className="relative group">
          <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-cyan-500 transition">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="text-xs text-center mt-2 text-zinc-500">{pred.stats.comments}</div>
        </button>
        <button className="relative group">
          <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-cyan-500 transition">
            <Share2 className="w-6 h-6" />
          </div>
          <div className="text-xs text-center mt-2 text-zinc-500">{pred.stats.shares}</div>
        </button>
        <button className="relative group">
          <div className="w-14 h-14 bg-yellow-500 flex items-center justify-center hover:bg-yellow-400 transition animate-pulse">
            <Zap className="w-6 h-6 text-zinc-950" />
          </div>
          <div className="text-xs text-center mt-2 font-bold text-yellow-500">QUICK</div>
        </button>
      </div>

      <div className="absolute right-24 md:right-28 top-1/2 -translate-y-1/2 z-30 flex flex-col space-y-4">
        <button onClick={() => handleScroll('up')} disabled={currentVideo === 0} className={`w-12 h-12 border border-zinc-800 flex items-center justify-center transition ${currentVideo === 0 ? 'bg-zinc-900/50 text-zinc-700 cursor-not-allowed' : 'bg-zinc-900/80 hover:bg-zinc-800 hover:border-cyan-500'}`}>
          <ChevronUp className="w-6 h-6" />
        </button>
        <button onClick={() => handleScroll('down')} disabled={currentVideo === predictions.length - 1} className={`w-12 h-12 border border-zinc-800 flex items-center justify-center transition ${currentVideo === predictions.length - 1 ? 'bg-zinc-900/50 text-zinc-700 cursor-not-allowed' : 'bg-zinc-900/80 hover:bg-zinc-800 hover:border-cyan-500'}`}>
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute right-4 top-24 z-20 bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm">
        <span className="font-bold text-cyan-500">{currentVideo + 1}</span>
        <span className="text-zinc-500"> / {predictions.length}</span>
      </div>

      {showStakeModal && (
        <div className="absolute inset-0 bg-zinc-950/95 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{showStakeModal === 'for' ? 'Stake FOR' : 'Stake AGAINST'}</h3>
                <button onClick={() => setShowStakeModal(null)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <p className="text-sm text-zinc-500">{showStakeModal === 'for' ? 'I believe this prediction will come true' : 'I doubt this prediction will happen'}</p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="text-sm text-zinc-500 mb-2">Your prediction:</div>
                <div className="p-4 bg-zinc-950 border border-zinc-800">
                  <p className="font-semibold mb-2">{pred.prediction}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>by {pred.user.name}</span>
                    <span>{pred.timeLeft} left</span>
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
                    <button key={amount} onClick={() => setStakeAmount(amount.toString())} className="flex-1 py-2 bg-zinc-950 border border-zinc-800 text-xs font-semibold hover:border-cyan-500 transition">
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6 p-4 bg-zinc-950 border border-zinc-800">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-zinc-500">Current Odds</span>
                  <span className={`text-sm font-bold ${showStakeModal === 'for' ? 'text-cyan-500' : 'text-red-500'}`}>{showStakeModal === 'for' ? pred.currentOdds.for : pred.currentOdds.against}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500">Potential Return</span>
                  <span className="text-sm font-bold text-white">
                    {stakeAmount ? (parseFloat(stakeAmount) * (showStakeModal === 'for' ? pred.currentOdds.for : pred.currentOdds.against)).toFixed(2) : '0.00'} FORE
                  </span>
                </div>
              </div>
              <button className={`w-full py-4 font-bold text-zinc-950 ${showStakeModal === 'for' ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-red-500 hover:bg-red-400'} transition`}>
                {showStakeModal === 'for' ? 'Confirm Belief' : 'Confirm Doubt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


