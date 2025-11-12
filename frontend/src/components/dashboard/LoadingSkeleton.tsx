"use client";

import { Loader2 } from "lucide-react";
import React from "react";

type LoadingSkeletonProps = {
  message?: string;
  variant?: "feed" | "list";
  rows?: number;
};

export default function LoadingSkeleton({
  message = "Syncing with BNB Smart Chain…",
  variant = "feed",
  rows = 3,
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: rows });

  return (
    <div className="w-full flex flex-col items-center gap-6 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          <Loader2 className="relative h-8 w-8 text-cyan-400 animate-spin" />
        </div>
        <p className="text-sm text-zinc-400">{message}</p>
      </div>

      <div className="w-full space-y-4">
        {skeletons.map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-zinc-900/70 bg-zinc-950/60 shadow-[0_18px_50px_rgba(7,12,24,0.35)] overflow-hidden"
          >
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-md bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-transparent animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded-full bg-zinc-800/70 w-1/3 animate-pulse" />
                  <div className="h-2.5 rounded-full bg-zinc-800/60 w-1/4 animate-pulse" />
                </div>
                <div className="hidden sm:block h-6 w-16 rounded-full bg-zinc-900 animate-pulse" />
              </div>

              <div className="space-y-3">
                <div className="h-3.5 rounded-full bg-zinc-800/70 w-3/4 animate-pulse" />
                <div className="h-3 rounded-full bg-zinc-800/60 w-2/3 animate-pulse" />
              </div>

              {variant === "feed" ? (
                <div className="h-48 sm:h-56 rounded-lg bg-gradient-to-r from-zinc-900 via-zinc-800/70 to-zinc-900 animate-[pulse_1.6s_cubic-bezier(0.4,_0,_0.2,_1)_infinite]" />
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((__, statIndex) => (
                    <div
                      key={statIndex}
                      className="rounded-lg bg-zinc-900/60 border border-zinc-800/70 p-3 space-y-2 animate-pulse"
                    >
                      <div className="h-2.5 w-1/2 rounded-full bg-zinc-800/70" />
                      <div className="h-4 w-3/4 rounded-md bg-zinc-800/50" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((__, actionIndex) => (
                  <div
                    key={actionIndex}
                    className="flex-1 h-9 rounded-md bg-zinc-900 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


