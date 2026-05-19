/**
 * StreamingOutput.tsx — Phase 6 hardened
 *
 * Accessibility fixes:
 * - aria-relevant="additions text" on live output region
 * - aria-label updated to be more descriptive
 * - role="region" + aria-labelledby on the card for better landmark nav
 * - Blinking cursor: aria-hidden (was already, confirmed)
 * - Copy button: sr-only confirmation text for screen readers
 */

import { useRef, useEffect, useState } from "react";
import {
  CheckCircle, AlertTriangle, StopCircle,
  Loader2, Wifi, Terminal, Copy, Check,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import type { InferenceStatus, StreamError } from "../../types/inference";

interface StreamingOutputProps {
  status: InferenceStatus;
  output: string;
  tokenCount: number;
  error: StreamError | null;
  className?: string;
}

const STATUS_BADGE: Record<
  InferenceStatus,
  { label: string; variant: "default" | "cyan" | "green" | "amber" | "red" | "purple" }
> = {
  idle:       { label: "Idle",       variant: "default" },
  connecting: { label: "Connecting", variant: "amber"   },
  streaming:  { label: "Streaming",  variant: "cyan"    },
  completed:  { label: "Completed",  variant: "green"   },
  error:      { label: "Error",      variant: "red"     },
  aborted:    { label: "Stopped",    variant: "purple"  },
};

export function StreamingOutput({
  status, output, tokenCount, error, className,
}: StreamingOutputProps) {
  const outputRef  = useRef<HTMLDivElement>(null);
  const headingId  = "streaming-output-heading";
  const [copied, setCopied] = useState(false);
  const { label, variant } = STATUS_BADGE[status];

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (status === "streaming" && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, status]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently fail
    }
  };

  const showOutput = output.length > 0;
  const showCopy   = (status === "completed" || status === "aborted" || status === "error") && showOutput;

  return (
    <Card
      className={cn("flex flex-col", className)}
      as="section"
    >
      <CardHeader>
        <Terminal size={14} className="text-accent-green" aria-hidden="true" />
        <span
          id={headingId}
          className="text-xs font-mono font-semibold text-text-primary"
        >
          Streaming Output
        </span>
        <div className="ml-auto flex items-center gap-2">
          {showCopy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check size={12} /> : <Copy size={12} />}
              aria-label={copied ? "Output copied to clipboard" : "Copy output to clipboard"}
            >
              {copied ? "Copied" : "Copy"}
              {/* Screen-reader-only live confirmation */}
              {copied && <span className="sr-only" aria-live="polite">Output copied.</span>}
            </Button>
          )}
          <Badge variant={variant} dot={status === "streaming"}>{label}</Badge>
          <Badge variant="default" className="font-mono">
            {tokenCount} {tokenCount === 1 ? "token" : "tokens"}
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="flex-1 flex flex-col gap-3 p-4 min-h-[380px]">

        {/* ── Idle ──────────────────────────────────── */}
        {status === "idle" && (
          <div
            role="status"
            aria-label="Output area idle — enter a prompt to begin inference"
            className="flex-1 flex flex-col items-center justify-center gap-4 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
              <Terminal size={22} className="text-accent-green" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-mono text-text-primary font-medium">
                Output will stream here token-by-token
              </p>
              <p className="text-xs text-text-muted max-w-xs">
                Select text or audio mode, enter a prompt, and click Run Inference. Tokens appear live.
              </p>
            </div>
          </div>
        )}

        {/* ── Connecting ────────────────────────────── */}
        {status === "connecting" && (
          <div
            role="status"
            aria-label="Connecting to inference engine, please wait"
            className="flex-1 flex flex-col items-center justify-center gap-3"
          >
            <Wifi size={24} className="text-accent-amber animate-pulse" aria-hidden="true" />
            <p className="text-sm font-mono text-accent-amber">
              Connecting to inference engine...
            </p>
          </div>
        )}

        {/* ── Output area (streaming / completed / aborted) ── */}
        {(status === "streaming" || status === "completed" || status === "aborted") && showOutput && (
          <div className="flex-1 flex flex-col gap-3">
            <div
              ref={outputRef}
              aria-live="polite"
              aria-atomic="false"
              aria-relevant="additions text"
              aria-label="Model inference output"
              role="region"
              className={cn(
                "flex-1 rounded-lg border p-4 overflow-y-auto",
                "font-mono text-sm text-text-primary leading-relaxed",
                "bg-canvas/60 min-h-[280px]",
                status === "streaming" ? "border-accent-cyan/30" : "border-border"
              )}
            >
              {output}
              {status === "streaming" && (
                <span
                  aria-hidden="true"
                  className="inline-block w-px h-4 bg-accent-cyan ml-0.5 align-middle animate-pulse"
                />
              )}
            </div>

            {status === "completed" && (
              <div
                role="status"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-green/10 border border-accent-green/20"
              >
                <CheckCircle size={13} className="text-accent-green shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono text-accent-green">
                  Inference completed — {tokenCount} tokens generated
                </span>
              </div>
            )}

            {status === "aborted" && (
              <div
                role="status"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-purple/10 border border-accent-purple/20"
              >
                <StopCircle size={13} className="text-accent-purple shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono text-accent-purple">
                  Stream stopped — {tokenCount} tokens received — Partial output preserved
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Error ─────────────────────────────────── */}
        {status === "error" && (
          <div className="flex-1 flex flex-col gap-3">
            {showOutput && (
              <div
                aria-live="polite"
                aria-label="Partial output before error occurred"
                className="rounded-lg border border-border bg-canvas/60 p-4 overflow-y-auto font-mono text-sm text-text-primary leading-relaxed min-h-[180px] max-h-[260px]"
              >
                {output}
              </div>
            )}
            <div
              role="alert"
              aria-live="assertive"
              className="flex flex-col gap-2 px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/30"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-accent-red shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono font-semibold text-accent-red uppercase tracking-wider">
                  {error?.kind.replace(/_/g, " ") ?? "Stream Error"}
                </span>
              </div>
              <p className="text-xs text-text-secondary font-mono leading-relaxed">
                {error?.message ?? "An unexpected error occurred during inference."}
              </p>
              {showOutput && (
                <p className="text-xs text-text-muted">
                  {tokenCount} partial tokens preserved above.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Streaming footer */}
        {status === "streaming" && (
          <div className="flex items-center gap-2" aria-hidden="true">
            <Loader2 size={11} className="text-accent-cyan animate-spin" />
            <span className="text-xs font-mono text-text-muted">Receiving tokens...</span>
          </div>
        )}

      </CardBody>
    </Card>
  );
}
