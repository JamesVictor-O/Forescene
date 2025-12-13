import { Icons } from "./ui/Icon";
import {
  CURRENT_USER,
  LEAGUE_MEMBERS,
  ACTIVITIES,
  FEATURED_ITEMS,
  LEADERBOARD_PLAYERS,
} from "./constants";
import FeaturedSection from "./feed/FeaturedSection";
import Leaderboard from "./leaderboard/Leaderboard";
import StatsCard from "./leaderboard/StatsCard";
import CreatePredictionModal from "./create/CreatePredictionModal";
import { useOnchainMarkets } from "@/hooks/useOnchainMarkets";
import { getContract, getNetworkConfig } from "@/config/contracts";
import { createPublicClient, http } from "viem";
import { knowledgePointTokenAbi } from "@/abis/knowledgePointToken";

const BLOCKDAG_RPC = "https://rpc.awakening.bdagscan.com";
import { useMemo, useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { OnchainMarket } from "@/hooks/useOnchainMarkets";
import { useMyMarketPositions } from "@/hooks/useMyMarketPositions";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MarketCard } from "./MarketCard";
import { CrowdWisdomMarketCard } from "./CrowdWisdomMarketCard";
import { OnchainPredictionCard } from "./OnchainPredictionCard";
import { CongratulationsModal } from "./create/CongratulationsModal";
import { ComingSoon } from "./ComingSoon";

const LeagueItem: React.FC<{
  user: (typeof LEAGUE_MEMBERS)[number];
  isCurrentUser?: boolean;
}> = ({ user, isCurrentUser }) => (
  <div
    className={`flex items-center justify-between p-2 rounded-lg ${
      isCurrentUser
        ? "bg-primary/10 ring-1 ring-primary/50"
        : "hover:bg-gray-100 dark:hover:bg-white/5"
    }`}
  >
    <div className="flex items-center gap-3">
      <span
        className={`font-bold w-6 text-center ${
          isCurrentUser ? "text-primary" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {user.rank}
      </span>
      <div
        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
        style={{ backgroundImage: `url("${user.avatar}")` }}
      />
      <span
        className={`text-sm font-bold ${
          isCurrentUser ? "text-primary" : "text-gray-600 dark:text-gray-300"
        }`}
      >
        {user.name}
      </span>
    </div>
    <span
      className={`text-sm font-bold ${
        isCurrentUser ? "text-primary" : "text-gray-600 dark:text-gray-300"
      }`}
    >
      {user.kp.toLocaleString()} KP
    </span>
  </div>
);

export default function RevampedDashboard() {
  const [active, setActive] = useState<
    "dashboard" | "feed" | "leagues" | "leaderboard" | "history"
  >("dashboard");
  const [createOpen, setCreateOpen] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);
  const [newMarketId, setNewMarketId] = useState<number | undefined>();
  const [newMarketQuestion, setNewMarketQuestion] = useState<string>("");
  const {
    markets,
    loading: marketsLoading,
    error: marketsError,
    refetch: refetchMarkets,
  } = useOnchainMarkets();

  const { authenticated, ready } = usePrivy();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [kpBalance, setKpBalance] = useState<string>("0");
  const [kpLoading, setKpLoading] = useState(false);

  // fetch connected privy wallet

  console.log("markets", markets);
  useMemo(() => {
    if (typeof window === "undefined") return;
    const eth = (window as any).ethereum;
    if (!eth) return;
    eth
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => setWalletAddress(accounts?.[0] || null))
      .catch(() => {});
  }, [authenticated, ready]);

  const {
    positions,
    loading: positionsLoading,
    error: positionsError,
    refetch: refetchPositions,
  } = useMyMarketPositions(markets, walletAddress || undefined);

  const marketMap = useMemo(() => {
    const map = new Map<number, OnchainMarket>();
    markets.forEach((m) => map.set(m.id, m));
    return map;
  }, [markets]);

  const myActivePositions = useMemo(
    () =>
      positions.filter(
        (p) => p.yesAmountRaw > BigInt(0) || p.noAmountRaw > BigInt(0)
      ),
    [positions]
  );

  // Create a map of marketId -> user position for quick lookup
  const positionMap = useMemo(() => {
    const map = new Map<number, (typeof positions)[0]>();
    positions.forEach((p) => {
      if (p.yesAmountRaw > BigInt(0) || p.noAmountRaw > BigInt(0)) {
        map.set(p.marketId, p);
      }
    });
    return map;
  }, [positions]);

  const totalStakedKP = useMemo(() => {
    return myActivePositions.reduce(
      (acc, p) => acc + p.yesAmountRaw + p.noAmountRaw,
      BigInt(0)
    );
  }, [myActivePositions]);

  const formatKP = (wei: bigint) => {
    const num = Number(wei) / 1e18;
    if (!Number.isFinite(num)) return "0";
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  // fetch KP balance for connected wallet
  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress) {
        setKpBalance("0");
        return;
      }
      try {
        setKpLoading(true);
        const kpToken = getContract("kpToken");
        const client = createPublicClient({
          chain: {
            id: getNetworkConfig().chainId,
            name: getNetworkConfig().name,
            nativeCurrency: { name: "BDAG", symbol: "BDAG", decimals: 18 },
            rpcUrls: { default: { http: [BLOCKDAG_RPC] } },
          },
          transport: http(BLOCKDAG_RPC),
        });
        const bal = (await client.readContract({
          address: kpToken.address,
          abi: knowledgePointTokenAbi,
          functionName: "balanceOf",
          args: [walletAddress as `0x${string}`],
        })) as bigint;
        setKpBalance(formatKP(bal));
      } catch {
        setKpBalance("0");
      } finally {
        setKpLoading(false);
      }
    };
    fetchBalance();
  }, [walletAddress]);
  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 pb-20 sm:pb-10 pt-20 sm:pt-24">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <Sidebar
              active={active}
              onSelect={(id) => setActive(id as typeof active)}
              onOpenCreate={() => setCreateOpen(true)}
            />
          </div>

          {/*Center Column */}
          <div
            className={`col-span-12 ${
              active === "feed" || active === "leaderboard"
                ? "lg:col-span-9"
                : "lg:col-span-6"
            } min-w-0 flex flex-col gap-6 sm:gap-8`}
          >
            {active === "dashboard" ? (
              <>
                {/* Welcome Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-light via-surface-light to-primary/5 dark:from-surface-dark dark:via-surface-dark dark:to-primary/10 border border-gray-200 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent dark:from-primary/10 pointer-events-none" />

                  <div className="relative flex flex-col lg:flex-row gap-6 p-6 sm:p-8">
                    {/* Avatar Section */}
                    <div className="flex-shrink-0 flex justify-center lg:justify-start">
                      <div className="relative">
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-2xl size-20 sm:size-24 lg:size-28 shadow-lg ring-4 ring-white/50 dark:ring-white/10"
                          style={{
                            backgroundImage: `url("${CURRENT_USER.avatar}")`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col gap-6">
                      {/* Header with Name and Edit Button */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="text-center lg:text-left">
                          <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Welcome Back
                          </p>
                          {/* <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                            {CURRENT_USER.name}
                          </h2> */}
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20">
                            <span className="text-xs sm:text-sm font-bold text-primary">
                              {CURRENT_USER.title}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="group relative overflow-hidden rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 p-4 hover:bg-white/80 dark:hover:bg-white/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                            KP Balance
                          </p>
                          <p className="text-sm  pr-3  font-black text-gray-900 dark:text-white">
                            {kpLoading ? (
                              <span className="inline-block  w-16 h-6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                            ) : (
                              `${kpBalance} KP`
                            )}
                          </p>
                        </div>
                        <div className="group relative overflow-hidden rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 p-4 hover:bg-white/80 dark:hover:bg-white/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                            Global Rank
                          </p>
                          <p className="text-xl sm:text-2xl font-black text-primary">
                            #{CURRENT_USER.rank}
                          </p>
                        </div>
                        <div className="group relative overflow-hidden rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 p-4 hover:bg-white/80 dark:hover:bg-white/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                            Total Bets
                          </p>
                          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                            {positionsLoading ? (
                              <span className="inline-block w-12 h-6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                            ) : (
                              myActivePositions.length
                            )}
                          </p>
                        </div>
                        <div className="group relative overflow-hidden rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 p-4 hover:bg-white/80 dark:hover:bg-white/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                            Win Rate
                          </p>
                          <p className="text-xl sm:text-2xl font-black text-green-500">
                            67%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Portfolio Section */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold">
                    My Portfolio
                  </h2>
                  <div className="flex border-b border-gray-200 dark:border-white/10 mb-2 overflow-x-auto">
                    <button className="px-4 py-2 border-b-2 border-primary text-primary font-bold transition-colors whitespace-nowrap">
                      Active ({myActivePositions.length})
                    </button>
                    <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors whitespace-nowrap">
                      Past (0)
                    </button>
                  </div>
                  {positionsLoading && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 py-4">
                      Loading your predictions...
                    </div>
                  )}
                  {positionsError && (
                    <div className="text-sm text-red-400 py-4">
                      {positionsError}
                    </div>
                  )}
                  {!positionsLoading &&
                    !positionsError &&
                    myActivePositions.length === 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
                        No active predictions yet. Create one to get started!
                      </div>
                    )}
                  {!positionsLoading &&
                    !positionsError &&
                    myActivePositions.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {myActivePositions.map((p) => {
                          const m = marketMap.get(p.marketId);
                          if (!m) return null;
                          // Use appropriate card based on market type
                          if (m.marketType === 0) {
                            // CrowdWisdom market - use CrowdWisdomMarketCard
                            return (
                              <CrowdWisdomMarketCard
                                key={p.marketId}
                                market={m}
                                onPlaced={() => {
                                  refetchPositions();
                                  refetchMarkets();
                                }}
                              />
                            );
                          } else {
                            // Binary market - use OnchainPredictionCard
                            return (
                              <OnchainPredictionCard
                                key={p.marketId}
                                market={m}
                                userStake={{
                                  yesAmountRaw: p.yesAmountRaw,
                                  noAmountRaw: p.noAmountRaw,
                                }}
                              />
                            );
                          }
                        })}
                      </div>
                    )}
                </div>
              </>
            ) : active === "feed" ? (
              <>
                {/* Featured horizontal scroller */}
                <FeaturedSection items={FEATURED_ITEMS} />
                {/* Live Prediction Feed */}
                <div className="flex flex-col gap-6 sm:gap-8">
                  <h2 className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold">
                    Explore Predictions
                  </h2>

                  {/* Binary Markets Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        Binary Markets
                      </h3>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {markets.filter((m) => m.marketType === 1).length}{" "}
                        active
                      </span>
                    </div>
                    {marketsLoading && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 py-4">
                        Loading binary markets...
                      </div>
                    )}
                    {marketsError && (
                      <div className="text-sm text-red-400 py-4">
                        {marketsError}
                      </div>
                    )}
                    {!marketsLoading &&
                      !marketsError &&
                      (() => {
                        const binaryMarkets = markets.filter(
                          (m) => m.marketType === 1
                        );
                        if (binaryMarkets.length === 0) {
                          return (
                            <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
                              No binary markets yet.
                            </div>
                          );
                        }
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                            {binaryMarkets.map((m) => {
                              const userPosition = positionMap.get(m.id);
                              return (
                                <MarketCard
                                  key={m.id}
                                  market={m}
                                  userStake={
                                    userPosition
                                      ? {
                                          yesAmountRaw:
                                            userPosition.yesAmountRaw,
                                          noAmountRaw: userPosition.noAmountRaw,
                                        }
                                      : undefined
                                  }
                                  onPlaced={() => {
                                    refetchMarkets();
                                    refetchPositions();
                                  }}
                                />
                              );
                            })}
                          </div>
                        );
                      })()}
                  </div>

                  {/* CrowdWisdom Markets Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        CrowdWisdom Markets
                      </h3>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {markets.filter((m) => m.marketType === 0).length}{" "}
                        active
                      </span>
                    </div>
                    {marketsLoading && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 py-4">
                        Loading CrowdWisdom markets...
                      </div>
                    )}
                    {marketsError && (
                      <div className="text-sm text-red-400 py-4">
                        {marketsError}
                      </div>
                    )}
                    {!marketsLoading &&
                      !marketsError &&
                      (() => {
                        const crowdWisdomMarkets = markets.filter(
                          (m) => m.marketType === 0
                        );
                        if (crowdWisdomMarkets.length === 0) {
                          return (
                            <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
                              No CrowdWisdom markets yet. Create one to get
                              started!
                            </div>
                          );
                        }
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                            {crowdWisdomMarkets.map((m) => {
                              // For CrowdWisdom, we'll check if user has any stake
                              // The component will fetch the actual outcome stake internally
                              // For now, we pass undefined and let the component handle it
                              return (
                                <CrowdWisdomMarketCard
                                  key={m.id}
                                  market={m}
                                  onPlaced={() => {
                                    refetchMarkets();
                                    refetchPositions();
                                  }}
                                />
                              );
                            })}
                          </div>
                        );
                      })()}
                  </div>
                </div>
              </>
            ) : active === "leaderboard" ? (
              <>
                <StatsCard />
                <Leaderboard players={LEADERBOARD_PLAYERS} />
              </>
            ) : active === "leagues" ? (
              <ComingSoon
                title="Leagues"
                description="Compete with friends and climb the leaderboards. Create or join leagues to see who's the best predictor!"
              />
            ) : active === "history" ? (
              <ComingSoon
                title="History"
                description="View your complete prediction history, track your wins and losses, and analyze your performance over time."
              />
            ) : null}
          </div>

          {/* Right Column (dashboard only) */}
          {active === "dashboard" && (
            <aside className="col-span-12 lg:col-span-3">
              <div className="sticky top-20 sm:top-28 flex flex-col gap-6 sm:gap-8">
                {/* League Standings */}
                <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      League Standings
                    </h3>
                    <a
                      className="text-sm font-medium text-primary hover:underline"
                      href="#"
                    >
                      View All
                    </a>
                  </div>

                  <div className="flex items-center gap-2 relative">
                    <select className="form-select w-full bg-background-light dark:bg-background-dark border-gray-200 dark:border-white/10 rounded-lg text-sm focus:ring-primary focus:border-primary py-2.5 px-3 font-medium cursor-pointer">
                      <option>Afro-Futurist League</option>
                      <option>Lagos Tech Scene</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    {LEAGUE_MEMBERS.map((member) => (
                      <LeagueItem
                        key={member.id}
                        user={member}
                        isCurrentUser={member.id === CURRENT_USER.id}
                      />
                    ))}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Activity Feed
                  </h3>
                  <div className="flex flex-col gap-4">
                    {ACTIVITIES.map((activity, idx) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 relative group"
                      >
                        {idx !== ACTIVITIES.length - 1 && (
                          <div className="absolute left-5 top-10 bottom-[-16px] w-0.5 bg-gray-200 dark:bg-white/10 group-last:hidden"></div>
                        )}

                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 mt-1 z-10 border-2 border-surface-light dark:border-surface-dark"
                          style={{
                            backgroundImage: `url("${activity.user.avatar}")`,
                          }}
                        />

                        <div className="flex-1 py-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            <strong className="font-bold text-gray-900 dark:text-white">
                              {activity.user.name}
                            </strong>{" "}
                            {activity.action}{" "}
                            {activity.highlight && (
                              <strong className="text-green-500 font-bold">
                                {activity.highlight}{" "}
                              </strong>
                            )}
                            {activity.target && (
                              <strong className="font-bold text-gray-800 dark:text-gray-200">
                                {activity.target}
                              </strong>
                            )}
                            {activity.type === "join" ? "." : "."}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
      {/* Create Prediction Modal */}
      <CreatePredictionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={(marketId, question) => {
          setNewMarketId(marketId);
          setNewMarketQuestion(question);
          setCreateOpen(false);
          setCongratsOpen(true);
          // Refresh markets and positions after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }}
      />
      {/* Congratulations Modal */}
      <CongratulationsModal
        isOpen={congratsOpen}
        onClose={() => {
          setCongratsOpen(false);
          setActive("dashboard");
        }}
        marketId={newMarketId}
        question={newMarketQuestion}
      />
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        active={active}
        onSelect={(id) => setActive(id as typeof active)}
        onOpenCreate={() => setCreateOpen(true)}
      />
    </div>
  );
}
