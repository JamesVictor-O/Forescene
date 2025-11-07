"use client";

import React, { useState } from "react";
import TopNav from "@/components/dashboard/TopNav";
import SidebarLeft from "@/components/dashboard/SidebarLeft";
import StatsOverview from "@/components/dashboard/StatsOverview";
import CategoryFilter from "@/components/dashboard/CategoryFilter";
import PredictionsFeed from "@/components/dashboard/PredictionsFeed";
import MixedFeed from "@/components/dashboard/MixedFeed";
import RightSidebar from "@/components/dashboard/RightSidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "crypto",
    "sports",
    "entertainment",
    "politics",
    "tech",
  ];

  const predictions = [
    {
      id: 1,
      user: "CryptoSage",
      avatar: "CS",
      prediction: "BTC will hit $100K before Dec 31, 2025",
      category: "crypto",
      confidence: 85,
      backers: 234,
      stake: "500 FORE",
      deadline: "2025-12-31",
      status: "active",
      odds: "2.3x",
    },
    {
      id: 2,
      user: "SportsOracle",
      avatar: "SO",
      prediction: "Lakers will win NBA Championship 2025",
      category: "sports",
      confidence: 72,
      backers: 189,
      stake: "350 FORE",
      deadline: "2025-06-15",
      status: "active",
      odds: "3.1x",
    },
    {
      id: 3,
      user: "TechVision",
      avatar: "TV",
      prediction: "Apple will launch AR glasses in 2025",
      category: "tech",
      confidence: 65,
      backers: 156,
      stake: "280 FORE",
      deadline: "2025-12-31",
      status: "active",
      odds: "1.8x",
    },
  ];

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
      <TopNav />

      <div className="flex pt-14 sm:pt-16">
        {/* Sidebar - hidden on mobile */}
        <SidebarLeft
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userStats={userStats}
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
              <PredictionsFeed
                predictions={predictions.filter(
                  (p) =>
                    selectedCategory === "all" ||
                    p.category === selectedCategory
                )}
              />
            </div>
          )}
        </main>

        {/* Right sidebar - hidden on mobile/tablet */}
        <RightSidebar />
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
