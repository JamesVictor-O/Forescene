"use client";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import ConnectWalletButton from "@/components/shared/ConnectWalletButton";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full sticky top-5 z-50">
      <div className="flex items-center justify-between whitespace-nowrap bg-brand-dark/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-2xl">
        {/* Logo Section */}
        <div className="flex items-center gap-3 text-white">
          <div className="text-primary h-8 w-8">
            <Image width={100} height={100} alt="Logo" src={"/Logo2.png"} />
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight">
            Forescene
          </h2>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-8">
          <nav className="flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-white/80 hover:text-primary transition-colors text-sm font-medium"
            >
              How it Works
            </a>
            <a
              href="#leaderboard"
              className="text-white/80 hover:text-primary transition-colors text-sm font-medium"
            >
              Leaderboard
            </a>
          </nav>
          <ConnectWalletButton className="rounded-full h-10 px-5 bg-primary hover:bg-primary-light hover:shadow-glow-primary text-black text-sm font-bold tracking-wide" />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-1 hover:text-primary transition-colors"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 mx-4 p-4 rounded-2xl bg-[#1a1714] border border-white/10 shadow-2xl md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
          <a
            href="#how-it-works"
            className="text-white/90 hover:text-primary px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            How it Works
          </a>
          <a
            href="#leaderboard"
            className="text-white/90 hover:text-primary px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            Leaderboard
          </a>
          <hr className="border-white/10 my-1" />
          <div className="flex flex-col gap-3">
            <ConnectWalletButton
              fullWidth
              className="h-10 rounded-full bg-primary text-black font-bold text-sm hover:bg-primary-light shadow-button-glow"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
