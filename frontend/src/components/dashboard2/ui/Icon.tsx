import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  BarChart2,
  History as HistoryIcon,
  Settings,
  Search,
  Bell,
  Edit2,
  Activity,
  Plus,
} from "lucide-react";

export const Icons = {
  Dashboard: LayoutDashboard,
  Events: Calendar,
  Leagues: Trophy,
  Leaderboard: BarChart2,
  History: HistoryIcon,
  Settings: Settings,
  Search: Search,
  Bell: Bell,
  Edit: Edit2,
  Logo: Activity,
  Plus: Plus,
};

export type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
