/**
 * MetricsPanel.tsx — Phase 6 hardened
 *
 * Accessibility fix:
 * - aria-busy="true" during streaming so screen readers batch metric
 *   announcements instead of reading every 100ms update aloud.
 * - aria-live="polite" kept — will only announce when aria-busy clears.
 */

import { Hash, Zap, Clock, Activity, FileText, Mic } from "lucide-react";
import { cn } from "../../lib/utils";
import { formatDuration } from "../../lib/utils";
import type { InferenceStatus, InputMode } from "../../types/inference";

interface MetricsPanelProps {
  status: InferenceStatus;
  tokenCount: number;
  tokensPerSecond: number;
  elapsedMs: number;
  inputMode: InputMode;
  className?: string;
}

const STATUS_COLORS: Record<InferenceStatus, string> = {
  idle:       "text-status-idle",
  connecting: "text-status-connecting",
  streaming:  "text-status-streaming",
  completed:  "text-status-completed",
  error:      "text-status-error",
  aborted:    "text-status-aborted",
};

const STATUS_LABELS: Record<InferenceStatus, string> = {
  idle:       "Idle",
  connecting: "Connecting",
  streaming:  "Streaming",
  completed:  "Completed",
  error:      "Error",
  aborted:    "Stopped",
};

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
        "flex flex-col gap-1.5 p-3 rounded-lg border transition-all duration-200",
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
        <span className="text-xs font-mono text-text-muted uppercase tracking-widest leading-none">
          {label}
        </span>
      </div>
      <p className={cn(
        "text-lg font-display font-bold leading-none tracking-tight tabular-nums transition-colors",
        active ? "text-accent-cyan" : "text-text-primary"
      )}>
        {value}
      </p>
    </div>
  );
}

export function MetricsPanel({
  status, tokenCount, tokensPerSecond, elapsedMs, inputMode, className,
}: MetricsPanelProps) {
  const isActive = status === "streaming";
  const isStreaming = status === "streaming";

  return (
    <div className={cn("flex flex-col gap-3", className)} aria-label="Live inference metrics">

      {/* Status + mode row */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className={STATUS_COLORS[status]} aria-hidden="true" />
          <span className={cn("text-xs font-mono font-medium", STATUS_COLORS[status])}>
            {STATUS_LABELS[status]}
          </span>
          {isActive && (
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse-dot"
            />
          )}
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-surface">
          {inputMode === "text"
            ? <FileText size={11} className="text-text-muted" aria-hidden="true" />
            : <Mic size={11} className="text-text-muted" aria-hidden="true" />}
          <span className="text-xs font-mono text-text-muted capitalize">{inputMode}</span>
        </div>
      </div>

      {/* Metrics grid
          aria-busy="true" while streaming tells screen readers to hold off
          announcing the rapid updates — they'll be announced when busy clears. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        aria-busy={isStreaming}
        aria-label="Inference metrics"
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
