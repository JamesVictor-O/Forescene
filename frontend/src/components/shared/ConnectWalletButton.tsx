"use client";

import React from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Loader2, ChevronRight, LogOut } from "lucide-react";

type Variant = "primary" | "glass" | "subtle";

interface ConnectWalletButtonProps {
  variant?: Variant;
  className?: string;
  fullWidth?: boolean;
  showChevron?: boolean;
  showDisconnectIcon?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "group px-8 py-3.5 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 text-white text-sm font-medium hover:border-cyan-500/50 hover:bg-zinc-900 transition-all duration-300 rounded-sm",
  glass:
    "px-5 py-2 bg-zinc-900/80 border border-zinc-800/50 text-white text-sm font-medium hover:border-cyan-500/50 transition-all duration-300 rounded-sm",
  subtle:
    "px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all duration-300 rounded-sm",
};

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function ConnectWalletButton({
  variant = "glass",
  className,
  fullWidth,
  showChevron = false,
  showDisconnectIcon = true,
}: ConnectWalletButtonProps) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const primaryWalletAddress = wallets?.[0]?.address || "";
  const displayName = authenticated
    ? primaryWalletAddress
      ? shortenAddress(primaryWalletAddress)
      : "CONNECTED"
    : "CONNECT WALLET";

  const isDisabled = !ready;

  const handleClick = () => {
    if (!ready) return;
    if (authenticated) {
      logout();
    } else {
      login();
    }
  };

  const renderRightIcon = () => {
    if (!ready) {
      return <Loader2 className="ml-2 h-4 w-4 animate-spin" />;
    }
    if (authenticated && showDisconnectIcon) {
      return <LogOut className="ml-2 h-4 w-4" />;
    }
    if (!authenticated && showChevron) {
      return (
        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      );
    }
    return null;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center whitespace-nowrap transition-all duration-300",
        variantClasses[variant],
        fullWidth ? "w-full" : "",
        isDisabled ? "opacity-60 cursor-not-allowed" : "",
        className ?? "",
      ].join(" ")}
    >
      <span>{ready ? displayName : "CONNECTING"}</span>
      {renderRightIcon()}
    </button>
  );
}
