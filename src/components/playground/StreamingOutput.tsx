/**
 * StreamingOutput.tsx
 *
 * Renders the live streaming output panel.
 *
 * Accessibility:
 * - aria-live="polite" announces tokens as they arrive.
 * - role="status" on the idle/connecting states.
 * - role="alert" on the error state (assertive announcement).
 * - Non-color error indicators (icon + text, not just red color).
 */

import { useRef, useEffect } from "react";
import { CheckCircle, AlertTriangle, StopCircle, Loader2, Wifi, Terminal } from "lucide-react";
import { cn } from "../../lib/utils";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { InferenceStatus, StreamError } from "../../types/inference";

interface StreamingOutputProps {
  status: InferenceStatus;
  output: string;
  tokenCount: number;
  error: StreamError | null;
  className?: string;
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  InferenceStatus,
  { label: string; badgeVariant: "default" | "cyan" | "green" | "amber" | "red" | "purple" }
> = {
  idle:       { label: "Idle",       badgeVariant: "default" },
  connecting: { label: "Connecting", badgeVariant: "amber"   },
  streaming:  { label: "Streaming",  badgeVariant: "cyan"    },
  completed:  { label: "Completed",  badgeVariant: "green"   },
  error:      { label: "Error",      badgeVariant: "red"     },
  aborted:    { label: "Stopped",    badgeVariant: "purple"  },
};

export function StreamingOutput({
  status,
  output,
  tokenCount,
  error,
  className,
}: StreamingOutputProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const { label, badgeVariant } = STATUS_CONFIG[status];

  // Auto-scroll to bottom as tokens arrive
  useEffect(() => {
    if (status === "streaming" && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, status]);

  return (
    <Card className={cn("flex flex-col h-full min-h-[400px]", className)}>
      <CardHeader>
        <Terminal size={14} className="text-accent-green" aria-hidden="true" />
        <span className="text-xs font-mono font-semibold text-text-primary">
          Streaming Output
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={badgeVariant} dot={status === "streaming"}>
            {label}
          </Badge>
          <Badge variant="default" className="font-mono">
            {tokenCount} {tokenCount === 1 ? "token" : "tokens"}
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="flex-1 flex flex-col gap-3 p-4">

        {/* ── Idle state ──────────────────────────────────────────────── */}
        {status === "idle" && (
          <div
            role="status"
            aria-label="Output idle — enter a prompt and run inference"
            className="flex-1 flex flex-col items-center justify-center gap-3 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
              <Terminal size={20} className="text-accent-green" aria-hidden="true" />
            </div>
            <p className="text-sm font-mono text-text-muted">
              Output will stream here token-by-token
            </p>
            <p className="text-xs text-text-muted max-w-xs">
              Enter a prompt and press Run — tokens will appear live as the model generates them.
            </p>
          </div>
        )}

        {/* ── Connecting state ────────────────────────────────────────── */}
        {status === "connecting" && (
          <div
            role="status"
            aria-label="Connecting to inference engine"
            className="flex-1 flex flex-col items-center justify-center gap-3"
          >
            <Wifi size={22} className="text-accent-amber animate-pulse" aria-hidden="true" />
            <p className="text-sm font-mono text-accent-amber">Connecting to inference engine...</p>
          </div>
        )}

        {/* ── Streaming / Completed / Aborted output ──────────────────── */}
        {(status === "streaming" || status === "completed" || status === "aborted") && (
          <div className="flex-1 flex flex-col gap-3">

            {/* Live output region */}
            <div
              ref={outputRef}
              aria-live="polite"
              aria-atomic="false"
              aria-label="Model output stream"
              className={cn(
                "flex-1 rounded-lg border bg-canvas/60 p-4 overflow-y-auto",
                "font-mono text-sm text-text-primary leading-relaxed",
                "min-h-[280px] max-h-[400px]",
                status === "streaming" ? "border-accent-cyan/30" : "border-border"
              )}
            >
              {output}
              {/* Blinking cursor while streaming */}
              {status === "streaming" && (
                <span
                  aria-hidden="true"
                  className="inline-block w-0.5 h-4 bg-accent-cyan ml-0.5 align-middle animate-pulse"
                />
              )}
            </div>

            {/* Status banners */}
            {status === "completed" && (
              <div
                role="status"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-green/10 border border-accent-green/20"
              >
                <CheckCircle size={14} className="text-accent-green shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono text-accent-green">
                  Inference completed successfully
                </span>
              </div>
            )}

            {status === "aborted" && (
              <div
                role="status"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-purple/10 border border-accent-purple/20"
              >
                <StopCircle size={14} className="text-accent-purple shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono text-accent-purple">
                  Stream stopped — partial output preserved above
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Error state ──────────────────────────────────────────────── */}
        {status === "error" && (
          <div className="flex-1 flex flex-col gap-3">

            {/* Partial output — always shown even on error */}
            {output && (
              <div
                aria-live="polite"
                aria-label="Partial model output before error"
                className="flex-1 rounded-lg border border-border bg-canvas/60 p-4 overflow-y-auto font-mono text-sm text-text-primary leading-relaxed min-h-[200px] max-h-[300px]"
              >
                {output}
              </div>
            )}

            {/* Error card — role=alert for immediate screen reader announcement */}
            <div
              role="alert"
              aria-live="assertive"
              className="flex flex-col gap-2 px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/30"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-accent-red shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono font-semibold text-accent-red uppercase tracking-wider">
                  {error?.kind.replace("_", " ") ?? "Stream Error"}
                </span>
              </div>
              <p className="text-xs text-text-secondary font-mono">
                {error?.message ?? "An unexpected error occurred."}
              </p>
              {output && (
                <p className="text-xs text-text-muted">
                  Partial output ({tokenCount} tokens) preserved above.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading spinner for streaming */}
        {status === "streaming" && (
          <div className="flex items-center gap-2" aria-hidden="true">
            <Loader2 size={12} className="text-accent-cyan animate-spin" />
            <span className="text-xs font-mono text-text-muted">Receiving tokens...</span>
          </div>
        )}

      </CardBody>
    </Card>
  );
}
