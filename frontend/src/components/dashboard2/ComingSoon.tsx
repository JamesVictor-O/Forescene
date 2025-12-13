import React from "react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 sm:py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
            {title}
          </h2>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20">
            <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
        </div>
        {description && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
        <div className="flex justify-center gap-2 pt-4">
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-75"></div>
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};
