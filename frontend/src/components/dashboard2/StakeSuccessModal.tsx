import React from "react";
import { CheckCircle } from "lucide-react";
import Button from "./ui/Button";

interface StakeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  outcome: string; // "Yes", "No", or outcome label
  marketId?: number;
  question?: string;
  txHash?: string;
}

export const StakeSuccessModal: React.FC<StakeSuccessModalProps> = ({
  isOpen,
  onClose,
  amount,
  outcome,
  marketId,
  question,
  txHash,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-200 dark:border-white/10">
        <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
          {/* Success Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 dark:text-green-400" />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Stake Successful! 🎉
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Your bet has been placed successfully
            </p>
          </div>

          {/* Stake Info */}
          <div className="w-full p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Amount Staked
                </p>
                <p className="text-xl font-bold text-primary">{amount} KP</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Your Prediction
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {outcome}
                </p>
              </div>
              {marketId && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Market ID
                  </p>
                  <p className="text-base font-bold text-primary">#{marketId}</p>
                </div>
              )}
              {question && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Question
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                    {question}
                  </p>
                </div>
              )}
              {txHash && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Transaction Hash
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono">
                    {txHash}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Button onClick={onClose} className="w-full sm:w-auto min-w-[200px]">
            Close
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Good luck with your prediction!
          </p>
        </div>
      </div>
    </div>
  );
};

