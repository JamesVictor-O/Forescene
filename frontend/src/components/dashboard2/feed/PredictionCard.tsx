import React from "react";
import { PredictionItem } from "../types";
import { CATEGORY_COLORS } from "../constants";
import { Clock } from "lucide-react";

interface PredictionCardProps {
  item: PredictionItem;
  onPredict: (id: string, choice: "Yes" | "No") => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  item,
  onPredict,
}) => {
  const colorClass = CATEGORY_COLORS[item.category] || "primary";

  const getBadgeColor = () => {
    switch (item.category) {
      case "AfroBeats":
        return "bg-accent-magenta/90 text-white";
      case "Nollywood":
        return "bg-primary/90 text-slate-900";
      case "Sports":
        return "bg-accent-teal/90 text-slate-900";
      case "Fashion":
        return "bg-accent-magenta/90 text-white";
      case "Culture":
        return "bg-primary/90 text-slate-900";
      default:
        return "bg-primary/90 text-slate-900";
    }
  };

  return (
    <div className="flex flex-col rounded-xl bg-white dark:bg-card-dark shadow-md border border-slate-200 dark:border-white/5 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-black/40 group">
      <div className="relative overflow-hidden">
        <div
          className="w-full bg-center bg-no-repeat aspect-video bg-cover transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url("${item.imageUrl}")` }}
        />
        <div
          className={`absolute top-3 left-3 backdrop-blur-md px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getBadgeColor()}`}
        >
          {item.category}
        </div>
      </div>

      <div className="flex flex-col p-4 flex-grow">
        <h3 className="font-bold text-lg mb-3 flex-grow text-slate-900 dark:text-white leading-snug">
          {item.title}
        </h3>

        <div className="flex justify-between items-center mb-5 text-sm">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-white/70 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
            <Clock size={14} />
            <span className="font-medium">Ends in {item.endsIn}</span>
          </div>
          <div className="font-bold text-primary text-base">
            ${item.poolAmount.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button
            onClick={() => onPredict(item.id, "Yes")}
            className="w-full h-10 rounded-full bg-accent-teal/10 dark:bg-accent-teal/20 text-teal-700 dark:text-accent-teal font-bold text-sm hover:bg-accent-teal hover:text-slate-900 dark:hover:bg-accent-teal dark:hover:text-slate-900 transition-all active:scale-95"
          >
            Yes
          </button>
          <button
            onClick={() => onPredict(item.id, "No")}
            className="w-full h-10 rounded-full bg-accent-magenta/10 dark:bg-accent-magenta/20 text-pink-700 dark:text-accent-magenta font-bold text-sm hover:bg-accent-magenta hover:text-white dark:hover:bg-accent-magenta dark:hover:text-white transition-all active:scale-95"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;


