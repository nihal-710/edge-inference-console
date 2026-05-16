import React from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
  iconColor?: "cyan" | "green" | "purple" | "amber";
}

const iconColors = {
  cyan:   "bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan",
  green:  "bg-accent-green/10 border-accent-green/20 text-accent-green",
  purple: "bg-accent-purple/10 border-accent-purple/20 text-accent-purple",
  amber:  "bg-accent-amber/10 border-accent-amber/20 text-accent-amber",
};

export function EmptyState({
  icon,
  title,
  description,
  actions,
  meta,
  className,
  iconColor = "cyan",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-20 px-8 gap-5",
        className
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "w-16 h-16 rounded-2xl border flex items-center justify-center",
          iconColors[iconColor]
        )}
      >
        {icon}
      </div>

      <div className="space-y-2 max-w-sm">
        <p className="text-base font-semibold font-mono text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          {actions}
        </div>
      )}

      {meta && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1 pt-4 border-t border-border w-full max-w-xs">
          {meta}
        </div>
      )}
    </div>
  );
}
