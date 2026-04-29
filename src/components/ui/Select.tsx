import React from "react";
import { cn } from "../../utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-dim uppercase tracking-wider font-mono">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text font-mono",
          "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
          "transition-colors duration-150 cursor-pointer appearance-none",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
