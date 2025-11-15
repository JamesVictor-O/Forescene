"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

type CopyAddressProps = {
  address: string;
  shorten?: boolean;
  className?: string;
  showIcon?: boolean;
  iconSize?: "sm" | "md" | "lg";
};

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function CopyAddress({
  address,
  shorten = true,
  className = "",
  showIcon = true,
  iconSize = "sm",
}: CopyAddressProps) {
  const [copied, setCopied] = useState(false);

  const displayAddress = shorten ? shortenAddress(address) : address;

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
      } else {
        // Fallback to execCommand for environments where Clipboard API is blocked
        const textArea = document.createElement("textarea");
        textArea.value = address;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error("execCommand copy failed");
        }
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
      // Show user-friendly error or fallback message
      alert(`Address: ${address}\n\n(Please copy manually)`);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity ${className}`}
      title={`Click to copy: ${address}`}
      aria-label={`Copy address ${address}`}
    >
      <span>{displayAddress}</span>
      {showIcon && (
        <span className="text-zinc-400 hover:text-cyan-400 transition-colors">
          {copied ? (
            <Check className={`${iconSizes[iconSize]} text-green-400`} />
          ) : (
            <Copy className={iconSizes[iconSize]} />
          )}
        </span>
      )}
    </button>
  );
}
