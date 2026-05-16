import { cn } from "../../lib/utils";

interface StatusDotProps {
  active?: boolean;
  className?: string;
  label?: string;
}

export function StatusDot({ active = true, className, label }: StatusDotProps) {
  return (
    <span
      role="status"
      aria-label={label ?? (active ? "Active" : "Inactive")}
      className={cn("relative inline-flex w-2 h-2", className)}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-accent-green animate-ping opacity-60"
        />
      )}
      <span
        className={cn(
          "relative rounded-full w-2 h-2",
          active ? "bg-accent-green" : "bg-text-muted"
        )}
      />
    </span>
  );
}
