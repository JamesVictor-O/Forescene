"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Flame,
  TrendingUp,
  Clock,
  Award,
  Crown,
  Copy as CopyIcon,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";
import {
  useAllPredictions,
  type PredictionRecord,
} from "@/hooks/usePredictions";
import { useStakeFor } from "@/hooks/useStakeFor";
import { useStakeAgainst } from "@/hooks/useStakeAgainst";
import { useCopyPrediction } from "@/hooks/useCopyPrediction";

type FeedMediaType = "video" | "image" | "text";

type FeedItem = {
  id: number;
  format: "video" | "text";
  mediaType: FeedMediaType;
  mediaUrl?: string;
  posterUrl?: string;
  textContent?: string;
  summary?: string;
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
  stats: {
    backers: number;
    staked: string;
    stakedFor: string;
    stakedAgainst: string;
    comments: number;
    shares: number;
  };
  deadline: string;
  timeLeft: string;
  isHot: boolean;
  copyCount: number;
  recommendedStake: number;
  contentUrl?: string;
};

export default function MixedFeed() {
  const [stakeForItemId, setStakeForItemId] = useState<null | {
    id: number;
    type: "for" | "against" | "copy";
  }>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const { ready, authenticated } = usePrivy();
  const { data: chainPredictions, isLoading: isPredictionsLoading } =
    useAllPredictions();

  // Use the new hooks for staking
  const {
    stakeFor,
    isStaking: isStakingFor,
    isApproving: isApprovingFor,
    error: stakeForError,
    currentStep: stakeForStep,
    reset: resetStakeFor,
  } = useStakeFor();

  const {
    stakeAgainst,
    isStaking: isStakingAgainst,
    isApproving: isApprovingAgainst,
    error: stakeAgainstError,
    currentStep: stakeAgainstStep,
    reset: resetStakeAgainst,
  } = useStakeAgainst();

  const {
    copyPrediction,
    isCopying,
    isApproving: isApprovingCopy,
    error: copyError,
    currentStep: copyStep,
    reset: resetCopy,
  } = useCopyPrediction();

  // Determine processing state from hooks
  const isProcessing =
    isStakingFor ||
    isStakingAgainst ||
    isCopying ||
    isApprovingFor ||
    isApprovingAgainst ||
    isApprovingCopy;

  // Get error from appropriate hook
  const currentError = stakeForError || stakeAgainstError || copyError || null;

  const quickAmounts = useMemo(() => [10, 25, 50, 100], []);
  const shortenAddress = useCallback(
    (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`,
    []
  );

  // Track current time as state - updates every minute to refresh expired predictions
  const [currentTime, setCurrentTime] = useState(() =>
    Math.floor(Date.now() / 1000)
  );

  // Update the time periodically (every 60 seconds) to keep deadline checks accurate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Use useMemo instead of useEffect + setState to avoid cascading renders
  const baseFeedItems = useMemo(() => {
    const predictions = Array.isArray(chainPredictions) ? chainPredictions : [];

    if (predictions.length === 0) {
      return isPredictionsLoading ? [] : [];
    }

    const nowSeconds = currentTime;
    const activePredictions = predictions.filter(
      (prediction: PredictionRecord) =>
        prediction.isActive &&
        prediction.status === "ACTIVE" &&
        prediction.deadline > nowSeconds
    );

    return activePredictions.map((prediction: PredictionRecord) =>
      mapPredictionToFeedItem(prediction, shortenAddress)
    );
  }, [chainPredictions, isPredictionsLoading, shortenAddress, currentTime]);

  // Separate state for optimistic UI updates (like copy/reshare)
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<number, FeedItem>
  >(new Map());

  // Merge base feed items with optimistic updates
  const feedItems = useMemo(() => {
    if (optimisticUpdates.size === 0) {
      return baseFeedItems;
    }

    // Apply optimistic updates
    const updated = baseFeedItems.map((item) => {
      const optimistic = optimisticUpdates.get(item.id);
      return optimistic ? { ...item, ...optimistic } : item;
    });

    return updated;
  }, [baseFeedItems, optimisticUpdates]);

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

    try {
      setTxError(null);
      setTxStatus(null);

      const predictionId = stakeForItemId.id;
      let result;

      if (stakeForItemId.type === "for") {
        result = await stakeFor({ predictionId, amount: stakeAmount });
        setTxStatus(`Transaction sent: ${result.hash}`);
      } else if (stakeForItemId.type === "against") {
        result = await stakeAgainst({ predictionId, amount: stakeAmount });
        setTxStatus(`Transaction sent: ${result.hash}`);
      } else if (stakeForItemId.type === "copy") {
        result = await copyPrediction({ predictionId, amount: stakeAmount });
        setTxStatus(`Transaction sent: ${result.hash}`);

        // Optimistic UI update for copy - the query will refresh automatically
        const base = feedItems.find((item) => item.id === stakeForItemId.id);
        if (base) {
          setOptimisticUpdates((prev) => {
            const updated = new Map(prev);
            updated.set(base.id, {
              ...base,
              copyCount: base.copyCount + 1,
              stats: {
                ...base.stats,
                backers: base.stats.backers + 1,
              },
            });
            return updated;
          });
        }
      }

      // Close modal on success
      setTimeout(() => {
        setStakeForItemId(null);
        setStakeAmount("");
        setTxStatus(null);
        resetStakeFor();
        resetStakeAgainst();
        resetCopy();
      }, 2000);
    } catch (error) {
      const message = (error as Error).message || "Transaction failed";
      setTxError(message);
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

  if (isPredictionsLoading && feedItems.length === 0) {
    return (
      <div className="w-full max-w-4xl xl:max-w-5xl mx-auto px-3 sm:px-4">
        <LoadingSkeleton message="Loading the freshest predictions…" />
      </div>
    );
  }

  if (!isPredictionsLoading && feedItems.length === 0) {
    return (
      <div className="w-full max-w-4xl xl:max-w-5xl mx-auto px-3 sm:px-4">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-10 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            No predictions yet
          </h3>
          <p className="text-sm text-zinc-500">
            Be the first to create a prediction on Forescene.
          </p>
        </div>
      </div>
    );
  }

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
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-[0_20px_60px_rgba(8,8,12,0.55)] max-h-[90vh] overflow-y-auto">
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
              {(txError || currentError) && (
                <p className="text-[11px] sm:text-xs text-red-400 mt-2">
                  {txError || currentError?.message || "Transaction failed"}
                </p>
              )}
              {(isApprovingFor || isApprovingAgainst || isApprovingCopy) && (
                <p className="text-[11px] sm:text-xs text-yellow-400 mt-2">
                  Approving tokens... Please confirm in your wallet.
                </p>
              )}
              {(stakeForStep === "waiting" ||
                stakeAgainstStep === "waiting" ||
                copyStep === "waiting") && (
                <p className="text-[11px] sm:text-xs text-cyan-400 mt-2">
                  Waiting for blockchain confirmation...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mapPredictionToFeedItem(
  prediction: PredictionRecord,
  shortenAddress: (address: string) => string
): FeedItem {
  const metadata = (prediction.metadata ?? {}) as Record<string, unknown>;
  // Use title from prediction record (which includes Pinata metadata.name)
  // Fallback to textContent for text predictions, then metadata, then ID
  const title =
    typeof prediction.title === "string" && prediction.title.trim()
      ? prediction.title.trim()
      : typeof prediction.textContent === "string" &&
        prediction.textContent.trim()
      ? prediction.textContent.split("\n")[0].trim().slice(0, 100)
      : typeof metadata.title === "string" && metadata.title.trim()
      ? metadata.title.trim()
      : typeof metadata.name === "string" && metadata.name.trim()
      ? metadata.name.trim()
      : typeof metadata.content === "string" && metadata.content.trim()
      ? metadata.content.trim().slice(0, 100)
      : `Prediction #${prediction.id}`;
  const summary =
    typeof prediction.summary === "string"
      ? prediction.summary
      : typeof metadata.summary === "string"
      ? metadata.summary
      : typeof metadata.description === "string"
      ? metadata.description
      : undefined;
  const oddsData = metadata.odds as
    | { for?: number; against?: number }
    | undefined;
  const odds = {
    for: Number(oddsData?.for ?? 0),
    against: Number(oddsData?.against ?? 0),
  };
  const mediaType: FeedMediaType =
    prediction.mediaType ??
    (prediction.format === "video"
      ? "video"
      : typeof metadata.image === "string" && metadata.image.length > 0
      ? "image"
      : "text");
  const mediaUrl =
    prediction.mediaUrl ??
    (mediaType === "video"
      ? prediction.contentUrl
      : mediaType === "image"
      ? (metadata.image as string)
      : undefined);
  const textContent =
    prediction.textContent ??
    (mediaType === "text"
      ? typeof metadata.content === "string"
        ? metadata.content
        : typeof metadata.body === "string"
        ? metadata.body
        : summary ?? ""
      : undefined);

  const deadlineDate = new Date(prediction.deadline * 1000);
  const formattedDeadline = isNaN(deadlineDate.getTime())
    ? "TBD"
    : deadlineDate.toISOString().split("T")[0];

  return {
    id: prediction.id,
    format: prediction.format,
    mediaType,
    mediaUrl,
    textContent,
    user: {
      name: shortenAddress(prediction.creator),
      avatar: prediction.creator.slice(2, 4).toUpperCase(),
      prophetScore: 0,
      accuracy: 0,
      verified: false,
    },
    prediction: title,
    summary,
    category: prediction.category,
    thumbnail: determineThumbnail(prediction.category),
    confidence: 65,
    currentOdds: odds,
    stats: {
      backers: prediction.copyCount,
      staked: prediction.formattedTotalStaked
        ? formatStakeAmount(prediction.formattedTotalStaked)
        : "0",
      stakedFor: prediction.formattedForPool
        ? formatStakeAmount(prediction.formattedForPool)
        : "0",
      stakedAgainst: prediction.formattedAgainstPool
        ? formatStakeAmount(prediction.formattedAgainstPool)
        : "0",
      comments: 0,
      shares: 0,
    },
    deadline: formattedDeadline,
    timeLeft: prediction.timeRemaining ?? "—",
    isHot: prediction.copyCount > 50,
    copyCount: prediction.copyCount,
    recommendedStake: 50,
    contentUrl: prediction.contentUrl,
  };
}

function determineThumbnail(category: string): FeedItem["thumbnail"] {
  const normalized = category.toLowerCase();
  if (normalized.includes("sport")) return "sports-bg";
  if (normalized.includes("tech") || normalized.includes("ai"))
    return "tech-bg";
  return "crypto-bg";
}

function formatStakeAmount(amount: string): string {
  const num = parseFloat(amount);
  if (num === 0) return "0";
  if (num < 0.01) return "< 0.01";
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(2);
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

        {/* Content Rendering */}
        {item.mediaType === "video" && item.mediaUrl ? (
          <div className="w-full flex justify-center rounded-sm overflow-hidden bg-black mb-3">
            <video
              src={item.mediaUrl}
              className="w-full max-h-[480px] object-cover"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        ) : item.mediaType === "image" && item.mediaUrl ? (
          <div className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-sm overflow-hidden mb-3">
            <Image
              src={item.mediaUrl}
              alt={item.prediction}
              width={720}
              height={1024}
              className="w-full h-auto object-cover"
            />
          </div>
        ) : (
          <div className="bg-zinc-950/50 border border-zinc-800/50 p-3 sm:p-4 md:p-5 mb-3 rounded-sm">
            <p className="text-base sm:text-lg md:text-xl font-bold leading-snug">
              {item.textContent ?? item.prediction}
            </p>
          </div>
        )}

        {/* Prediction Details */}
        <div className="mb-3 sm:mb-4">
          <p className="text-base sm:text-lg md:text-xl font-bold leading-tight text-white">
            {item.prediction}
          </p>
          {/* {item.summary && (
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              {item.summary}
            </p>
          )} */}
          {item.mediaType === "text" && item.textContent && (
            <p className="mt-2 text-sm sm:text-base text-zinc-300 whitespace-pre-wrap">
              {item.textContent}
            </p>
          )}
        </div>

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="bg-zinc-950/50 border border-zinc-800/50 p-2 sm:p-3 rounded-sm">
            <div className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">
              Total Staked
            </div>
            <div className="font-bold text-xs sm:text-sm md:text-base text-cyan-400">
              {item.stats.staked} FORE
            </div>
          </div>
          <div className="bg-zinc-950/50 border border-zinc-800/50 p-2 sm:p-3 rounded-sm">
            <div className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">
              Staked FOR
            </div>
            <div className="font-bold text-xs sm:text-sm md:text-base text-cyan-300">
              {item.stats.stakedFor} FORE
            </div>
          </div>
          <div className="bg-zinc-950/50 border border-zinc-800/50 p-2 sm:p-3 rounded-sm">
            <div className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">
              Staked AGAINST
            </div>
            <div className="font-bold text-xs sm:text-sm md:text-base text-red-300">
              {item.stats.stakedAgainst} FORE
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
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => onCopy(item)}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 font-semibold text-xs sm:text-sm hover:bg-cyan-500/30 hover:border-cyan-500/40 transition-all rounded-sm flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <CopyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Reshare</span>
          </button>
          <button
            onClick={() => onStake(item.id, "for")}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold text-xs sm:text-sm hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all rounded-sm flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">Believe</span>
          </button>
          <button
            onClick={() => onStake(item.id, "against")}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-950/50 border border-zinc-800/50 font-semibold text-xs sm:text-sm hover:border-cyan-500/50 transition-all rounded-sm flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">Doubt</span>
          </button>
          
          <button className="px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-950/50 border border-zinc-800/50 text-xs sm:text-sm hover:border-cyan-500/50 transition-all rounded-sm flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
