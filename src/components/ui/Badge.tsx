import React from "react";
import { cn } from "../../lib/utils";
import type { BadgeVariant } from "../../types";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-overlay text-text-secondary border-border",
  cyan:    "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
  green:   "bg-accent-green/10 text-accent-green border-accent-green/30",
  amber:   "bg-accent-amber/10 text-accent-amber border-accent-amber/30",
  red:     "bg-accent-red/10 text-accent-red border-accent-red/30",
  purple:  "bg-accent-purple/10 text-accent-purple border-accent-purple/30",
};

const dotClasses: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  cyan:    "bg-accent-cyan",
  green:   "bg-accent-green",
  amber:   "bg-accent-amber",
  red:     "bg-accent-red",
  purple:  "bg-accent-purple",
};

export function Badge({ variant = "default", children, dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2 py-0.5 rounded text-xs font-mono font-medium",
        "border",
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClasses[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}