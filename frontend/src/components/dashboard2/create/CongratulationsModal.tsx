import React from "react";
import { CheckCircle } from "lucide-react";
import Button from "../ui/Button";

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId?: number;
  question?: string;
}

export const CongratulationsModal: React.FC<CongratulationsModalProps> = ({
  isOpen,
  onClose,
  marketId,
  question,
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
              Congratulations! 🎉
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Your prediction has been created successfully
            </p>
          </div>

          {/* Market Info */}
          {marketId && (
            <div className="w-full p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Market ID
              </p>
              <p className="text-lg font-bold text-primary">#{marketId}</p>
              {question && (
                <>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-3 mb-2">
                    Question
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                    {question}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={() => {
              onClose();
              // Ensure we're on dashboard tab
              window.location.hash = "";
            }}
            className="w-full sm:w-auto min-w-[200px]"
          >
            View Dashboard
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            You can now start placing bets on your prediction
          </p>
        </div>
      </div>
    </div>
  );
};
