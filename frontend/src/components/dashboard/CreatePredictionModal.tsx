"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePrivy } from "@privy-io/react-auth";
import { Loader2, Upload, Video, X } from "lucide-react";
import { useAccount } from "wagmi";

import {
  useCreatePrediction,
  type CreatePredictionStep,
} from "@/hooks/useCreatePrediction";
import type { UploadProgress } from "@/hooks/usePinataUpload";

type FormatOption = "video" | "text";

interface CreatePredictionModalProps {
  open: boolean;
  onClose: () => void;
}

type CategorySectionProps = {
  category: string;
  setCategory: (value: string) => void;
  customCategory: string;
  setCustomCategory: (value: string) => void;
  deadline: string;
  setDeadline: (value: string) => void;
  stakeAmount: string;
  setStakeAmount: (value: string) => void;
};

function CategorySection({
  category,
  setCategory,
  customCategory,
  setCustomCategory,
  deadline,
  setDeadline,
  stakeAmount,
  setStakeAmount,
}: CategorySectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wide text-zinc-500">
          Category
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.toUpperCase()}
            </option>
          ))}
          <option value="custom">CUSTOM</option>
        </select>
      </div>
      {category === "custom" && (
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-zinc-500">
            Custom Category
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={(event) => setCustomCategory(event.target.value)}
            placeholder="e.g. ai, music, gaming"
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            required
          />
        </div>
      )}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wide text-zinc-500">
          Deadline
        </label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
          required
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <label className="text-xs uppercase tracking-wide text-zinc-500">
          Your Stake Amount (FORE) *
        </label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={stakeAmount}
          onChange={(event) => setStakeAmount(event.target.value)}
          placeholder="e.g. 100"
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
          required
        />
        <p className="text-[10px] text-zinc-500">
          Amount of FORE tokens you&apos;re staking on your prediction. This
          will be locked in escrow and shared with winners.
        </p>
      </div>
    </div>
  );
}

function calculatePercentage(
  progress: UploadProgress | null
): number | undefined {
  if (!progress || progress.total === 0) return undefined;
  return Number(((progress.loaded / progress.total) * 100).toFixed(2));
}

function UploadStatusCard({ progress }: { progress: UploadProgress | null }) {
  const percentage = calculatePercentage(progress) ?? 0;
  return (
    <div className="w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-left">
      <p className="text-xs text-zinc-500 mb-2">Uploading to IPFS…</p>
      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-2 bg-cyan-500 transition-all duration-200"
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      <p className="text-[11px] text-zinc-500 mt-2">{percentage}% complete</p>
    </div>
  );
}

function stepMessage(step: CreatePredictionStep) {
  switch (step) {
    case "validating":
      return "Validating prediction details…";
    case "uploading":
      return "Uploading content to IPFS…";
    case "checking-allowance":
      return "Checking token allowance…";
    case "approving":
      return "Approving token spend…";
    case "submitting":
      return "Submitting transaction…";
    case "waiting":
      return "Waiting for blockchain confirmation…";
    case "success":
      return "Prediction created successfully!";
    case "error":
      return "An error occurred. Please try again.";
    default:
      return "";
  }
}

const CATEGORY_OPTIONS = [
  "crypto",
  "sports",
  "entertainment",
  "politics",
  "tech",
];

export default function CreatePredictionModal({
  open,
  onClose,
}: CreatePredictionModalProps) {
  const { ready, authenticated } = usePrivy();
  const { isConnected, address } = useAccount();
  const {
    createPrediction,
    isCreating,
    isUploading,
    uploadProgress,
    currentStep,
    error,
    transactionHash,
    reset,
  } = useCreatePrediction();

  const [format, setFormat] = useState<FormatOption>("video");
  const [category, setCategory] = useState<string>(
    CATEGORY_OPTIONS[0] ?? "crypto"
  );
  const [customCategory, setCustomCategory] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [textContent, setTextContent] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [useExistingCid, setUseExistingCid] = useState(false);
  const [existingCid, setExistingCid] = useState("");
  const [deadline, setDeadline] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");

  const resolvedCategory = useMemo(() => {
    const normalized =
      category === "custom"
        ? customCategory.trim().toLowerCase()
        : category.toLowerCase();
    return normalized || "general";
  }, [category, customCategory]);

  const resetState = () => {
    reset();
    setFormat("video");
    setCategory(CATEGORY_OPTIONS[0] ?? "crypto");
    setCustomCategory("");
    setTitle("");
    setSummary("");
    setTextContent("");
    setVideoFile(null);
    setUseExistingCid(false);
    setExistingCid("");
    setDeadline("");
    setStakeAmount("");
  };

  const handleClose = () => {
    if (isCreating || isUploading) return;
    resetState();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!ready || !authenticated) return;
    if (!deadline) return;

    const deadlineSeconds = new Date(deadline).getTime();
    if (!Number.isFinite(deadlineSeconds)) return;

    const stake = Number(stakeAmount);
    if (!Number.isFinite(stake) || stake <= 0) {
      alert("Please enter a valid stake amount greater than 0");
      return;
    }

    const submission = await createPrediction({
      format,
      category: resolvedCategory,
      deadline: Math.floor(deadlineSeconds / 1000),
      oracle: address || "", // Use connected wallet address as oracle
      title: title.trim() || undefined,
      summary: summary.trim() || undefined,
      existingCid: useExistingCid ? existingCid.trim() : undefined,
      textContent:
        format === "text" && !useExistingCid ? textContent.trim() : undefined,
      file:
        format === "video" && !useExistingCid
          ? videoFile ?? undefined
          : undefined,
    });

    if (submission) {
      resetState();
      onClose();
    }
  };

  const portalElement =
    typeof window !== "undefined" ? (document.body as Element) : null;

  if (!open || !portalElement) return null;

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm px-3 sm:px-0 py-4 sm:py-8">
      <div className="w-full max-w-md sm:max-w-xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="shrink-0 flex items-start justify-between p-4 sm:p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">
              Create Prediction
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Craft a high-signal prediction and publish it to your followers.
              Video entries get more engagement.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-zinc-500 hover:text-white transition shrink-0 ml-2"
            aria-label="Close create prediction modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-white">
            <div className="grid grid-cols-2 gap-2 bg-zinc-900/60 border border-zinc-800 rounded-md p-1">
              {(
                [
                  { label: "Video", value: "video" },
                  { label: "Text", value: "text" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`py-2 rounded-md text-sm font-medium transition-all ${
                    format === option.value
                      ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                      : "border border-transparent text-zinc-400 hover:text-white"
                  }`}
                  onClick={() => setFormat(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-zinc-500">
                Prediction Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give your prediction a punchy title"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-zinc-500">
                Summary (optional)
              </label>
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Add extra context or the thesis behind your prediction"
                rows={3}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <ContentSection
              format={format}
              useExistingCid={useExistingCid}
              setUseExistingCid={setUseExistingCid}
              existingCid={existingCid}
              setExistingCid={setExistingCid}
              videoFile={videoFile}
              setVideoFile={setVideoFile}
              textContent={textContent}
              setTextContent={setTextContent}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />

            <CategorySection
              category={category}
              setCategory={setCategory}
              customCategory={customCategory}
              setCustomCategory={setCustomCategory}
              deadline={deadline}
              setDeadline={setDeadline}
              stakeAmount={stakeAmount}
              setStakeAmount={setStakeAmount}
            />

            {error && <p className="text-xs text-red-400">{error.message}</p>}
            {!error && transactionHash && (
              <p className="text-xs text-cyan-400 break-all">
                Transaction: {transactionHash}
              </p>
            )}
            {currentStep !== "idle" && (
              <p className="text-[11px] text-zinc-500">
                {stepMessage(currentStep)}
              </p>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="shrink-0 p-4 sm:p-6 border-t border-zinc-800 bg-zinc-950">
            <button
              type="submit"
              disabled={
                isCreating ||
                isUploading ||
                !authenticated ||
                !ready ||
                !isConnected ||
                (format === "video" && !useExistingCid && !videoFile) ||
                (format === "text" && !useExistingCid && !textContent.trim())
              }
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
            >
              {isCreating || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Submitting..."}
                </>
              ) : (
                "Publish Prediction"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    portalElement
  );
}

type ContentSectionProps = {
  format: FormatOption;
  useExistingCid: boolean;
  setUseExistingCid: (value: boolean) => void;
  existingCid: string;
  setExistingCid: (cid: string) => void;
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  textContent: string;
  setTextContent: (value: string) => void;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
};

function ContentSection({
  format,
  useExistingCid,
  setUseExistingCid,
  existingCid,
  setExistingCid,
  videoFile,
  setVideoFile,
  textContent,
  setTextContent,
  isUploading,
  uploadProgress,
}: ContentSectionProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500">
        <span>Prediction Content</span>
        <span className="flex items-center gap-2 text-[11px] text-cyan-300">
          <input
            type="checkbox"
            className="rounded border border-cyan-500/50 bg-transparent"
            checked={useExistingCid}
            onChange={(event) => setUseExistingCid(event.target.checked)}
          />
          Use existing CID
        </span>
      </label>

      {format === "video" ? (
        useExistingCid ? (
          <input
            type="text"
            value={existingCid}
            onChange={(event) => setExistingCid(event.target.value)}
            placeholder="ipfs://CID or https://gateway/ipfs/..."
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            required
          />
        ) : (
          <div className="border-2 border-dashed border-zinc-800 rounded-lg p-4 flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900">
              <Video className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="space-y-1 text-xs text-zinc-500">
              <p>Upload a short-form video prediction (max 100MB).</p>
              {videoFile ? (
                <p className="text-zinc-300">{videoFile.name}</p>
              ) : (
                <p>Select MP4, MOV, or WebM formats.</p>
              )}
            </div>
            <label className="inline-flex items-center gap-2 rounded-md bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 transition cursor-pointer">
              <Upload className="w-4 h-4" />
              Choose file
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setVideoFile(file ?? null);
                }}
              />
            </label>
            {isUploading && <UploadStatusCard progress={uploadProgress} />}
          </div>
        )
      ) : useExistingCid ? (
        <input
          type="text"
          value={existingCid}
          onChange={(event) => setExistingCid(event.target.value)}
          placeholder="ipfs://CID or https://gateway/ipfs/..."
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
          required
        />
      ) : (
        <textarea
          rows={6}
          value={textContent}
          onChange={(event) => setTextContent(event.target.value)}
          placeholder="Write out the full prediction and supporting evidence..."
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
          required
        />
      )}
    </div>
  );
}
