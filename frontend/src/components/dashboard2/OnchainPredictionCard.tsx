import React from "react";
import { OnchainMarket } from "@/hooks/useOnchainMarkets";
import { useMyMarketPositions } from "@/hooks/useMyMarketPositions";
import { usePrivy } from "@privy-io/react-auth";

interface OnchainPredictionCardProps {
  market: OnchainMarket;
  userStake?: {
    yesAmountRaw: bigint;
    noAmountRaw: bigint;
  };
}

export const OnchainPredictionCard: React.FC<OnchainPredictionCardProps> = ({
  market,
  userStake,
}) => {
  const yesStaked = userStake?.yesAmountRaw || BigInt(0);
  const noStaked = userStake?.noAmountRaw || BigInt(0);
  const totalStaked = yesStaked + noStaked;
  const hasStake = totalStaked > BigInt(0);

  // Calculate time remaining
  const now = Math.floor(Date.now() / 1000);
  const timeRemaining = market.deadlineTimestamp - now;
  const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60));
  const hoursRemaining = Math.floor(
    (timeRemaining % (24 * 60 * 60)) / (60 * 60)
  );

  const formatTimeLeft = () => {
    if (timeRemaining <= 0) return "Closed";
    if (daysRemaining > 0) return `${daysRemaining}d`;
    if (hoursRemaining > 0) return `${hoursRemaining}h`;
    return "Soon";
  };

  const formatKP = (wei: bigint) => {
    const num = Number(wei) / 1e18;
    if (!Number.isFinite(num)) return "0";
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Determine user's prediction side
  const userPrediction =
    yesStaked > BigInt(0) && noStaked > BigInt(0)
      ? "Both"
      : yesStaked > BigInt(0)
      ? "Yes"
      : noStaked > BigInt(0)
      ? "No"
      : null;

  // Calculate potential winnings (simplified - would need market odds)
  const potentialWinnings = hasStake ? formatKP(totalStaked * BigInt(2)) : "0";

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-2 flex-1">
          {market.question || "Untitled Prediction"}
        </p>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
          #{market.id}
        </span>
      </div>

      {hasStake && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <p className="text-gray-500 dark:text-gray-400">Your Prediction:</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {userPrediction}
            </p>
          </div>
          <div className="flex justify-between items-center text-sm">
            <p className="text-gray-500 dark:text-gray-400">Your Stake:</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {formatKP(totalStaked)} KP
            </p>
          </div>
          <div className="flex justify-between items-center text-sm">
            <p className="text-gray-500 dark:text-gray-400">
              Potential Winnings:
            </p>
            <p className="font-bold text-green-500">+{potentialWinnings} KP</p>
          </div>
        </div>
      )}

      {!hasStake && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          No stake placed yet
        </div>
      )}

      <div className="w-full bg-gray-200 dark:bg-black/20 rounded-full h-1.5 mt-1">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${
              timeRemaining > 0
                ? Math.min(100, (timeRemaining / (7 * 24 * 60 * 60)) * 100)
                : 0
            }%`,
          }}
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
        Closes in {formatTimeLeft()}
      </p>
    </div>
  );
};
