"use client";

import React, { useMemo, useState } from "react";
import TopNav from "@/components/dashboard/TopNav";
import SidebarLeft from "@/components/dashboard/SidebarLeft";
import StatsOverview from "@/components/dashboard/StatsOverview";
import CategoryFilter from "@/components/dashboard/CategoryFilter";
import PredictionsFeed from "@/components/dashboard/PredictionsFeed";
import BackedPredictionsFeed from "@/components/dashboard/BackedPredictionsFeed";
import Leaderboard from "@/components/dashboard/Leaderboard";
import MixedFeed from "@/components/dashboard/MixedFeed";
import RightSidebar from "@/components/dashboard/RightSidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import CreatePredictionModal from "@/components/dashboard/CreatePredictionModal";
import { useUserPredictions } from "@/hooks/usePredictions";
import { useBackedPredictions } from "@/hooks/useBackedPredictions";
import { useForeBalance } from "@/hooks/useForeBalance";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const { balance } = useForeBalance();

  const categories = [
    "all",
    "crypto",
    "sports",
    "entertainment",
    "politics",
    "tech",
  ];

  const { data: userPredictions, isLoading: isUserPredictionsLoading } =
    useUserPredictions();
  const { data: backedPredictions, isLoading: isBackedPredictionsLoading } =
    useBackedPredictions();

  const filteredPredictions = useMemo(() => {
    if (!userPredictions) return [];
    if (selectedCategory === "all") return userPredictions;
    return userPredictions.filter(
      (prediction) =>
        prediction.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory, userPredictions]);

  const filteredBackedPredictions = useMemo(() => {
    if (!backedPredictions) return [];
    if (selectedCategory === "all") return backedPredictions;
    return backedPredictions.filter(
      (prediction) =>
        prediction.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory, backedPredictions]);

  // Calculate stats from actual user predictions
  const userStats = useMemo(() => {
    if (!userPredictions || userPredictions.length === 0) {
      return {
        prophetScore: 0,
        accuracy: 0,
        totalPredictions: 0,
        correctPredictions: 0,
        earnings: "0",
        rank: 0,
      };
    }

    const totalPredictions = userPredictions.length;
    // Count resolved predictions (for now, we'll count all resolved as "correct")
    // In the future, we'd need to check the actual outcome to determine if they won
    const resolvedPredictions = userPredictions.filter(
      (p) => p.status === "RESOLVED"
    );
    const correctPredictions = resolvedPredictions.length;

    // Calculate accuracy (win rate)
    const accuracy =
      totalPredictions > 0
        ? Math.round((correctPredictions / totalPredictions) * 100)
        : 0;

    // For earnings, we'd need to query actual staking rewards from the contract
    // For now, we'll show 0 as earnings calculation requires contract interaction
    const earnings = 0;

    // Format earnings with commas for display (as string)
    const formattedEarnings = earnings.toLocaleString();

    // Prophet score calculation would also require contract data
    // For now, we'll use a simple calculation based on predictions
    const prophetScore = totalPredictions * 10 + correctPredictions * 50;

    return {
      prophetScore,
      accuracy,
      totalPredictions,
      correctPredictions,
      earnings: formattedEarnings,
      rank: 0, // Rank would require leaderboard data
    };
  }, [userPredictions]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-pop">
      <TopNav onOpenCreate={() => setCreateOpen(true)} balance={balance!} />

      <div className="flex pt-14 sm:pt-16">
        {/* Sidebar - hidden on mobile */}
        <SidebarLeft
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userStats={userStats}
          balance={balance!}
        />

        {/* Main content - mobile first */}
        <main className="flex-1 lg:ml-64 xl:mr-80 pb-20 sm:pb-6">
          {activeTab === "feed" ? (
            <div className="px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 flex justify-center">
              <MixedFeed />
            </div>
          ) : activeTab === "backed" ? (
            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6">
              <StatsOverview userStats={userStats} />
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
              {isBackedPredictionsLoading ? (
                <LoadingSkeleton
                  message="Loading your backed predictions…"
                  variant="list"
                  rows={2}
                />
              ) : (
                <BackedPredictionsFeed
                  predictions={filteredBackedPredictions}
                />
              )}
            </div>
          ) : activeTab === "leaderboard" ? (
            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6">
              <Leaderboard />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6">
              <StatsOverview userStats={userStats} />
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
              {isUserPredictionsLoading ? (
                <LoadingSkeleton
                  message="Loading your on-chain predictions…"
                  variant="list"
                  rows={2}
                />
              ) : (
                <PredictionsFeed predictions={filteredPredictions} />
              )}
            </div>
          )}
        </main>

        {/* Right sidebar - hidden on mobile/tablet */}
        <RightSidebar />
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreate={() => setCreateOpen(true)}
      />
      <CreatePredictionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
