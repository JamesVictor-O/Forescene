import React from "react";
import { FeaturedItem } from "../types";

interface FeaturedSectionProps {
  items: FeaturedItem[];
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ items }) => {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-slate-900 dark:text-white text-2xl lg:text-3xl font-bold leading-tight tracking-[-0.015em] px-4 pt-4">
        Featured Predictions
      </h2>
      <div className="flex overflow-x-auto no-scrollbar pb-4 px-4 gap-4 snap-x">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex h-full flex-col gap-4 rounded-xl bg-white dark:bg-card-dark shadow-md dark:shadow-none min-w-[300px] md:min-w-[360px] snap-center border border-slate-200 dark:border-white/5 overflow-hidden group hover:border-primary/30 transition-all"
          >
            <div
              className="w-full bg-center bg-no-repeat aspect-video bg-cover flex flex-col group-hover:scale-105 transition-transform duration-500"
              style={{ backgroundImage: `url("${item.imageUrl}")` }}
            />
            <div className="flex flex-col flex-1 justify-between p-4 pt-2 gap-4">
              <div>
                <p className="text-slate-900 dark:text-white text-base font-bold leading-normal mb-1">
                  {item.title}
                </p>
                <p className="text-slate-500 dark:text-white/60 text-sm font-normal leading-normal">
                  {item.subtitle}
                </p>
              </div>
              <button className="flex w-full items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary text-slate-900 dark:text-slate-900 text-sm font-bold leading-normal tracking-[0.015em] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
                <span className="truncate">Predict Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;
