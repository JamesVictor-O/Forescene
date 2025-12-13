import React from "react";
import { X } from "lucide-react";
import CreatePredictionStep1 from "./CreatePredictionStep1";

interface CreatePredictionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (marketId: number, question: string) => void;
}

export const CreatePredictionModal: React.FC<CreatePredictionModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-[101] w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-[1100px] sm:mx-4 sm:rounded-2xl bg-surface-light dark:bg-surface-dark border-t sm:border border-gray-200 dark:border-white/10 shadow-2xl overflow-y-auto flex flex-col">
        <div className="sticky top-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-surface-light dark:bg-surface-dark z-10 backdrop-blur-sm">
          <h3 className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold">
            Create Prediction
          </h3>
          <button
            aria-label="Close Modal"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors -mr-2"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-6">
          <CreatePredictionStep1
            onClose={onClose}
            onSuccess={(marketId, question) => {
              if (onSuccess) {
                onSuccess(marketId, question);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePredictionModal;
