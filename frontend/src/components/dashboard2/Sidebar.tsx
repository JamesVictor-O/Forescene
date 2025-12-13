import React from "react";
import { Icons } from "./ui/Icon";
import { NavItem } from "./types";

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Icons.Dashboard,
    href: "#",
    isActive: false,
  },
  {
    id: "feed",
    label: "Feed",
    icon: Icons.Events,
    href: "#",
    isActive: false,
  },
  {
    id: "leagues",
    label: "Leagues",
    icon: Icons.Leagues,
    href: "#",
    isActive: false,
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: Icons.Leaderboard,
    href: "#",
    isActive: false,
  },
  {
    id: "history",
    label: "History",
    icon: Icons.History,
    href: "#",
    isActive: false,
  },
];

export const Sidebar: React.FC<{
  active: string;
  onSelect: (id: string) => void;
  onOpenCreate: () => void;
}> = ({ active, onSelect, onOpenCreate }) => {
  return (
    <aside className="fixed top-16 sm:top-24 h-[calc(100vh-4rem)] sm:h-[calc(100vh-7rem)] w-64 flex-col gap-8 bg-surface-light dark:bg-surface-dark p-6 hidden lg:flex border-r border-gray-200 dark:border-white/10 z-20">
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`text-left flex items-center gap-4 px-4 py-3 rounded-lg transition-colors font-medium ${
              active === item.id
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

