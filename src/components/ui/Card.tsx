import React from "react";
import { cn } from "../../lib/utils";
import type { CardVariant } from "../../types";

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface border border-border",
  raised:  "bg-surface-raised border border-border-subtle shadow-lg shadow-canvas/60",
  inset:   "bg-canvas border border-border-subtle",
};

export function Card({ variant = "default", className, children, as: Tag = "div" }: CardProps) {
  return (
    <Tag className={cn("rounded-lg", variantClasses[variant], className)}>
      {children}
    </Tag>
  );
}

// Sub-components for structured card content
export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("px-5 py-4 border-b border-border flex items-center gap-3", className)}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("px-5 py-3 border-t border-border flex items-center gap-3", className)}>
      {children}
    </div>
  );
}