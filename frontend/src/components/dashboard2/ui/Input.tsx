import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-white text-base font-medium leading-normal">
          {label}
        </label>
      )}
      <input
        className={`flex w-full h-14 rounded-2xl bg-surface-dark border border-white/10 px-4 py-3 text-base text-white placeholder:text-[#baad9c] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;






