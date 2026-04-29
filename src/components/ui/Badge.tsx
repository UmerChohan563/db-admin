import React from "react";
import { cn } from "../../utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "danger" | "warning" | "info";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className }) => {
  const variants = {
    default: "bg-white/5 text-text-dim border-border",
    accent: "bg-accent/10 text-accent border-accent/30",
    danger: "bg-danger/10 text-danger border-danger/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    info: "bg-info/10 text-info border-info/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
