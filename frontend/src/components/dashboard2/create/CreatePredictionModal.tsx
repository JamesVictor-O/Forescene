import React from "react";
import { X } from "lucide-react";
import CreatePredictionStep1 from "./CreatePredictionStep1";

interface CreatePredictionModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreatePredictionModal: React.FC<CreatePredictionModalProps> = ({
  open,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-3">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-[101] w-full max-w-[1100px] max-h-[90vh] overflow-y-auto mx-4 rounded-2xl bg-brand-dark border border-white/10 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-brand-dark">
          <h3 className="text-white text-lg font-bold">Create Prediction</h3>
          <button
            aria-label="Close Modal"
            className="text-white/80 hover:text-white p-2"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <div className="px-6 py-6">
          <CreatePredictionStep1 />
        </div>
      </div>
    </div>
  );
};

export default CreatePredictionModal;
