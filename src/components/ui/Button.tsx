import React from "react";
import { cn } from "../../lib/utils";
import type { ButtonVariant, ButtonSize } from "../../types";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-accent-cyan text-canvas font-semibold",
    "hover:bg-accent-cyan-dim",
    "active:scale-[0.98]",
    "disabled:bg-border disabled:text-text-muted",
  ].join(" "),

  secondary: [
    "bg-surface-raised border border-border text-text-primary",
    "hover:border-border-strong hover:bg-surface-overlay",
    "active:scale-[0.98]",
    "disabled:opacity-40",
  ].join(" "),

  ghost: [
    "bg-transparent text-text-secondary",
    "hover:bg-surface-raised hover:text-text-primary",
    "active:scale-[0.98]",
    "disabled:opacity-40",
  ].join(" "),

  danger: [
    "bg-accent-red/10 border border-accent-red/40 text-accent-red",
    "hover:bg-accent-red/20 hover:border-accent-red",
    "active:scale-[0.98]",
    "disabled:opacity-40",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-xs gap-1.5 rounded",
  md: "h-9 px-4 text-sm gap-2 rounded-md",
  lg: "h-11 px-6 text-base gap-2.5 rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          // Base
          "inline-flex items-center justify-center font-mono transition-all duration-150",
          "cursor-pointer select-none whitespace-nowrap",
          "disabled:cursor-not-allowed",
          // Variant + Size
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size={size} />
            {children}
          </span>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// ─── Loading Spinner ───────────────────────────────────────────────────────────

function LoadingSpinner({ size }: { size: ButtonSize }) {
  const dim = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <svg
      className={cn(dim, "animate-spin")}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}