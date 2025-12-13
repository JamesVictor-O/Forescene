import React, { useMemo, useState, useEffect } from "react";
import { Clock, Plus, TrendingUp } from "lucide-react";
import { OnchainMarket } from "@/hooks/useOnchainMarkets";
import { knowledgePointTokenAbi } from "@/abis/knowledgePointToken";
import { predictionManagerAbi } from "@/abis/predictionManager";
import { getContract, getNetworkConfig } from "@/config/contracts";
import { custom, createPublicClient, createWalletClient, http } from "viem";
import { StakeSuccessModal } from "./StakeSuccessModal";
import { usePrivy } from "@privy-io/react-auth";

const BLOCKDAG_RPC = "https://rpc.awakening.bdagscan.com";
const BLOCKDAG_HEX_CHAIN_ID = "0x413";

interface Outcome {
  label: string;
  poolAmount: bigint;
  index: number;
}

export const CrowdWisdomMarketCard: React.FC<{
  market: OnchainMarket;
  onPlaced?: () => void;
  userStake?: {
    outcomeIndex?: number;
    amount?: bigint;
    outcomeLabel?: string;
  };
}> = ({ market, onPlaced, userStake }) => {
  const [amount, setAmount] = useState<string>("10");
  const [newOutcomeLabel, setNewOutcomeLabel] = useState<string>("");
  const [selectedOutcomeIndex, setSelectedOutcomeIndex] = useState<
    number | null
  >(null);
  const [isCreatingOutcome, setIsCreatingOutcome] = useState(false);
  const [loading, setLoading] = useState<"stake" | "create" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [loadingOutcomes, setLoadingOutcomes] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOutcome, setSuccessOutcome] = useState<string | null>(null);

  const kpToken = useMemo(() => getContract("kpToken"), []);
  const predictionManager = useMemo(() => getContract("predictionManager"), []);
  const chainId = getNetworkConfig().chainId;
  const { authenticated, ready } = usePrivy();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userStakeData, setUserStakeData] = useState<{
    outcomeIndex?: number;
    amount?: bigint;
    outcomeLabel?: string;
  } | null>(null);

  // Get wallet address
  useEffect(() => {
    if (typeof window === "undefined" || !authenticated || !ready) {
      setWalletAddress(null);
      return;
    }
    const eth = (window as any).ethereum;
    if (!eth) return;
    eth
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => setWalletAddress(accounts?.[0] || null))
      .catch(() => {});
  }, [authenticated, ready]);

  // Fetch outcomes for this market
  useEffect(() => {
    const fetchOutcomes = async () => {
      if (typeof window === "undefined") {
        setLoadingOutcomes(false);
        return;
      }
      try {
        const publicClient = createPublicClient({
          chain: {
            id: chainId,
            name: getNetworkConfig().name,
            nativeCurrency: { name: "BDAG", symbol: "BDAG", decimals: 18 },
            rpcUrls: { default: { http: [BLOCKDAG_RPC] } },
          },
          transport: http(BLOCKDAG_RPC),
        });

        // Call getMarketOutcomes to fetch all outcomes
        const result = (await publicClient.readContract({
          address: predictionManager.address,
          abi: predictionManagerAbi,
          functionName: "getMarketOutcomes",
          args: [BigInt(market.id)],
        })) as [string[], bigint[]];

        const [outcomeLabels, outcomePools] = result;
        const fetchedOutcomes: Outcome[] = outcomeLabels.map(
          (label, index) => ({
            label,
            poolAmount: outcomePools[index] || BigInt(0),
            index,
          })
        );

        setOutcomes(fetchedOutcomes);

        // Check if user has staked on any outcome
        if (walletAddress) {
          let foundStake: {
            outcomeIndex: number;
            amount: bigint;
            outcomeLabel: string;
          } | null = null;
          for (let i = 0; i < fetchedOutcomes.length; i++) {
            try {
              const stake = (await publicClient.readContract({
                address: predictionManager.address,
                abi: predictionManagerAbi,
                functionName: "getUserOutcomeStake",
                args: [
                  BigInt(market.id),
                  walletAddress as `0x${string}`,
                  BigInt(i),
                ],
              })) as bigint;
              if (stake > BigInt(0)) {
                foundStake = {
                  outcomeIndex: i,
                  amount: stake,
                  outcomeLabel: fetchedOutcomes[i].label,
                };
                break;
              }
            } catch (e) {
              // Continue checking other outcomes
            }
          }
          setUserStakeData(foundStake);
        }
      } catch (e) {
        console.error("Failed to fetch outcomes:", e);
        // Fallback to initialOutcomeLabel if available
        if (market.initialOutcomeLabel) {
          setOutcomes([
            {
              label: market.initialOutcomeLabel,
              poolAmount: market.totalStaked || BigInt(0),
              index: 0,
            },
          ]);
        }
      } finally {
        setLoadingOutcomes(false);
      }
    };
    fetchOutcomes();
  }, [
    market.id,
    market.initialOutcomeLabel,
    chainId,
    predictionManager.address,
    walletAddress,
  ]);

  const handleStakeOnOutcome = async (outcomeIndex: number) => {
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
      setLoading("stake");
      // Chain switching logic (same as MarketCard)
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

      // Approve if needed
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

      // Call stakeOnOutcome for existing outcome
      const stakeGas = await publicClient.estimateContractGas({
        address: predictionManager.address,
        abi: predictionManagerAbi,
        functionName: "stakeOnOutcome",
        args: [BigInt(market.id), BigInt(outcomeIndex), amountWei],
        account,
      });

      const txHash = await walletClient.writeContract({
        address: predictionManager.address,
        abi: predictionManagerAbi,
        functionName: "stakeOnOutcome",
        args: [BigInt(market.id), BigInt(outcomeIndex), amountWei],
        account,
        gas: (stakeGas * BigInt(11)) / BigInt(10),
      });

      setTx(txHash);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Find the outcome label for the modal
      const outcomeLabel =
        outcomes.find((o) => o.index === outcomeIndex)?.label ||
        "Selected Outcome";
      setSuccessOutcome(outcomeLabel);
      setShowSuccessModal(true);

      // Update user stake data
      const [stakeAccount] = await walletClient.getAddresses();
      if (stakeAccount) {
        try {
          const stake = (await publicClient.readContract({
            address: predictionManager.address,
            abi: predictionManagerAbi,
            functionName: "getUserOutcomeStake",
            args: [BigInt(market.id), stakeAccount, BigInt(outcomeIndex)],
          })) as bigint;
          if (stake > BigInt(0)) {
            setUserStakeData({
              outcomeIndex,
              amount: stake,
              outcomeLabel,
            });
          }
        } catch (e) {
          console.error("Failed to fetch user stake:", e);
        }
      }

      if (onPlaced) onPlaced();
    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || "Transaction failed");
    } finally {
      setLoading(null);
    }
  };

  const handleCreateOutcome = async () => {
    setErr(null);
    setTx(null);
    if (!newOutcomeLabel.trim()) {
      setErr("Enter an outcome label");
      return;
    }
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
      setLoading("create");
      // Chain switching logic (same as handleStakeOnOutcome)
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

      // Approve if needed
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

      // Call commentAndStake to create new outcome or stake on existing
      const stakeGas = await publicClient.estimateContractGas({
        address: predictionManager.address,
        abi: predictionManagerAbi,
        functionName: "commentAndStake",
        args: [BigInt(market.id), newOutcomeLabel.trim(), amountWei],
        account,
      });

      const txHash = await walletClient.writeContract({
        address: predictionManager.address,
        abi: predictionManagerAbi,
        functionName: "commentAndStake",
        args: [BigInt(market.id), newOutcomeLabel.trim(), amountWei],
        account,
        gas: (stakeGas * BigInt(11)) / BigInt(10),
      });

      setTx(txHash);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Refresh outcomes
      const result = (await publicClient.readContract({
        address: predictionManager.address,
        abi: predictionManagerAbi,
        functionName: "getMarketOutcomes",
        args: [BigInt(market.id)],
      })) as [string[], bigint[]];
      const [outcomeLabels, outcomePools] = result;
      const fetchedOutcomes: Outcome[] = outcomeLabels.map((label, index) => ({
        label,
        poolAmount: outcomePools[index] || BigInt(0),
        index,
      }));
      setOutcomes(fetchedOutcomes);

      // Update user stake data
      const [userAccount] = await walletClient.getAddresses();
      if (userAccount) {
        // Find the outcome index for the newly created outcome
        const newOutcomeIndex = fetchedOutcomes.findIndex(
          (o) => o.label.toLowerCase() === newOutcomeLabel.trim().toLowerCase()
        );
        if (newOutcomeIndex >= 0) {
          try {
            const stake = (await publicClient.readContract({
              address: predictionManager.address,
              abi: predictionManagerAbi,
              functionName: "getUserOutcomeStake",
              args: [BigInt(market.id), userAccount, BigInt(newOutcomeIndex)],
            })) as bigint;
            if (stake > BigInt(0)) {
              setUserStakeData({
                outcomeIndex: newOutcomeIndex,
                amount: stake,
                outcomeLabel: fetchedOutcomes[newOutcomeIndex].label,
              });
            }
          } catch (e) {
            console.error("Failed to fetch user stake:", e);
          }
        }
      }

      // Show success modal with the new outcome label
      setSuccessOutcome(newOutcomeLabel.trim());
      setShowSuccessModal(true);
      setNewOutcomeLabel(""); // Clear input

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

  const formatKP = (wei: bigint) => {
    const num = Number(wei) / 1e18;
    if (!Number.isFinite(num)) return "0";
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const getOutcomePercentage = (outcomePool: bigint, totalPool: bigint) => {
    if (totalPool === BigInt(0)) return 0;
    return (Number(outcomePool) / Number(totalPool)) * 100;
  };

  // Check if user has staked (use prop if provided, otherwise use fetched data)
  const effectiveUserStake = userStake || userStakeData;
  const hasStake =
    effectiveUserStake?.amount && effectiveUserStake.amount > BigInt(0);

  return (
    <div
      className={`flex flex-col rounded-xl bg-white dark:bg-card-dark shadow-md border-l-4 ${getCategoryAccent()} border border-slate-200 dark:border-white/5 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-black/40 group`}
    >
      {/* Header Section */}
      <div className="relative px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getBadgeColor()}`}
          >
            {category} • CrowdWisdom
          </div>
          <div className="px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 rounded-full">
            #{market.id}
          </div>
        </div>

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
              ? `${formatKP(market.totalStaked)} KP`
              : "0 KP"}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-4 gap-4">
        {hasStake ? (
          /* Stats View - User has already staked */
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-500 dark:text-gray-400">
                    Your Prediction:
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {effectiveUserStake?.outcomeLabel || "Your Outcome"}
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-500 dark:text-gray-400">
                    Your Stake:
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatKP(effectiveUserStake?.amount || BigInt(0))} KP
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    You&apos;ve already placed your stake on this market
                  </p>
                </div>
              </div>
            </div>

            {/* Show all outcomes for reference */}
            {outcomes.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-white/70 mb-2">
                  All Outcomes
                </label>
                <div className="space-y-2">
                  {outcomes.map((outcome) => (
                    <div
                      key={outcome.index}
                      className={`p-3 rounded-lg border-2 ${
                        effectiveUserStake?.outcomeIndex === outcome.index
                          ? "border-primary bg-primary/5 dark:bg-primary/10"
                          : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {outcome.label}
                          {effectiveUserStake?.outcomeIndex ===
                            outcome.index && (
                            <span className="ml-2 text-xs text-primary">
                              (Your Choice)
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          {getOutcomePercentage(
                            outcome.poolAmount,
                            market.totalStaked || BigInt(1)
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{
                            width: `${getOutcomePercentage(
                              outcome.poolAmount,
                              market.totalStaked || BigInt(1)
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatKP(outcome.poolAmount)} KP staked
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Staking View - User hasn't staked yet */
          <>
            {/* Existing Outcomes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-white/70 mb-2">
                Existing Outcomes
              </label>
              {loadingOutcomes ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 py-2">
                  Loading outcomes...
                </div>
              ) : outcomes.length === 0 ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 py-2">
                  No outcomes yet. Be the first to create one!
                </div>
              ) : (
                <div className="space-y-2">
                  {outcomes.map((outcome) => (
                    <div
                      key={outcome.index}
                      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedOutcomeIndex === outcome.index
                          ? "border-primary bg-primary/5 dark:bg-primary/10"
                          : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedOutcomeIndex(outcome.index)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {outcome.label}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          {getOutcomePercentage(
                            outcome.poolAmount,
                            market.totalStaked || BigInt(1)
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{
                            width: `${getOutcomePercentage(
                              outcome.poolAmount,
                              market.totalStaked || BigInt(1)
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatKP(outcome.poolAmount)} KP staked
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stake Input */}
            <div>
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
            <div className="flex flex-col gap-2">
              {selectedOutcomeIndex !== null && (
                <button
                  onClick={() => handleStakeOnOutcome(selectedOutcomeIndex)}
                  disabled={loading !== null}
                  className="w-full h-10 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading === "stake" ? (
                    "Staking..."
                  ) : (
                    <>
                      <TrendingUp size={14} />
                      Stake on &quot;{outcomes[selectedOutcomeIndex]?.label}
                      &quot;
                    </>
                  )}
                </button>
              )}

              {/* Create New Outcome */}
              <div className="border-t border-slate-200 dark:border-white/10 pt-3">
                <label className="block text-xs font-semibold text-slate-600 dark:text-white/70 mb-2">
                  Create New Outcome
                </label>
                <input
                  type="text"
                  value={newOutcomeLabel}
                  onChange={(e) => setNewOutcomeLabel(e.target.value)}
                  placeholder="e.g., 'Option A', 'Team X', etc."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all mb-2"
                />
                <button
                  onClick={handleCreateOutcome}
                  disabled={loading !== null || !newOutcomeLabel.trim()}
                  className="w-full h-10 rounded-full bg-accent-teal/10 dark:bg-accent-teal/20 text-teal-700 dark:text-accent-teal font-bold text-sm hover:bg-accent-teal hover:text-slate-900 dark:hover:bg-accent-teal dark:hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading === "create" ? (
                    "Creating..."
                  ) : (
                    <>
                      <Plus size={14} />
                      Create & Stake
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
            {err && (
              <div className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/40 rounded-lg px-3 py-2">
                {err}
              </div>
            )}
            {tx && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/40 rounded-lg px-3 py-2 break-all">
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
        outcome={successOutcome || "Outcome"}
        marketId={market.id}
        question={market.question}
        txHash={tx || undefined}
      />
    </div>
  );
};
