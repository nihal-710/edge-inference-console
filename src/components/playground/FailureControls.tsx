/**
 * FailureControls.tsx
 *
 * Failure simulation selector panel.
 * Lets the user inject network_drop or timeout errors to test error handling.
 * Clearly labelled as a testing tool so it doesn't confuse end users.
 */

import { AlertTriangle, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import type { FailureMode } from "../../types/inference";

interface FailureControlsProps {
  value: FailureMode;
  onChange: (mode: FailureMode) => void;
  disabled?: boolean;
}

const MODES: { value: FailureMode; label: string; description: string }[] = [
  {
    value: "none",
    label: "No failure",
    description: "Normal completion",
  },
  {
    value: "network_drop",
    label: "Network drop",
    description: "Connection drops at ~45% through the stream",
  },
  {
    value: "timeout",
    label: "Model timeout",
    description: "Inference engine times out after ~1.8 seconds",
  },
];

export function FailureControls({ value, onChange, disabled = false }: FailureControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Zap size={11} className="text-text-muted" aria-hidden="true" />
        <label
          htmlFor="failure-mode-select"
          className="text-xs font-mono text-text-muted uppercase tracking-wider"
        >
          Simulate failure
        </label>
      </div>

      <select
        id="failure-mode-select"
        value={value}
        onChange={(e) => onChange(e.target.value as FailureMode)}
        disabled={disabled}
        aria-label="Failure mode simulation selector"
        aria-describedby="failure-mode-hint"
        className={cn(
          "w-full rounded-lg border border-border bg-canvas/60 px-3 py-2",
          "text-sm font-mono text-text-primary",
          "focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan",
          "transition-colors duration-150",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {MODES.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <p id="failure-mode-hint" className="text-xs text-text-muted">
        {MODES.find((m) => m.value === value)?.description}
      </p>

      {value !== "none" && (
        <div
          role="status"
          className="flex items-start gap-1.5 px-2.5 py-2 rounded-lg border border-accent-amber/30 bg-accent-amber/5"
        >
          <AlertTriangle size={11} className="text-accent-amber shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-xs font-mono text-accent-amber leading-relaxed">
            Failure will be injected mid-stream. Partial output will be preserved.
          </span>
        </div>
      )}
    </div>
  );
}
