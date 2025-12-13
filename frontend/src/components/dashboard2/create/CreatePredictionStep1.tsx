import React, { useMemo, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

import { Category, PredictionFormState } from "../types";
import { getContract, getNetworkConfig } from "@/config/contracts";
import { predictionManagerAbi } from "@/abis/predictionManager";
import { knowledgePointTokenAbi } from "@/abis/knowledgePointToken";
import { custom, createPublicClient, createWalletClient, http } from "viem";

const BLOCKDAG_CHAIN = {
  id: getNetworkConfig().chainId,
  name: getNetworkConfig().name,
  nativeCurrency: { name: "BDAG", symbol: "BDAG", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.awakening.bdagscan.com"] },
  },
};
const BLOCKDAG_HEX_CHAIN_ID = "0x413";

export const CreatePredictionStep1: React.FC<{
  onClose?: () => void;
  onSuccess?: (marketId: number, question: string) => void;
}> = ({ onClose, onSuccess }) => {
  const [formState, setFormState] = useState<PredictionFormState>({
    title: "",
    category: Category.MUSIC,
    description: "",
  });
  // Calculate default date (7 days from now) in YYYY-MM-DD format for date input
  const getDefaultDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
  };
  const [deadlineDate, setDeadlineDate] = useState<string>(getDefaultDate());
  const [deadlineTime, setDeadlineTime] = useState<string>("23:59"); // Default to end of day
  const [initialStake, setInitialStake] = useState<string>("10");
  const [initialSide, setInitialSide] = useState<0 | 1>(0); // 0 = Yes, 1 = No
  const [marketType, setMarketType] = useState<0 | 1>(1);
  const [initialOutcomeLabel, setInitialOutcomeLabel] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const categories = Object.values(Category);

  const predictionManager = useMemo(() => getContract("predictionManager"), []);

  const handleSubmit = async () => {
    setError(null);
    setTxHash(null);
    if (!formState.title.trim()) {
      setError("Question is required");
      return;
    }
    const selectedDateTime = new Date(`${deadlineDate}T${deadlineTime}`);
    const now = new Date();
    if (selectedDateTime <= now) {
      setError("Deadline must be in the future");
      return;
    }
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 365);
    if (selectedDateTime > maxDate) {
      setError("Deadline cannot be more than 365 days in the future");
      return;
    }
    if (!initialStake || Number(initialStake) <= 0) {
      setError("Initial stake must be greater than 0");
      return;
    }
    if (marketType === 0 && !initialOutcomeLabel.trim()) {
      setError("CrowdWisdom market type requires an initial outcome label");
      return;
    }

    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("Wallet not found. Please connect a wallet.");
      return;
    }

    try {
      setIsSubmitting(true);
      const ethereum = (window as any).ethereum;
      const currentChain = await ethereum.request({ method: "eth_chainId" });
      if (currentChain?.toLowerCase() !== BLOCKDAG_HEX_CHAIN_ID) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BLOCKDAG_HEX_CHAIN_ID }],
          });
        } catch (switchErr: any) {
          if (switchErr?.code === 4902) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: BLOCKDAG_HEX_CHAIN_ID,
                  chainName: BLOCKDAG_CHAIN.name,
                  rpcUrls: BLOCKDAG_CHAIN.rpcUrls.default.http,
                  nativeCurrency: BLOCKDAG_CHAIN.nativeCurrency,
                },
              ],
            });
          } else {
            throw switchErr;
          }
        }
      }

      const walletClient = createWalletClient({
        chain: BLOCKDAG_CHAIN,
        transport: custom(ethereum),
      });
      const publicClient = createPublicClient({
        chain: BLOCKDAG_CHAIN,
        transport: http("https://rpc.awakening.bdagscan.com"),
      });

      const [account] = await walletClient.getAddresses();
      if (!account) {
        setError("No account found. Please connect a wallet.");
        setIsSubmitting(false);
        return;
      }
      const selectedDateTime = new Date(`${deadlineDate}T${deadlineTime}`);
      const deadlineTs = BigInt(Math.floor(selectedDateTime.getTime() / 1000));
      const initialStakeWei = BigInt(Math.floor(Number(initialStake) * 1e18));

      // Get KP Token contract
      const kpToken = getContract("kpToken");

      // Check and approve KP token allowance if needed
      const allowance = (await publicClient.readContract({
        address: kpToken.address,
        abi: knowledgePointTokenAbi,
        functionName: "allowance",
        args: [account, predictionManager.address],
      })) as bigint;

      if (allowance < initialStakeWei) {
        // Need to approve
        try {
          const approveGas = await publicClient.estimateContractGas({
            address: kpToken.address,
            abi: knowledgePointTokenAbi,
            functionName: "approve",
            args: [predictionManager.address, initialStakeWei],
            account,
          });

          const approveHash = await walletClient.writeContract({
            address: kpToken.address,
            abi: knowledgePointTokenAbi,
            functionName: "approve",
            args: [predictionManager.address, initialStakeWei],
            account,
            chain: BLOCKDAG_CHAIN,
            gas: (approveGas * BigInt(11)) / BigInt(10),
          });
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        } catch (approveErr: any) {
          const msg =
            approveErr?.shortMessage ||
            approveErr?.message ||
            "Failed to approve KP tokens. Please try again.";
          setError(msg);
          setIsSubmitting(false);
          return;
        }
      }
      let gasEstimate: bigint;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          address: predictionManager.address,
          abi: predictionManagerAbi,
          functionName: "createMarket",
          args: [
            marketType as any,
            formState.title,
            formState.category,
            deadlineTs,
            initialStakeWei,
            initialSide,
            initialOutcomeLabel,
          ] as any,
          account,
        });
      } catch (estErr: any) {
        const msg =
          estErr?.shortMessage ||
          estErr?.message ||
          "Gas estimation failed. Please check your inputs and try again.";
        setError(msg);
        setIsSubmitting(false);
        return;
      }

      let hash: `0x${string}`;
      try {
        hash = await walletClient.writeContract({
          address: predictionManager.address,
          abi: predictionManagerAbi,
          functionName: "createMarket",
          args: [
            marketType as any,
            formState.title,
            formState.category,
            deadlineTs,
            initialStakeWei,
            initialSide,
            initialOutcomeLabel,
          ] as any,
          account,
          chain: BLOCKDAG_CHAIN,
          gas: (gasEstimate * BigInt(11)) / BigInt(10),
        });
      } catch (writeErr: any) {
        const msg =
          writeErr?.shortMessage ||
          writeErr?.message ||
          "Transaction failed. Make sure you are the contract owner (deployer) to create markets.";
        setError(msg);
        setIsSubmitting(false);
        return;
      }

      setTxHash(hash);

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      let newMarketId: number;
      try {
        const nextId = (await publicClient.readContract({
          address: predictionManager.address,
          abi: predictionManagerAbi,
          functionName: "nextMarketId",
        })) as bigint;
        newMarketId = Number(nextId) - 1;
      } catch {
        newMarketId = 0; // Fallback
      }

      if (onSuccess) {
        onSuccess(newMarketId, formState.title);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.shortMessage || e?.message || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-[960px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <h1 className="text-gray-900 dark:text-white text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">
          Create a New Prediction
        </h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-6 sm:gap-y-8">
        <div className="lg:col-span-1">
          <Input
            label="Prediction Title / Question"
            name="title"
            placeholder="e.g., Who will win 'Artist of the Year' at the 2024 Headies Awards?"
            value={formState.title}
            onChange={handleInputChange}
          />
        </div>
        <div className="lg:col-span-1">
          <Select
            label="Category"
            name="category"
            options={categories}
            value={formState.category}
            onChange={handleInputChange}
          />
        </div>
        {/* Deadline Date */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Deadline Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            max={(() => {
              const maxDate = new Date();
              maxDate.setDate(maxDate.getDate() + 365);
              return maxDate.toISOString().split("T")[0];
            })()}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Select the deadline date
          </p>
        </div>
        {/* Deadline Time */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Deadline Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={deadlineTime}
            onChange={(e) => setDeadlineTime(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Select the deadline time
          </p>
        </div>
        {/* Initial Stake */}
        <div className="lg:col-span-1">
          <Input
            label="Initial Stake (KP)"
            name="initialStake"
            type="number"
            min={0}
            step="0.1"
            value={initialStake}
            onChange={(e) => setInitialStake(e.target.value)}
            placeholder="10"
          />
        </div>
        {/* Market Type */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Market Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMarketType(0);
                // Don't clear label - user might want to keep it
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                marketType === 0
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300"
              }`}
            >
              CrowdWisdom
            </button>
            <button
              type="button"
              onClick={() => {
                setMarketType(1);
                setInitialOutcomeLabel("");
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                marketType === 1
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300"
              }`}
            >
              Binary
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {marketType === 0
              ? "Multiple outcome options (requires initial outcome label)"
              : "Simple Yes/No prediction"}
          </p>
        </div>
        {/* Initial Side - Only for Binary predictions */}
        {marketType === 1 && (
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Initial Prediction <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInitialSide(0)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  initialSide === 0
                    ? "bg-accent-teal text-white"
                    : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setInitialSide(1)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  initialSide === 1
                    ? "bg-accent-magenta text-white"
                    : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                }`}
              >
                No
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your initial stake will be placed on this side
            </p>
          </div>
        )}
        {/* Initial Outcome Label - Only for CrowdWisdom predictions */}
        {marketType === 0 && (
          <div className="lg:col-span-2">
            <Input
              label="Initial Outcome Label * (Required for CrowdWisdom)"
              name="initialOutcomeLabel"
              placeholder="e.g., 'Option A', 'Team A Wins', 'Candidate X', etc."
              value={initialOutcomeLabel}
              onChange={(e) => setInitialOutcomeLabel(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Describe the initial outcome option for this CrowdWisdom market.
              This field is required.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-white/10 mt-2 sm:mt-4">
        <Button
          variant="secondary"
          disabled
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Back
        </Button>
        <Button
          className="w-full sm:w-auto order-1 sm:order-2"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create on-chain"}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/40 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {txHash && (
        <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/40 rounded-lg px-4 py-3 break-all">
          Created! Tx: {txHash}
        </div>
      )}
    </div>
  );
};

export default CreatePredictionStep1;
