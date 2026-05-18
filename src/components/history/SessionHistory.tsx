/**
 * SessionHistory.tsx
 *
 * Renders the run list (left) and the RunInspector (right).
 * Two-panel layout on desktop, stacked on mobile.
 *
 * Accessibility:
 * - Run list uses role="list" / role="listitem"
 * - Selected run has aria-pressed="true"
 * - aria-live on the inspector region so screen readers announce selection changes
 */

import { History, Trash2, FileText, Mic } from "lucide-react";
import { cn } from "../../lib/utils";
import { formatTimestamp, formatDuration } from "../../lib/utils";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { RunInspector } from "./RunInspector";
import type { InferenceRun } from "../../types/session";
import type { InferenceStatus } from "../../types/inference";

interface SessionHistoryProps {
  runs: InferenceRun[];
  selectedRunId: string | null;
  selectedRun: InferenceRun | null;
  onSelectRun: (id: string | null) => void;
  onClearHistory: () => void;
}

// ─── Status badge variant map ──────────────────────────────────────────────────

const STATUS_VARIANT: Record<
  InferenceStatus,
  "default" | "green" | "red" | "purple" | "cyan" | "amber"
> = {
  idle:       "default",
  connecting: "amber",
  streaming:  "cyan",
  completed:  "green",
  error:      "red",
  aborted:    "purple",
};

const STATUS_LABEL: Record<InferenceStatus, string> = {
  idle:       "Idle",
  connecting: "Connecting",
  streaming:  "Streaming",
  completed:  "Done",
  error:      "Error",
  aborted:    "Stopped",
};

// ─── Single run row ────────────────────────────────────────────────────────────

interface RunRowProps {
  run: InferenceRun;
  isSelected: boolean;
  onClick: () => void;
}

function RunRow({ run, isSelected, onClick }: RunRowProps) {
  const statusVariant = STATUS_VARIANT[run.status] ?? "default";
  const statusLabel   = STATUS_LABEL[run.status]   ?? run.status;

  return (
    <li role="listitem">
      <button
        onClick={onClick}
        aria-pressed={isSelected}
        aria-label={`Run at ${formatTimestamp(run.timestamp)}, ${statusLabel}, ${run.tokenCount} tokens`}
        className={cn(
          "w-full text-left px-4 py-3 flex flex-col gap-1.5",
          "border-b border-border last:border-b-0",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-inset",
          isSelected
            ? "bg-accent-cyan/5 border-l-2 border-l-accent-cyan"
            : "hover:bg-surface-raised"
        )}
      >
        {/* Top row: mode + timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {run.inputMode === "text"
              ? <FileText size={11} className="text-text-muted shrink-0" aria-hidden="true" />
              : <Mic size={11} className="text-text-muted shrink-0" aria-hidden="true" />}
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
              {run.inputMode}
            </span>
          </div>
          <span className="text-xs font-mono text-text-muted shrink-0">
            {formatTimestamp(run.timestamp)}
          </span>
        </div>

        {/* Prompt preview */}
        <p className="text-xs text-text-secondary leading-relaxed truncate font-sans">
          {run.prompt || "(no prompt)"}
        </p>

        {/* Bottom row: status + metrics */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariant}>{statusLabel}</Badge>
          <span className="text-xs font-mono text-text-muted">
            {run.tokenCount} tok
          </span>
          <span className="text-xs font-mono text-text-muted">
            {formatDuration(run.durationMs)}
          </span>
        </div>
      </button>
    </li>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function SessionHistory({
  runs,
  selectedRunId,
  selectedRun,
  onSelectRun,
  onClearHistory,
}: SessionHistoryProps) {
  const isEmpty = runs.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

      {/* ── Left: Run list ───────────────────────── */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <History size={14} className="text-text-muted" aria-hidden="true" />
            <span className="text-xs font-mono font-semibold text-text-primary">
              Run Log
            </span>
            <Badge variant="default" className="ml-auto font-mono">
              {runs.length} {runs.length === 1 ? "run" : "runs"}
            </Badge>
          </CardHeader>

          {isEmpty ? (
            <CardBody>
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center">
                  <History size={20} className="text-text-muted" aria-hidden="true" />
                </div>
                <p className="text-sm font-mono text-text-muted">No runs yet</p>
                <p className="text-xs text-text-muted max-w-xs">
                  Run inference in the Playground — each completed, stopped, or failed run will appear here.
                </p>
              </div>
            </CardBody>
          ) : (
            <ul
              role="list"
              aria-label="Inference run history"
              className="divide-y divide-border"
            >
              {runs.map((run) => (
                <RunRow
                  key={run.id}
                  run={run}
                  isSelected={run.id === selectedRunId}
                  onClick={() => onSelectRun(run.id === selectedRunId ? null : run.id)}
                />
              ))}
            </ul>
          )}

          {!isEmpty && (
            <div className="px-4 py-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                leftIcon={<Trash2 size={12} />}
                className="w-full text-accent-red hover:text-accent-red"
                aria-label="Clear all run history"
              >
                Clear History
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* ── Right: Inspector ─────────────────────── */}
      <div
        className="lg:col-span-3"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Run inspector"
      >
        {selectedRun ? (
          <Card>
            <CardBody>
              <RunInspector run={selectedRun} />
            </CardBody>
          </Card>
        ) : (
          <Card variant="inset">
            <CardBody className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center">
                <History size={20} className="text-text-muted" aria-hidden="true" />
              </div>
              <p className="text-sm font-mono text-text-muted">
                {isEmpty ? "No runs yet" : "Select a run to inspect"}
              </p>
              <p className="text-xs text-text-muted max-w-xs">
                {isEmpty
                  ? "Complete an inference run in the Playground first."
                  : "Click any run in the log to view its full output, metrics, and error state."}
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
