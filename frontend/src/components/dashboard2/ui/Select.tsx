import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: string[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-white text-base font-medium leading-normal">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`appearance-none flex w-full h-14 rounded-2xl bg-surface-dark border border-white/10 px-4 py-3 text-base text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/60">
          ▾
        </div>
      </div>
    </div>
  );
};

export default Select;




