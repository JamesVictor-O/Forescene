import React from "react";
import { Logo } from "../navigation/Logo";

const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-24 border-t border-white/10 py-10 px-6">
      <div className="max-w-[1080px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Brand */}
        <div className="flex items-center gap-3 text-white">
          <div className="text-primary h-6 w-6">
            <Logo />
          </div>
          <h2 className="text-white text-lg font-bold tracking-tight">
            Forescene
          </h2>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-medium">
          <a
            href="#"
            className="text-white/60 hover:text-primary transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-white/60 hover:text-primary transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-white/60 hover:text-primary transition-colors"
          >
            Contact Us
          </a>
        </nav>

        {/* Copyright */}
        <p className="text-sm text-white/40 text-center md:text-right">
          © 2024 Forescene. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
