import React from "react";
import { Icons } from "./ui/Icon";

export const MobileBottomNav: React.FC<{
  active: string;
  onSelect: (id: string) => void;
  onOpenCreate: () => void;
}> = ({ active, onSelect, onOpenCreate }) => {
  const bottomNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
    { id: "feed", label: "Feed", icon: Icons.Events },
    { id: "leaderboard", label: "Leaderboard", icon: Icons.Leaderboard },
    { id: "history", label: "History", icon: Icons.History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm border-t border-gray-200 dark:border-white/10 lg:hidden z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {bottomNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 ${
              active === item.id
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onOpenCreate}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity -mt-6"
          aria-label="Create prediction"
        >
          <Icons.Plus className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};
