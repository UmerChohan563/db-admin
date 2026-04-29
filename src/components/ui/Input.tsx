import React from "react";
import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-dim uppercase tracking-wider font-mono">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">{icon}</span>
        )}
        <input
          className={cn(
            "w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text font-mono",
            "placeholder:text-muted",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
            "transition-colors duration-150",
            icon && "pl-9",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger font-mono">{error}</p>}
    </div>
  );
};
