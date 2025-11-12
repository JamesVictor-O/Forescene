import React from "react";
import { Home, Trophy, Target, Plus } from "lucide-react";

type MobileBottomNavProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreate: () => void;
};

const NAV_ITEMS: Array<{
  key: string;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "feed", label: "Feed", icon: <Home className="w-5 h-5" /> },
  {
    key: "predictions",
    label: "Predictions",
    icon: <Trophy className="w-5 h-5" />,
  },
  { key: "backed", label: "Backed", icon: <Target className="w-5 h-5" /> },
];

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenCreate,
}: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 w-full bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800/50 lg:hidden z-50 safe-area-bottom">
      <div className="flex items-center h-16 px-4">
        <div className="flex flex-1 items-center justify-evenly pr-4">
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <MobileNavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.key}
              onClick={() => setActiveTab(item.key)}
            />
          ))}
        </div>

        <button
          onClick={onOpenCreate}
          className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center -mt-5 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-lg"
          aria-label="Create prediction"
        >
          <Plus className="w-6 h-6" />
        </button>

        <div className="flex flex-1 items-center justify-evenly pl-4">
          {NAV_ITEMS.slice(2).map((item) => (
            <MobileNavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.key}
              onClick={() => setActiveTab(item.key)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

function MobileNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 px-2 py-2 text-[11px] font-medium transition-colors ${
        active ? "text-cyan-400" : "text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
