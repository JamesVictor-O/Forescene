import React from "react";

export type User = {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  kp: number;
  title?: string;
};

export type Prediction = {
  id: string;
  title: string;
  userPrediction: string;
  potentialWinnings: number;
  progress: number; // percentage 0-100
  closingIn: string;
  status: string;
};

export type Activity = {
  id: string;
  user: User;
  action: string;
  target?: string;
  highlight?: string;
  timestamp: string;
  type: string;
};

export type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  isActive?: boolean;
};

export type FeaturedItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
};

export type PredictionItem = {
  id: string;
  title: string;
  imageUrl: string;
  category:
    | "AfroBeats"
    | "Nollywood"
    | "Sports"
    | "Fashion"
    | "Culture"
    | string;
  endsIn: string;
  poolAmount: number;
};

export type Player = {
  rank: number;
  name: string;
  points: number;
  avatar: string;
  trend?: number;
  isCurrentUser?: boolean;
};

export type LeaderboardType = "Global Leaderboard" | "Friend Leagues";

export enum Category {
  MUSIC = "Music",
  FILM_TV = "Film & TV",
  EVENTS = "Events",
  POP_CULTURE = "Pop Culture",
  SPORTS = "Sports",
}

export interface PredictionFormState {
  title: string;
  category: string;
  description: string;
}
