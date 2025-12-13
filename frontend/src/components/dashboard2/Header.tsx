import React from "react";
import Image from "next/image";
import { Icons } from "./ui/Icon";
import { CURRENT_USER } from "./constants";

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-gray-200 dark:border-white/10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-3 sm:gap-8">
            <Image
              src={"/Logo2.png"}
              alt="Logo"
              width={100}
              height={50}
              className="w-8 sm:w-10"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Forescene
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <label className="hidden lg:flex flex-col min-w-40 h-10 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-full h-full group">
                <div className="text-gray-400 dark:text-gray-500 flex bg-surface-light dark:bg-surface-dark items-center justify-center pl-4 rounded-l-full border border-gray-200 dark:border-white/10 border-r-0 group-focus-within:border-primary group-focus-within:text-primary transition-colors">
                  <Icons.Search className="w-5 h-5" />
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-gray-800 dark:text-white focus:outline-0 focus:ring-0 border border-gray-200 dark:border-white/10 border-l-0 bg-surface-light dark:bg-surface-dark h-full placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 pl-2 text-sm group-focus-within:border-primary transition-colors"
                  placeholder="Search events..."
                />
              </div>
            </label>
            <button className="hidden sm:flex items-center justify-center rounded-full h-10 w-10 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-primary/20 hover:text-primary transition-colors relative">
              <Icons.Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 sm:size-12 border-2 border-primary cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundImage: `url("${CURRENT_USER.avatar}")` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
