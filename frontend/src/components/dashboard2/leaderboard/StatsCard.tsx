import React from "react";
import { ArrowRight } from "lucide-react";

export const StatsCard: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 rounded-2xl bg-white dark:bg-background-card p-4 shadow-sm border border-black/5 dark:border-white/5">
      <div className="flex flex-[2] flex-col justify-center gap-6 p-2">
        <div className="flex flex-col gap-2">
          <p className="text-gray-500 dark:text-muted text-sm font-medium">
            Your Stats
          </p>
          <h3 className="text-black dark:text-white text-3xl font-bold leading-tight">
            Your Global Rank: <span className="text-primary">#1,234</span>
          </h3>
          <p className="text-gray-500 dark:text-muted text-sm">
            You're in the top 15%! Keep predicting to climb higher.
          </p>
        </div>
        <button className="group flex h-10 w-fit items-center gap-2 rounded-full bg-black/5 dark:bg-background-input px-5 text-sm font-semibold text-black dark:text-white hover:bg-black/10 dark:hover:bg-[#4a4134] transition-all">
          View My Stats
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div
        className="relative w-full min-h-[160px] md:min-h-auto md:flex-1 rounded-xl overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBWRcoeIg7WK1wbETsT09Mrjt7Ixks9xUTy1Kq_Ezo67jx-dRX3dzSxjAG2komzpS68B_Dns7B-janVTtDvu_hBeahmTH6B8y1LaF1czrmqH-7fNCsgaJBMq5r966NctBAQLydUWLTp3gRMvn_Mrgq8QAVGMtTHGiwxSaT22sR3kQ5B0QfOAgVmWXkF5NOMxRE3t90RE8c90eOzx27I6nYPE_VF1l8dH5tqlt6J-RdDEebTgbSXKkUl41qtvFXaxeQjonK9WFjCoBaU")',
        }}
        role="img"
        aria-label="Trophy and stats chart"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden" />
      </div>
    </div>
  );
};

export default StatsCard;


