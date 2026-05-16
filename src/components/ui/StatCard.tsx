import React from "react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  accent?: "cyan" | "green" | "purple" | "amber" | "blue" | "red";
  className?: string;
}

const accentMap = {
  cyan: {
    icon: "text-accent-cyan",
    border: "border-accent-cyan/20",
  },
  green: {
    icon: "text-accent-green",
    border: "border-accent-green/20",
  },
  purple: {
    icon: "text-accent-purple",
    border: "border-accent-purple/20",
  },
  amber: {
    icon: "text-accent-amber",
    border: "border-accent-amber/20",
  },
  blue: {
    icon: "text-accent-blue",
    border: "border-accent-blue/20",
  },
  red: {
    icon: "text-accent-red",
    border: "border-accent-red/20",
  },
};

export function StatCard({
  icon,
  label,
  value,
  description,
  accent = "cyan",
  className,
}: StatCardProps) {
  const { icon: iconColor, border } = accentMap[accent];

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-surface p-5 flex flex-col gap-4",
        "transition-all duration-300 cursor-default",
        border,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("mt-0.5", iconColor)} aria-hidden="true">
          {icon}
        </span>
        <span className="text-xs font-mono text-text-muted uppercase tracking-widest text-right leading-tight">
          {label}
        </span>
      </div>

      <div>
        <p className="text-2xl font-display font-bold text-text-primary leading-none tracking-tight">
          {value}
        </p>
        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
