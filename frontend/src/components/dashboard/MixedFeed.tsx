"use client";

import React, { useMemo, useState } from "react";
import {
  Play,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Flame,
  TrendingUp,
  Clock,
  Video,
  Award,
  Crown,
  Copy as CopyIcon,
  Loader2,
} from "lucide-react";
import { useWallets, usePrivy } from "@privy-io/react-auth";
import { parseUnits } from "viem";
import { predictionMarketAbi } from "@/abis/predictionMarket";
import type { PredictionMarketFunction } from "@/abis/predictionMarket";

type FeedItem = {
  id: number;
  format: "video" | "text";
  user: {
    name: string;
    avatar: string;
    prophetScore: number;
    accuracy: number;
    verified: boolean;
  };
  prediction: string;
  category: string;
  thumbnail: "crypto-bg" | "sports-bg" | "tech-bg";
  confidence: number;
  currentOdds: { for: number; against: number };
  stats: { backers: number; staked: string; comments: number; shares: number };
  deadline: string;
  timeLeft: string;
  isHot: boolean;
  copyCount: number;
  recommendedStake: number;
};

const DEFAULT_FEED_ITEMS: FeedItem[] = [
  {
    id: 1,
    format: "video",
    user: {
      name: "CryptoSage",
      avatar: "CS",
      prophetScore: 1250,
      accuracy: 92,
      verified: true,
    },
    prediction: "Bitcoin will hit $100K before December 31st, 2025",
    category: "crypto",
    thumbnail: "crypto-bg",
    confidence: 85,
    currentOdds: { for: 2.3, against: 1.4 },
    stats: { backers: 1234, staked: "45.2K", comments: 89, shares: 234 },
    deadline: "2025-12-31",
    timeLeft: "42d 15h",
    isHot: true,
    copyCount: 150,
    recommendedStake: 100,
  },
  {
    id: 2,
    format: "text",
    user: {
      name: "SportsOracle",
      avatar: "SO",
      prophetScore: 980,
      accuracy: 88,
      verified: true,
    },
    prediction: "Lakers will win the 2025 NBA Championship",
    category: "sports",
    thumbnail: "sports-bg",
    confidence: 78,
    currentOdds: { for: 3.1, against: 1.2 },
    stats: { backers: 892, staked: "32.8K", comments: 156, shares: 421 },
    deadline: "2025-06-15",
    timeLeft: "7mo 9d",
    isHot: false,
    copyCount: 80,
    recommendedStake: 50,
  },
  {
    id: 3,
    format: "video",
    user: {
      name: "TechVision",
      avatar: "TV",
      prophetScore: 1100,
      accuracy: 85,
      verified: false,
    },
    prediction: "Apple will announce AR glasses at WWDC 2025",
    category: "tech",
    thumbnail: "tech-bg",
    confidence: 72,
    currentOdds: { for: 1.8, against: 1.6 },
    stats: { backers: 2103, staked: "67.5K", comments: 312, shares: 189 },
    deadline: "2025-06-09",
    timeLeft: "7mo 3d",
    isHot: true,
    copyCount: 120,
    recommendedStake: 80,
  },
  {
    id: 4,
    format: "text",
    user: {
      name: "MarketMaven",
      avatar: "MM",
      prophetScore: 845,
      accuracy: 81,
      verified: false,
    },
    prediction: "ETH flips $5K by Q1 2025, driven by ETF inflows",
    category: "crypto",
    thumbnail: "crypto-bg",
    confidence: 69,
    currentOdds: { for: 2.0, against: 1.7 },
    stats: { backers: 512, staked: "12.1K", comments: 48, shares: 96 },
    deadline: "2025-03-31",
    timeLeft: "78d 3h",
    isHot: false,
    copyCount: 70,
    recommendedStake: 40,
  },
];

export default function MixedFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>(DEFAULT_FEED_ITEMS);
  const [stakeForItemId, setStakeForItemId] = useState<null | {
    id: number;
    type: "for" | "against" | "copy";
  }>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const { wallets } = useWallets();
  const { ready, authenticated } = usePrivy();
  const predictionMarketAddress = process.env
    .NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}` | undefined;

  type PrivyWalletWithClient = {
    walletClient?: {
      writeContract: (args: {
        address: `0x${string}`;
        abi: typeof predictionMarketAbi;
        functionName: PredictionMarketFunction;
        account: `0x${string}`;
        args: [bigint, bigint];
      }) => Promise<string>;
    };
  };

  const primaryWallet = wallets[0] as (typeof wallets)[number] &
    PrivyWalletWithClient;
  const walletClient = primaryWallet?.walletClient;
  const account = primaryWallet?.address as `0x${string}` | undefined;

  const quickAmounts = useMemo(() => [10, 25, 50, 100], []);
  const shortenAddress = (addr: string) =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const createReshareItem = (source: FeedItem): FeedItem => {
    const timestampId = Date.now();
    const label = account ? `You (${shortenAddress(account)})` : "You";

    return {
      ...source,
      id: timestampId,
      user: {
        name: label,
        avatar: "YOU",
        prophetScore: source.user.prophetScore,
        accuracy: source.user.accuracy,
        verified: false,
      },
      stats: {
        ...source.stats,
        shares: source.stats.shares + 1,
      },
      timeLeft: source.timeLeft,
      copyCount: source.copyCount,
    };
  };

  const active = useMemo(() => {
    if (!stakeForItemId) return null;
    return feedItems.find((i) => i.id === stakeForItemId.id) ?? null;
  }, [feedItems, stakeForItemId]);

  const onOpenStake = (id: number, type: "for" | "against") => {
    setStakeForItemId({ id, type });
    setStakeAmount("");
    setTxStatus(null);
    setTxError(null);
  };

  const onOpenCopy = (item: FeedItem) => {
    setStakeForItemId({ id: item.id, type: "copy" });
    setStakeAmount(item.recommendedStake.toString());
    setTxStatus(null);
    setTxError(null);
  };

  const handleConfirmStake = async () => {
    if (!stakeForItemId || !stakeAmount) {
      setTxError("Enter a stake amount");
      return;
    }

    if (!ready || !authenticated) {
      setTxError("Connect your wallet to continue");
      return;
    }

    if (!walletClient || !predictionMarketAddress || !account) {
      setTxError("Wallet client not ready");
      return;
    }

    try {
      setIsProcessing(true);
      setTxError(null);

      const parsedAmount = parseUnits(stakeAmount, 18);
      const predictionId = BigInt(stakeForItemId.id);

      const functionName =
        stakeForItemId.type === "copy"
          ? "copyPrediction"
          : stakeForItemId.type === "for"
          ? "stakeFor"
          : "stakeAgainst";

      const hash = await walletClient.writeContract({
        address: predictionMarketAddress,
        abi: predictionMarketAbi,
        functionName,
        account,
        args: [predictionId, parsedAmount],
      });

      setTxStatus(`Transaction sent: ${hash}`);

      if (stakeForItemId.type === "copy") {
        setFeedItems((prev) => {
          const base = prev.find((item) => item.id === stakeForItemId.id);
          if (!base) return prev;

          const updatedBase: FeedItem = {
            ...base,
            copyCount: base.copyCount + 1,
            stats: {
              ...base.stats,
              backers: base.stats.backers + 1,
            },
          };

          const reshareCard = createReshareItem(updatedBase);
          const remaining = prev.filter(
            (item) => item.id !== stakeForItemId.id
          );
          return [reshareCard, updatedBase, ...remaining];
        });
      }

      setStakeForItemId(null);
      setStakeAmount("");
    } catch (error) {
      const message = (error as Error).message || "Transaction failed";
      setTxError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const oddsMultiplier =
    active && stakeForItemId
      ? stakeForItemId.type === "against"
        ? active.currentOdds.against
        : active.currentOdds.for
      : 0;

  const confirmLabel =
    stakeForItemId?.type === "copy"
      ? "Confirm Reshare"
      : stakeForItemId?.type === "for"
      ? "Confirm Belief"
      : "Confirm Doubt";

  const confirmClasses =
    stakeForItemId?.type === "against"
      ? "bg-red-500 hover:bg-red-400"
      : "bg-cyan-500 hover:bg-cyan-400";

  const headerTitle =
    stakeForItemId?.type === "copy"
      ? "Reshare Prediction"
      : stakeForItemId?.type === "for"
      ? "Stake FOR"
      : "Stake AGAINST";

  const headerDescription =
    stakeForItemId?.type === "copy"
      ? "Reshare this prediction with your followers, stake FORE alongside the creator, and boost their influence."
      : stakeForItemId?.type === "for"
      ? "I believe this prediction will come true"
      : "I doubt this prediction will happen";

  return (
    <div className="w-full max-w-4xl xl:max-w-5xl mx-auto">
      {/* Feed container with proper spacing */}
      <div className="space-y-3 sm:space-y-4 md:space-y-5">
        {feedItems.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            onStake={onOpenStake}
            onCopy={onOpenCopy}
          />
        ))}
      </div>

      {/* Stake Modal - Responsive */}
      {stakeForItemId && active && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 w-full sm:w-auto sm:min-w-[400px] sm:max-w-md sm:rounded-lg rounded-t-2xl sm:rounded-b-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg sm:text-xl font-bold">{headerTitle}</h3>
                <button
                  onClick={() => setStakeForItemId(null)}
                  className="text-zinc-500 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500">
                {headerDescription}
              </p>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Prediction Preview */}
              <div className="mb-4 sm:mb-6">
                <div className="text-xs sm:text-sm text-zinc-500 mb-2">
                  Your prediction:
                </div>
                <div className="p-3 sm:p-4 bg-zinc-950 border border-zinc-800 rounded-sm">
                  <p className="font-semibold text-sm sm:text-base mb-2">
                    {active.prediction}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>by {active.user.name}</span>
                    <span>{active.timeLeft} left</span>
                  </div>
                </div>
              </div>

              {/* Stake Amount Input */}
              <div className="mb-4 sm:mb-6">
                <label className="text-sm font-semibold mb-2 block">
                  Stake Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-950 border border-zinc-800 text-base sm:text-lg font-semibold outline-none focus:border-cyan-500 rounded-sm"
                  />
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                    FORE
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setStakeAmount(amount.toString())}
                      className="py-1.5 sm:py-2 bg-zinc-950 border border-zinc-800 text-xs font-semibold hover:border-cyan-500 transition rounded-sm"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Odds & Returns */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-zinc-950 border border-zinc-800 rounded-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-zinc-500">
                    Current Odds
                  </span>
                  <span
                    className={`text-sm sm:text-base font-bold ${
                      stakeForItemId.type === "for"
                        ? "text-cyan-500"
                        : "text-red-500"
                    }`}
                  >
                    {stakeForItemId.type === "for"
                      ? active.currentOdds.for
                      : active.currentOdds.against}
                    x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-zinc-500">
                    Potential Return
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    {stakeAmount
                      ? (parseFloat(stakeAmount) * oddsMultiplier).toFixed(2)
                      : "0.00"}{" "}
                    FORE
                  </span>
                </div>
                {stakeForItemId?.type === "copy" && (
                  <p className="text-[10px] sm:text-xs text-zinc-500">
                    You and the creator will share influence—resharing always
                    stakes on the belief side.
                  </p>
                )}
              </div>

              {/* Confirm Button */}
              <button
                className={`w-full py-3 sm:py-4 font-bold text-zinc-950 transition rounded-sm ${confirmClasses}`}
                onClick={handleConfirmStake}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                  </span>
                ) : (
                  confirmLabel
                )}
              </button>

              {txStatus && (
                <p className="text-[11px] sm:text-xs text-cyan-400 mt-2">
                  {txStatus}
                </p>
              )}
              {txError && (
                <p className="text-[11px] sm:text-xs text-red-400 mt-2">
                  {txError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedCard({
  item,
  onStake,
  onCopy,
}: {
  item: FeedItem;
  onStake: (id: number, type: "for" | "against") => void;
  onCopy: (item: FeedItem) => void;
}) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-md hover:border-zinc-700/50 transition-all duration-300 ">
      <div className="p-3 sm:p-4 md:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-xs sm:text-sm flex items-center justify-center rounded-sm shrink-0">
              {item.user.avatar}
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm sm:text-base flex items-center gap-1.5">
                <span className="truncate">{item.user.name}</span>
                {item.user.verified && (
                  <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-cyan-500/20 border border-cyan-500/30 rounded-sm shrink-0">
                    <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
                  </span>
                )}
                {item.copyCount >= 100 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-sm text-[10px] uppercase tracking-wide text-cyan-400">
                    <CopyIcon className="w-3 h-3" /> Reshare Magnet
                  </span>
                )}
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-500 flex items-center gap-2 sm:gap-3 mt-0.5">
                <span className="flex items-center gap-0.5 text-cyan-400">
                  <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {item.user.prophetScore}
                </span>
                <span>{item.user.accuracy}%</span>
              </div>
            </div>
          </div>

          {/* Category Badge */}
          <div className="px-2 py-1 bg-zinc-950/50 border border-zinc-800/50 text-[10px] sm:text-xs rounded-sm shrink-0 ml-2 uppercase">
            {item.category}
          </div>
        </div>

        {item.user.avatar === "YOU" && (
          <div className="text-[10px] sm:text-xs text-cyan-400 mb-3">
            You reshared this prediction to amplify the signal.
          </div>
        )}

        {/* Hot Badge */}
        {item.isHot && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[10px] font-bold mb-3 rounded-sm">
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>HOT</span>
          </div>
        )}

        {/* Content - Video or Text */}
        {item.format === "video" ? (
          <div className="  w-full flex justify-center h-80 rounded-sm overflow-hidden">
            {/* Responsive aspect ratio container */}
            <div className="aspect-9/16  w-full relative bg-black">
              {/* Background gradient */}
              <div
                className={`absolute inset-0 ${
                  item.thumbnail === "crypto-bg"
                    ? "bg-linear-to-br from-cyan-900/20 to-zinc-900"
                    : item.thumbnail === "sports-bg"
                    ? "bg-linear-to-br from-purple-900/20 to-zinc-900"
                    : "bg-linear-to-br from-blue-900/20 to-zinc-900"
                }`}
              />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-800/80 transition cursor-pointer">
                  <Play
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white ml-1"
                    fill="currentColor"
                  />
                </div>
              </div>

              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-linear-to-t from-zinc-950 to-transparent" />

              {/* Duration badge */}
              <div className="absolute top-2 right-2 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800/50 text-[10px] px-1.5 py-0.5 flex items-center gap-0.5 rounded-sm">
                <Video className="w-2.5 h-2.5" />
                <span>15s</span>
              </div>

              {/* Prediction text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <p className="text-white font-bold text-sm sm:text-base leading-tight line-clamp-2">
                  {item.prediction}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950/50 border border-zinc-800/50 p-3 sm:p-4 md:p-5 mb-3 rounded-sm">
            <p className="text-base sm:text-lg md:text-xl font-bold leading-snug">
              {item.prediction}
            </p>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs sm:text-sm mb-3">
          <div className="flex items-center text-zinc-400">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>{item.timeLeft}</span>
          </div>
          <div className="flex items-center text-cyan-500 font-semibold">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>{item.confidence}%</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="bg-zinc-950/50 border border-zinc-800/50 p-2 sm:p-3 rounded-sm">
            <div className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">
              Staked
            </div>
            <div className="font-bold text-xs sm:text-sm md:text-base">
              ${item.stats.staked}
            </div>
          </div>
          <div className="bg-zinc-950/50 border border-zinc-800/50 p-2 sm:p-3 rounded-sm">
            <div className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">
              Backers
            </div>
            <div className="font-bold text-xs sm:text-sm md:text-base">
              {item.stats.backers.toLocaleString()}
            </div>
          </div>
          <div className="bg-zinc-950/50 border border-zinc-800/50 p-2 sm:p-3 rounded-sm">
            <div className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">
              Comments
            </div>
            <div className="font-bold text-xs sm:text-sm md:text-base">
              {item.stats.comments}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-500 mb-3">
          <span>
            Reshared by{" "}
            <span className="text-white font-semibold">
              {item.copyCount.toLocaleString()}
            </span>{" "}
            followers
          </span>
          <span className="text-cyan-400 font-semibold hidden sm:inline">
            Signal Strength +{item.copyCount >= 100 ? 12 : 6}%
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3">
          {/* Copy Button */}
          <button
            onClick={() => onCopy(item)}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 font-semibold text-xs sm:text-sm hover:bg-cyan-500/30 hover:border-cyan-500/40 transition-all rounded-sm flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <CopyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Reshare</span>
          </button>

          {/* Believe/For Button */}
          <button
            onClick={() => onStake(item.id, "for")}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold text-xs sm:text-sm hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all rounded-sm flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">Believe</span>
          </button>

          {/* Doubt/Against Button */}
          <button
            onClick={() => onStake(item.id, "against")}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-950/50 border border-zinc-800/50 font-semibold text-xs sm:text-sm hover:border-cyan-500/50 transition-all rounded-sm flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">Doubt</span>
          </button>

          {/* Comment Button */}
          <button className="px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-950/50 border border-zinc-800/50 text-xs sm:text-sm hover:border-cyan-500/50 transition-all rounded-sm flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
