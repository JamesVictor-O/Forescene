import React, { useState } from "react";
import { Icons } from "./ui/Icon";
import {
  CURRENT_USER,
  PREDICTIONS,
  LEAGUE_MEMBERS,
  ACTIVITIES,
} from "./constants";
import { NavItem } from "./types";
import FeaturedSection from "./feed/FeaturedSection";
import FeedPredictionCard from "./feed/PredictionCard";
import {
  FEATURED_ITEMS,
  PREDICTION_FEED,
  LEADERBOARD_PLAYERS,
} from "./constants";
import Leaderboard from "./leaderboard/Leaderboard";
import StatsCard from "./leaderboard/StatsCard";
import CreatePredictionModal from "./create/CreatePredictionModal";

const KPStat: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col gap-1 rounded p-3 bg-background-light dark:bg-background-dark">
    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">
      {label}
    </p>
    <p className="text-gray-900 dark:text-white text-xl font-bold">{value}</p>
  </div>
);

const PredictionCard: React.FC<{
  data: (typeof PREDICTIONS)[number];
  className?: string;
}> = ({ data, className }) => (
  <div
    className={`flex flex-col gap-4 p-4 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 ${
      className || ""
    }`}
  >
    <p className="font-bold text-gray-900 dark:text-white text-lg">
      {data.title}
    </p>
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <p className="text-gray-500 dark:text-gray-400">Your Prediction:</p>
        <p className="font-bold text-gray-900 dark:text-white">
          {data.userPrediction}
        </p>
      </div>
      <div className="flex justify-between items-center text-sm">
        <p className="text-gray-500 dark:text-gray-400">Potential Winnings:</p>
        <p className="font-bold text-green-500">+{data.potentialWinnings} KP</p>
      </div>
    </div>

    <div className="w-full bg-gray-200 dark:bg-black/20 rounded-full h-1.5 mt-1">
      <div
        className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${data.progress}%` }}
      />
    </div>
    <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
      Closes in {data.closingIn}
    </p>
  </div>
);

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

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-gray-200 dark:border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <Icons.Logo className="w-8 h-8" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Forescene
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <label className="hidden lg:flex flex-col min-w-40 h-10 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-full h-full group">
                <div className="text-gray-400 dark:text-gray-500 flex bg-surface-light dark:bg-surface-dark items-center justify-center pl-4 rounded-l-full border border-gray-200 dark:border-white/10 border-r-0 group-focus-within:border-primary group-focus-within:text-primary transition-colors">
                  <Icons.Search className="w-5 h-5" />
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-gray-800 dark:text-white focus:outline-0 focus:ring-0 border border-gray-200 dark:border-white/10 border-l-0 bg-surface-light dark:bg-surface-dark h-full placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 pl-2 text-sm group-focus-within:border-primary transition-colors"
                  placeholder="Search events..."
                />
              </div>
            </label>
            <button className="flex items-center justify-center rounded-full h-10 w-10 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-primary/20 hover:text-primary transition-colors relative">
              <Icons.Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border-2 border-primary cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundImage: `url("${CURRENT_USER.avatar}")` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export const Sidebar: React.FC<{
  active: string;
  onSelect: (id: string) => void;
  onOpenCreate: () => void;
}> = ({ active, onSelect, onOpenCreate }) => {
  const NAV_ITEMS: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Icons.Dashboard,
      href: "#",
      isActive: active === "dashboard",
    },
    {
      id: "feed",
      label: "Feed",
      icon: Icons.Events,
      href: "#",
      isActive: active === "feed",
    },
    {
      id: "leagues",
      label: "Leagues",
      icon: Icons.Leagues,
      href: "#",
      isActive: active === "leagues",
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: Icons.Leaderboard,
      href: "#",
      isActive: active === "leaderboard",
    },
    {
      id: "history",
      label: "History",
      icon: Icons.History,
      href: "#",
      isActive: active === "history",
    },
  ];
  return (
    <aside className="sticky top-24 h-[calc(100vh-6rem)] w-64 flex-col gap-8 bg-surface-light dark:bg-surface-dark p-6 hidden lg:flex border-r border-gray-200 dark:border-white/10 z-20">
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`text-left flex items-center gap-4 px-4 py-3 rounded-lg transition-colors font-medium ${
              item.isActive
                ? "bg-primary/20 text-primary font-bold"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <item.icon className="w-6 h-6" />
            <p>{item.label}</p>
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-4">
        <button
          onClick={onOpenCreate}
          className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-6 bg-primary text-white text-base font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
        >
          <span>Create Prediction</span>
        </button>
        <a
          href="#"
          className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors font-medium"
        >
          <Icons.Settings className="w-6 h-6" />
          <p>Settings</p>
        </a>
      </div>
    </aside>
  );
};

export default function RevampedDashboard() {
  const [active, setActive] = useState<
    "dashboard" | "feed" | "leagues" | "leaderboard" | "history"
  >("dashboard");
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 min-h-screen">
      <Header />
      <main className="container mx-auto  py-8">
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
            } min-w-0 flex flex-col gap-8`}
          >
            {active === "dashboard" ? (
              <>
                {/* Welcome Card */}
                <div className="flex flex-col md:flex-row gap-6 p-6 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-20 shrink-0 border-4 border-background-light dark:border-background-dark"
                    style={{ backgroundImage: `url("${CURRENT_USER.avatar}")` }}
                  />
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-normal">
                          Welcome back, {CURRENT_USER.name}!
                        </h2>
                        <p className="text-primary text-base font-medium leading-normal">
                          {CURRENT_USER.title}
                        </p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors self-start sm:self-center">
                        <Icons.Edit className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    </div>
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <KPStat
                        label="Knowledge Points"
                        value={`${CURRENT_USER.kp.toLocaleString()} KP`}
                      />
                      <KPStat
                        label="Global Rank"
                        value={`#${CURRENT_USER.rank}`}
                      />
                      <KPStat label="Predictions" value="18" />
                      <KPStat label="Win Rate" value="67%" />
                    </div>
                  </div>
                </div>
                {/* Portfolio Section */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                    My Portfolio
                  </h2>
                  <div className="flex border-b border-gray-200 dark:border-white/10 mb-2">
                    <button className="px-4 py-2 border-b-2 border-primary text-primary font-bold transition-colors">
                      Active (3)
                    </button>
                    <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors">
                      Past (15)
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PredictionCard data={PREDICTIONS[0]} />
                    <PredictionCard data={PREDICTIONS[1]} />
                    <PredictionCard
                      data={PREDICTIONS[2]}
                      className="col-span-1 md:col-span-2"
                    />
                  </div>
                </div>
              </>
            ) : active === "feed" ? (
              <>
                {/* Featured horizontal scroller */}
                <FeaturedSection items={FEATURED_ITEMS} />
                {/* Live Prediction Feed */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                    Explore Predictions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {PREDICTION_FEED.map((item) => (
                      <FeedPredictionCard
                        key={item.id}
                        item={item}
                        onPredict={(id: string, choice: "Yes" | "No") => {
                          console.log("predict", id, choice);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : active === "leaderboard" ? (
              <>
                <StatsCard />
                <Leaderboard players={LEADERBOARD_PLAYERS} />
              </>
            ) : null}
          </div>

          {/* Right Column (dashboard only) */}
          {active === "dashboard" && (
            <aside className="col-span-12 lg:col-span-3">
              <div className="sticky top-28 flex flex-col gap-8">
                {/* League Standings */}
                <div className="flex flex-col gap-4 p-6 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10">
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
                <div className="flex flex-col gap-4 p-6 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10">
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
      />
    </div>
  );
}
