/**
 * RunInspector.tsx
 *
 * Displays the full details of a selected inference run:
 * - Input summary (mode, prompt, timestamp)
 * - Status badge
 * - Metrics (tokens, tok/s, duration)
 * - Full output with copy button
 * - Error message if present
 *
 * Accessibility:
 * - section with aria-labelledby
 * - role="status" on metrics
 * - role="alert" on error
 * - Copy button with aria-label + feedback
 */

import { useState } from "react";
import {
  FileText,
  Mic,
  Clock,
  Hash,
  Zap,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle,
  StopCircle,
} from "lucide-react";

import { formatDuration, formatTimestamp } from "../../lib/utils";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import type { InferenceRun } from "../../types/session";
import type { InferenceStatus } from "../../types/inference";

interface RunInspectorProps {
  run: InferenceRun;
}

const STATUS_CONFIG: Record<
  InferenceStatus,
  {
    label: string;
    variant: "default" | "green" | "red" | "purple" | "cyan" | "amber";
  }
> = {
  idle: { label: "Idle", variant: "default" },
  connecting: { label: "Connecting", variant: "amber" },
  streaming: { label: "Streaming", variant: "cyan" },
  completed: { label: "Completed", variant: "green" },
  error: { label: "Error", variant: "red" },
  aborted: { label: "Stopped", variant: "purple" },
};

export function RunInspector({ run }: RunInspectorProps) {
  const [copied, setCopied] = useState(false);
  const { label, variant } =
    STATUS_CONFIG[run.status] ?? STATUS_CONFIG.completed;

  const handleCopy = async () => {
    if (!run.output) return;
    try {
      await navigator.clipboard.writeText(run.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — fail silently
    }
  };

  return (
    <section
      aria-labelledby="inspector-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3
          id="inspector-heading"
          className="text-sm font-mono font-semibold text-text-primary"
        >
          Run Inspector
        </h3>
        <Badge variant={variant}>{label}</Badge>
      </div>

      {/* Input summary */}
      <Card variant="inset">
        <CardBody className="flex flex-col gap-3 py-3">
          <div className="flex items-center gap-2">
            {run.inputMode === "text" ? (
              <FileText
                size={13}
                className="text-text-muted shrink-0"
                aria-hidden="true"
              />
            ) : (
              <Mic
                size={13}
                className="text-text-muted shrink-0"
                aria-hidden="true"
              />
            )}
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
              {run.inputMode} input
            </span>
            <span className="ml-auto text-xs font-mono text-text-muted">
              {formatTimestamp(run.timestamp)}
            </span>
          </div>
          <p className="text-sm font-mono text-text-secondary leading-relaxed break-words">
            {run.prompt || "(no prompt)"}
          </p>
        </CardBody>
      </Card>

      {/* Metrics */}
      <div
        role="status"
        aria-label="Run metrics"
        className="grid grid-cols-3 gap-2"
      >
        {[
          {
            icon: <Hash size={12} />,
            label: "Tokens",
            value: String(run.tokenCount),
          },
          {
            icon: <Zap size={12} />,
            label: "Tok/s",
            value: String(run.tokensPerSecond),
          },
          {
            icon: <Clock size={12} />,
            label: "Duration",
            value: formatDuration(run.durationMs),
          },
        ].map((m) => (
          <div
            key={m.label}
            className="flex flex-col gap-1.5 p-3 rounded-lg border border-border bg-surface"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-text-muted" aria-hidden="true">
                {m.icon}
              </span>
              <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
                {m.label}
              </span>
            </div>
            <p className="text-base font-display font-bold text-text-primary leading-none">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Output */}
      <Card>
        <CardHeader>
          <span className="text-xs font-mono font-semibold text-text-primary">
            Output
          </span>
          {run.output && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check size={12} /> : <Copy size={12} />}
              className="ml-auto"
              aria-label={copied ? "Copied" : "Copy output to clipboard"}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </CardHeader>
        <CardBody>
          {run.output ? (
            <div
              aria-label="Inference output"
              className="rounded-lg border border-border bg-canvas/60 p-4 font-mono text-sm text-text-primary leading-relaxed max-h-72 overflow-y-auto"
            >
              {run.output}
            </div>
          ) : (
            <p className="text-sm text-text-muted font-mono">
              (no output recorded)
            </p>
          )}
        </CardBody>
      </Card>

      {/* Error — only shown when status is error */}
      {run.status === "error" && run.errorMessage && (
        <div
          role="alert"
          className="flex flex-col gap-2 px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/30"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={13}
              className="text-accent-red shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-mono font-semibold text-accent-red uppercase tracking-wider">
              Error
            </span>
          </div>
          <p className="text-xs text-text-secondary font-mono leading-relaxed">
            {run.errorMessage}
          </p>
        </div>
      )}

      {/* Aborted note */}
      {run.status === "aborted" && (
        <div
          role="status"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-purple/10 border border-accent-purple/20"
        >
          <StopCircle
            size={13}
            className="text-accent-purple shrink-0"
            aria-hidden="true"
          />
          <span className="text-xs font-mono text-accent-purple">
            Run was stopped by user — partial output shown above.
          </span>
        </div>
      )}

      {/* Completed note */}
      {run.status === "completed" && (
        <div
          role="status"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-green/10 border border-accent-green/20"
        >
          <CheckCircle
            size={13}
            className="text-accent-green shrink-0"
            aria-hidden="true"
          />
          <span className="text-xs font-mono text-accent-green">
            Run completed successfully.
          </span>
        </div>
      )}
    </section>
  );
}
