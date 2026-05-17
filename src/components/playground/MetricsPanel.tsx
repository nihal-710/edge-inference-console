/**
 * MetricsPanel.tsx — Phase 3 update
 *
 * Live metrics with improved visual hierarchy.
 * aria-live="polite" on the metrics grid for screen reader updates.
 */

import { Hash, Zap, Clock, Activity } from "lucide-react";
import { cn } from "../../lib/utils";
import { formatDuration } from "../../lib/utils";
import type { InferenceStatus } from "../../types/inference";

interface MetricsPanelProps {
  status: InferenceStatus;
  tokenCount: number;
  tokensPerSecond: number;
  elapsedMs: number;
  className?: string;
}

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  active: boolean;
  ariaLabel: string;
}

function MetricItem({ icon, label, value, active, ariaLabel }: MetricItemProps) {
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "flex flex-col gap-1.5 px-3 py-2.5 rounded-lg border transition-all duration-200",
        active ? "border-accent-cyan/30 bg-accent-cyan/5" : "border-border bg-surface"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn("transition-colors", active ? "text-accent-cyan" : "text-text-muted")}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className={cn(
        "text-lg font-display font-bold leading-none tracking-tight transition-colors",
        active ? "text-accent-cyan" : "text-text-primary"
      )}>
        {value}
      </p>
    </div>
  );
}

const STATUS_LABELS: Record<InferenceStatus, string> = {
  idle:       "Idle — awaiting input",
  connecting: "Connecting to engine…",
  streaming:  "Streaming tokens",
  completed:  "Run completed",
  error:      "Error — partial output preserved",
  aborted:    "Stopped by user",
};

const STATUS_COLORS: Record<InferenceStatus, string> = {
  idle:       "text-status-idle",
  connecting: "text-status-connecting",
  streaming:  "text-status-streaming",
  completed:  "text-status-completed",
  error:      "text-status-error",
  aborted:    "text-status-aborted",
};

export function MetricsPanel({
  status, tokenCount, tokensPerSecond, elapsedMs, className,
}: MetricsPanelProps) {
  const isActive = status === "streaming";

  return (
    <div className={cn("space-y-2.5", className)} aria-label="Live inference metrics">

      <div className="flex items-center gap-2 px-1">
        <Activity size={12} className={STATUS_COLORS[status]} aria-hidden="true" />
        <span className={cn("text-xs font-mono", STATUS_COLORS[status])}>
          {STATUS_LABELS[status]}
        </span>
        {isActive && (
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse-dot ml-auto"
          />
        )}
      </div>

      <div
        aria-live="polite"
        aria-atomic="false"
        className="grid grid-cols-3 gap-2"
      >
        <MetricItem
          icon={<Hash size={12} />}
          label="Tokens"
          value={tokenCount > 0 ? String(tokenCount) : "—"}
          active={isActive}
          ariaLabel={`Token count: ${tokenCount}`}
        />
        <MetricItem
          icon={<Zap size={12} />}
          label="Tok/s"
          value={tokensPerSecond > 0 ? String(tokensPerSecond) : "—"}
          active={isActive}
          ariaLabel={`Tokens per second: ${tokensPerSecond}`}
        />
        <MetricItem
          icon={<Clock size={12} />}
          label="Time"
          value={elapsedMs > 0 ? formatDuration(elapsedMs) : "—"}
          active={isActive}
          ariaLabel={`Elapsed time: ${formatDuration(elapsedMs)}`}
        />
      </div>
    </div>
  );
}
