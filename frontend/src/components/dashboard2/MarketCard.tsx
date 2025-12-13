import React, { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { OnchainMarket } from "@/hooks/useOnchainMarkets";
import { knowledgePointTokenAbi } from "@/abis/knowledgePointToken";
import { predictionManagerAbi } from "@/abis/predictionManager";
import { getContract, getNetworkConfig } from "@/config/contracts";
import { custom, createPublicClient, createWalletClient, http } from "viem";
import { StakeSuccessModal } from "./StakeSuccessModal";

const BLOCKDAG_RPC = "https://rpc.awakening.bdagscan.com";
const BLOCKDAG_HEX_CHAIN_ID = "0x413"; // 1043

export const MarketCard: React.FC<{
  market: OnchainMarket;
  onPlaced?: () => void;
  userStake?: {
    yesAmountRaw: bigint;
    noAmountRaw: bigint;
  };
}> = ({ market, onPlaced, userStake }) => {
  const [amount, setAmount] = useState<string>("10");
  const [loading, setLoading] = useState<"YES" | "NO" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOutcome, setSuccessOutcome] = useState<"YES" | "NO" | null>(null);

  const kpToken = useMemo(() => getContract("kpToken"), []);
  const predictionManager = useMemo(() => getContract("predictionManager"), []);
  const chainId = getNetworkConfig().chainId;

  const handleStake = async (outcome: "YES" | "NO") => {
    setErr(null);
    setTx(null);
    if (!amount || Number(amount) <= 0) {
      setErr("Enter an amount greater than 0");
      return;
    }
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setErr("Wallet not found. Please connect a wallet.");
      return;
    }
    const ethereum = (window as any).ethereum;
    try {
      setLoading(outcome);
      // ensure chain
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
                  chainName: getNetworkConfig().name,
                  rpcUrls: [BLOCKDAG_RPC],
                  nativeCurrency: {
                    name: "BDAG",
                    symbol: "BDAG",
                    decimals: 18,
                  },
                },
              ],
            });
          } else {
            throw switchErr;
          }
        }
      }

      const walletClient = createWalletClient({
        chain: {
          id: chainId,
          name: getNetworkConfig().name,
          nativeCurrency: { name: "BDAG", symbol: "BDAG", decimals: 18 },
          rpcUrls: { default: { http: [BLOCKDAG_RPC] } },
        },
        transport: custom(ethereum),
      });
      const publicClient = createPublicClient({
        chain: {
          id: chainId,
          name: getNetworkConfig().name,
          nativeCurrency: { name: "BDAG", symbol: "BDAG", decimals: 18 },
          rpcUrls: { default: { http: [BLOCKDAG_RPC] } },
        },
        transport: http(BLOCKDAG_RPC),
      });

      const [account] = await walletClient.getAddresses();
      if (!account) throw new Error("No account found.");

      const amountWei = BigInt(Math.floor(Number(amount) * 1e18));

      // approve if needed
      const allowance = (await publicClient.readContract({
        address: kpToken.address,
        abi: knowledgePointTokenAbi,
        functionName: "allowance",
        args: [account, predictionManager.address],
      })) as bigint;
      if (allowance < amountWei) {
        const approveGas = await publicClient.estimateContractGas({
          address: kpToken.address,
          abi: knowledgePointTokenAbi,
          functionName: "approve",
          args: [predictionManager.address, amountWei],
          account,
        });
        const approveHash = await walletClient.writeContract({
          address: kpToken.address,
          abi: knowledgePointTokenAbi,
          functionName: "approve",
          args: [predictionManager.address, amountWei],
          account,
          gas: (approveGas * BigInt(11)) / BigInt(10),
        });
        // Wait for approval transaction to be confirmed before proceeding
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      const choice = outcome === "YES" ? 1 : 2; // enum Outcome {INVALID, YES, NO}
      const stakeGas = await publicClient.estimateContractGas({
        address: predictionManager.address,
        abi: predictionManagerAbi,
        functionName: "placePrediction",
        args: [BigInt(market.id), choice, amountWei],
        account,
      });

      const txHash = await walletClient.writeContract({
        address: predictionManager.address,
        abi: predictionManagerAbi,
        functionName: "placePrediction",
        args: [BigInt(market.id), choice, amountWei],
        account,
        gas: (stakeGas * BigInt(11)) / BigInt(10),
      });
      setTx(txHash);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      // Show success modal
      setSuccessOutcome(outcome);
      setShowSuccessModal(true);
      
      if (onPlaced) onPlaced();
    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || "Transaction failed");
    } finally {
      setLoading(null);
    }
  };

  const category = market.category || "Uncategorized";

  const getBadgeColor = () => {
    switch (category) {
      case "AfroBeats":
        return "bg-accent-magenta/90 text-white";
      case "Nollywood":
        return "bg-primary/90 text-slate-900";
      case "Sports":
        return "bg-accent-teal/90 text-slate-900";
      case "Fashion":
        return "bg-accent-magenta/90 text-white";
      case "Culture":
        return "bg-primary/90 text-slate-900";
      default:
        return "bg-primary/90 text-slate-900";
    }
  };

  const formatTimeLeft = () => {
    if (!market.deadlineTimestamp) return "—";
    const now = Math.floor(Date.now() / 1000);
    const diff = market.deadlineTimestamp - now;
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const formatKP = (wei: bigint) => {
    const num = Number(wei) / 1e18;
    if (!Number.isFinite(num)) return "0";
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Check if user has staked
  const yesStaked = userStake?.yesAmountRaw || BigInt(0);
  const noStaked = userStake?.noAmountRaw || BigInt(0);
  const totalUserStake = yesStaked + noStaked;
  const hasStake = totalUserStake > BigInt(0);

  // Determine user's prediction side
  const userPrediction =
    yesStaked > BigInt(0) && noStaked > BigInt(0)
      ? "Both"
      : yesStaked > BigInt(0)
      ? "Yes"
      : noStaked > BigInt(0)
      ? "No"
      : null;

  // Get category accent color for border/decoration
  const getCategoryAccent = () => {
    switch (category) {
      case "AfroBeats":
        return "border-l-accent-magenta";
      case "Nollywood":
        return "border-l-primary";
      case "Sports":
        return "border-l-accent-teal";
      case "Fashion":
        return "border-l-accent-magenta";
      case "Culture":
        return "border-l-primary";
      default:
        return "border-l-primary";
    }
  };

  return (
    <div
      className={`flex flex-col rounded-xl bg-white dark:bg-card-dark shadow-md border-l-4 ${getCategoryAccent()} border border-slate-200 dark:border-white/5 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-black/40 group`}
    >
      {/* Header Section with Badges */}
      <div className="relative px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getBadgeColor()}`}
          >
            {category}
          </div>
          <div className="px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 rounded-full">
            #{market.id}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {market.question || "Untitled Prediction"}
        </h3>
      </div>

      {/* Stats Section */}
      <div className="px-4 pb-4 border-b border-slate-200 dark:border-white/5">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-white/70 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-md">
            <Clock size={14} />
            <span className="font-medium">Ends in {formatTimeLeft()}</span>
          </div>
          <div className="font-bold text-primary text-base">
            {market.totalStaked && market.totalStaked > BigInt(0)
              ? `${(Number(market.totalStaked) / 1e18).toLocaleString(
                  undefined,
                  { maximumFractionDigits: 0 }
                )} KP`
              : "0 KP"}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-4 grow">
        {hasStake ? (
          /* Stats View - User has already staked */
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
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
                    {formatKP(totalUserStake)} KP
                  </p>
                </div>
                {yesStaked > BigInt(0) && (
                  <div className="flex justify-between items-center text-xs text-teal-600 dark:text-teal-400">
                    <span>Yes Stake:</span>
                    <span className="font-semibold">{formatKP(yesStaked)} KP</span>
                  </div>
                )}
                {noStaked > BigInt(0) && (
                  <div className="flex justify-between items-center text-xs text-pink-600 dark:text-pink-400">
                    <span>No Stake:</span>
                    <span className="font-semibold">{formatKP(noStaked)} KP</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    You've already placed your stake on this market
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Staking View - User hasn't staked yet */
          <>
            {/* Stake Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 dark:text-white/70 mb-2">
                Stake Amount (KP)
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button
                onClick={() => handleStake("YES")}
                disabled={loading !== null}
                className="w-full h-10 rounded-full bg-accent-teal/10 dark:bg-accent-teal/20 text-teal-700 dark:text-accent-teal font-bold text-sm hover:bg-accent-teal hover:text-slate-900 dark:hover:bg-accent-teal dark:hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "YES" ? "Staking..." : "Yes"}
              </button>
              <button
                onClick={() => handleStake("NO")}
                disabled={loading !== null}
                className="w-full h-10 rounded-full bg-accent-magenta/10 dark:bg-accent-magenta/20 text-pink-700 dark:text-accent-magenta font-bold text-sm hover:bg-accent-magenta hover:text-white dark:hover:bg-accent-magenta dark:hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "NO" ? "Staking..." : "No"}
              </button>
            </div>

            {/* Error/Success Messages */}
            {err && (
              <div className="mt-3 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/40 rounded-lg px-3 py-2">
                {err}
              </div>
            )}
            {tx && (
              <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/40 rounded-lg px-3 py-2 break-all">
                Success! Tx: {tx}
              </div>
            )}
          </>
        )}
      </div>

      {/* Success Modal */}
      <StakeSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessOutcome(null);
          setAmount("10"); // Reset amount after successful stake
        }}
        amount={amount}
        outcome={successOutcome || "Yes"}
        marketId={market.id}
        question={market.question}
        txHash={tx || undefined}
      />
    </div>
  );
};

