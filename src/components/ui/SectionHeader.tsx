import React from "react";
import { cn } from "../../lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-1">
        {eyebrow && (
          <p className="text-xs font-mono font-medium text-accent-cyan uppercase tracking-widest">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-semibold text-text-primary font-sans leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-text-secondary leading-relaxed max-w-prose">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}