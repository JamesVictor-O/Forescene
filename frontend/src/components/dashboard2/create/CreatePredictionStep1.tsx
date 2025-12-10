import React, { useMemo, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import { Category, PredictionFormState } from "../types";
import { getContract, getNetworkConfig } from "@/config/contracts";
import { predictionManagerAbi } from "@/abis/predictionManager";
import { custom, createPublicClient, createWalletClient, http } from "viem";

const BLOCKDAG_CHAIN = {
  id: getNetworkConfig().chainId,
  name: getNetworkConfig().name,
  nativeCurrency: { name: "BDAG", symbol: "BDAG", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.awakening.bdagscan.com"] },
  },
};
const BLOCKDAG_HEX_CHAIN_ID = "0x413"; // 1043

export const CreatePredictionStep1: React.FC = () => {
  const [formState, setFormState] = useState<PredictionFormState>({
    title: "",
    category: Category.MUSIC,
    description: "",
  });
  const [deadlineDays, setDeadlineDays] = useState<number>(7);
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
      setError("Title is required");
      return;
    }
    if (!formState.description.trim()) {
      setError("Description is required (use as contentCID placeholder)");
      return;
    }
    if (deadlineDays <= 0) {
      setError("Deadline must be at least 1 day in the future");
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

      const deadlineTs = BigInt(
        Math.floor(Date.now() / 1000) + deadlineDays * 24 * 60 * 60
      );
      const platformFeeBps = 500n; // 5% default
      const oracle = account; // default oracle for MVP
      // Estimate gas to avoid gasLimit null issues
      let gasEstimate: bigint;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          address: predictionManager.address,
          abi: predictionManagerAbi,
          functionName: "createMarket",
          args: [
            formState.description,
            formState.category,
            oracle,
            deadlineTs,
            platformFeeBps,
          ],
          account,
        });
      } catch (estErr: any) {
        const msg =
          estErr?.shortMessage ||
          estErr?.message ||
          "Gas estimation failed. Make sure you are the contract owner (deployer).";
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
            formState.description,
            formState.category,
            oracle,
            deadlineTs,
            platformFeeBps,
          ],
          account,
          chain: BLOCKDAG_CHAIN,
          gas: (gasEstimate * 11n) / 10n, // add 10% buffer
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

      // Optional: wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash });
    } catch (e: any) {
      console.error(e);
      setError(e?.shortMessage || e?.message || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[960px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-6">
        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
          Create a New Prediction
        </h1>
        {/* Progress Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <p className="text-white text-base font-medium leading-normal">
              Step 1 of 3: The Question
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: "33%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        {/* Title Input */}
        <div className="lg:col-span-1">
          <Input
            label="Prediction Title / Question"
            name="title"
            placeholder="e.g., Who will win 'Artist of the Year' at the 2024 Headies Awards?"
            value={formState.title}
            onChange={handleInputChange}
          />
        </div>
        {/* Category Select */}
        <div className="lg:col-span-1">
          <Select
            label="Category"
            name="category"
            options={categories}
            value={formState.category}
            onChange={handleInputChange}
          />
        </div>
        {/* Deadline in days */}
        <div className="lg:col-span-1">
          <Input
            label="Deadline (days from now)"
            name="deadline"
            type="number"
            min={1}
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(Number(e.target.value))}
          />
        </div>
        {/* Description Textarea */}
        <div className="lg:col-span-2">
          <Textarea
            label="Brief Description"
            name="description"
            placeholder="Add some context for the prediction event"
            value={formState.description}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Footer / Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10 mt-4">
        <Button variant="secondary" className="w-full sm:w-auto">
          Save as Draft
        </Button>
        <div className="flex flex-col-reverse sm:flex-row gap-4 w-full sm:w-auto">
          <Button variant="secondary" disabled className="w-full sm:w-auto">
            Back
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create on-chain"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm font-medium bg-red-400/10 border border-red-400/40 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {txHash && (
        <div className="text-emerald-400 text-sm font-medium bg-emerald-400/10 border border-emerald-400/40 rounded-lg px-4 py-3 break-all">
          Created! Tx: {txHash}
        </div>
      )}
    </div>
  );
};

export default CreatePredictionStep1;
