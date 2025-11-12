"use client";

import React, { useMemo, useState } from "react";
import TopNav from "@/components/dashboard/TopNav";
import SidebarLeft from "@/components/dashboard/SidebarLeft";
import StatsOverview from "@/components/dashboard/StatsOverview";
import CategoryFilter from "@/components/dashboard/CategoryFilter";
import PredictionsFeed from "@/components/dashboard/PredictionsFeed";
import MixedFeed from "@/components/dashboard/MixedFeed";
import RightSidebar from "@/components/dashboard/RightSidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import CreatePredictionModal from "@/components/dashboard/CreatePredictionModal";
import { useUserPredictions } from "@/hooks/usePredictions";
import { useForeBalance } from "@/hooks/useForeBalance";

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

  const filteredPredictions = useMemo(() => {
    if (!userPredictions) return [];
    if (selectedCategory === "all") return userPredictions;
    return userPredictions.filter(
      (prediction) =>
        prediction.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }, [selectedCategory, userPredictions]);

  const userStats = {
    prophetScore: 847,
    accuracy: 78,
    totalPredictions: 42,
    correctPredictions: 33,
    earnings: "2,450",
    rank: 156,
  };


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
          ) : (
            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6">
              <StatsOverview userStats={userStats} />
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
              {isUserPredictionsLoading ? (
                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 text-center text-sm text-zinc-500">
                  Loading predictions…
                </div>
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
