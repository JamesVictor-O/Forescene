import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-white text-base font-medium leading-normal">
          {label}
        </label>
      )}
      <textarea
        className={`flex w-full min-h-[144px] rounded-2xl bg-surface-dark border border-white/10 px-4 py-3 text-base text-white placeholder:text-[#baad9c] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-y ${className}`}
        {...props}
      />
    </div>
  );
};

export default Textarea;




