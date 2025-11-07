"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Loader2, X } from "lucide-react";
import { predictionRegistryAbi } from "@/abis/predictionRegistry";
import type { PredictionRegistryFunction } from "@/abis/predictionRegistry";

type FormatOption = "video" | "text";

interface CreatePredictionModalProps {
  open: boolean;
  onClose: () => void;
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
  const { wallets } = useWallets();

  type PrivyWalletWithClient = {
    walletClient?: {
      writeContract: (args: {
        address: `0x${string}`;
        abi: typeof predictionRegistryAbi;
        functionName: PredictionRegistryFunction;
        account: `0x${string}`;
        args: [string, number, string, bigint, number];
      }) => Promise<string>;
    };
  };

  const primaryWallet = wallets[0] as (typeof wallets)[number] &
    PrivyWalletWithClient;
  const walletClient = primaryWallet?.walletClient;
  const account = primaryWallet?.address as `0x${string}` | undefined;

  const registryAddress = process.env
    .NEXT_PUBLIC_PREDICTION_REGISTRY_ADDRESS as `0x${string}` | undefined;

  const [format, setFormat] = useState<FormatOption>("video");
  const [category, setCategory] = useState<string>(
    CATEGORY_OPTIONS[0] ?? "crypto"
  );
  const [contentCid, setContentCid] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [creatorFee, setCreatorFee] = useState<string>("250");
  const [customCategory, setCustomCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [portalElement, setPortalElement] = useState<Element | null>(null);

  useEffect(() => {
    setMounted(true);
    setPortalElement(document.body);
    return () => setMounted(false);
  }, []);

  const resolvedCategory = useMemo(() => {
    return category === "custom"
      ? customCategory.trim().toLowerCase()
      : category;
  }, [category, customCategory]);

  const resetState = () => {
    setFormat("video");
    setCategory(CATEGORY_OPTIONS[0] ?? "crypto");
    setCustomCategory("");
    setContentCid("");
    setDescription("");
    setDeadline("");
    setCreatorFee("250");
    setTxStatus(null);
    setTxError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetState();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!ready || !authenticated) {
      setTxError("Connect your wallet before creating a prediction.");
      return;
    }

    if (!walletClient || !account) {
      setTxError(
        "Wallet client not available. Please reconnect and try again."
      );
      return;
    }

    if (!registryAddress) {
      setTxError(
        "Registry contract address is missing. Check environment configuration."
      );
      return;
    }

    if (!contentCid.trim()) {
      setTxError("Content CID is required.");
      return;
    }

    if (!resolvedCategory) {
      setTxError("Category is required.");
      return;
    }

    if (!deadline) {
      setTxError("Please select a deadline.");
      return;
    }

    const deadlineSeconds = Math.floor(new Date(deadline).getTime() / 1000);
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (
      !Number.isFinite(deadlineSeconds) ||
      deadlineSeconds <= nowSeconds + 3600
    ) {
      setTxError("Deadline must be at least one hour in the future.");
      return;
    }

    const feeValue = Number(creatorFee);
    if (!Number.isFinite(feeValue) || feeValue < 0 || feeValue > 10_000) {
      setTxError("Creator fee must be between 0 and 10,000 basis points.");
      return;
    }

    try {
      setIsSubmitting(true);
      setTxError(null);
      setTxStatus("Submitting transaction...");

      const formatValue = format === "video" ? 0 : 1;
      const descriptionSuffix = description.trim()
        ? `\n${description.trim()}`
        : "";
      const content = `${contentCid.trim()}${descriptionSuffix}`;

      const hash = await walletClient.writeContract({
        address: registryAddress,
        abi: predictionRegistryAbi,
        functionName: "createPrediction",
        account,
        args: [
          content,
          formatValue,
          resolvedCategory,
          BigInt(deadlineSeconds),
          Math.floor(feeValue),
        ],
      });

      setTxStatus(`Transaction sent: ${hash}`);

      resetState();
      onClose();
    } catch (error) {
      const message = (error as Error).message || "Transaction failed";
      setTxError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !mounted || !portalElement) return null;

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm px-3 sm:px-0">
      <div className="w-full max-w-md sm:max-w-xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-5 text-white"
        >
          <div className="flex items-start justify-between">
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
              className="text-zinc-500 hover:text-white transition"
              aria-label="Close create prediction modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
              Content CID / URL
            </label>
            <input
              type="text"
              value={contentCid}
              onChange={(event) => setContentCid(event.target.value)}
              placeholder={
                format === "video"
                  ? "ipfs://... or https://..."
                  : "CID or reference"
              }
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add extra context for your prediction"
              rows={3}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

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
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-zinc-500">
                Creator Fee (bps)
              </label>
              <input
                type="number"
                value={creatorFee}
                onChange={(event) => setCreatorFee(event.target.value)}
                min={0}
                max={10_000}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500">
                Default 250 bps (2.5%). Cap at 10,000 bps (100%).
              </p>
            </div>
          </div>

          {txError && <p className="text-xs text-red-400">{txError}</p>}
          {txStatus && !txError && (
            <p className="text-xs text-cyan-400">{txStatus}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Publish Prediction"
            )}
          </button>
        </form>
      </div>
    </div>,
    portalElement
  );
}
