/**
 * StreamingOutput.tsx — Phase 3 update
 *
 * Improvements over Phase 2:
 * - Copy-to-clipboard button on completed/aborted/error
 * - Cleaner partial-output-preserved message
 * - Better idle empty state
 */

import { useRef, useEffect, useState } from "react";
import {
  CheckCircle, AlertTriangle, StopCircle,
  Loader2, Wifi, Terminal, Copy, Check,
} from "lucide-react";
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

const STATUS_BADGE: Record<
  InferenceStatus,
  { label: string; variant: "default" | "cyan" | "green" | "amber" | "red" | "purple" }
> = {
  idle:       { label: "Idle",       variant: "default"  },
  connecting: { label: "Connecting", variant: "amber"    },
  streaming:  { label: "Streaming",  variant: "cyan"     },
  completed:  { label: "Completed",  variant: "green"    },
  error:      { label: "Error",      variant: "red"      },
  aborted:    { label: "Stopped",    variant: "purple"   },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : "Copy output to clipboard"}
      className="flex items-center gap-1.5 px-2 py-1 rounded border border-border
        bg-surface text-text-muted hover:text-text-primary hover:border-border-strong
        text-xs font-mono transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
    >
      {copied ? (
        <Check size={11} className="text-accent-green" aria-hidden="true" />
      ) : (
        <Copy size={11} aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function StreamingOutput({
  status, output, tokenCount, error, className,
}: StreamingOutputProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const { label, variant } = STATUS_BADGE[status];
  const hasOutput = output.length > 0;

  useEffect(() => {
    if (status === "streaming" && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, status]);

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <Terminal size={14} className="text-accent-green" aria-hidden="true" />
        <span className="text-xs font-mono font-semibold text-text-primary">
          Streaming Output
        </span>
        <div className="ml-auto flex items-center gap-2">
          {hasOutput && status !== "streaming" && status !== "connecting" && (
            <CopyButton text={output} />
          )}
          <Badge variant={variant} dot={status === "streaming"}>
            {label}
          </Badge>
          <Badge variant="default" className="font-mono">
            {tokenCount} {tokenCount === 1 ? "token" : "tokens"}
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="flex-1 flex flex-col gap-3 p-4">

        {/* ── Idle ──────────────────────────────────────────────────── */}
        {status === "idle" && (
          <div
            role="status"
            aria-label="Idle — enter a prompt and run inference"
            className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
              <Terminal size={20} className="text-accent-green" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-mono text-text-muted">
                Output will stream here token-by-token
              </p>
              <p className="text-xs text-text-muted max-w-xs leading-relaxed">
                Enter a prompt in text or audio mode, then press Run Inference.
                Tokens will appear live as the model generates them — no waiting for the full response.
              </p>
            </div>
          </div>
        )}

        {/* ── Connecting ────────────────────────────────────────────── */}
        {status === "connecting" && (
          <div
            role="status"
            aria-label="Connecting to inference engine"
            className="flex-1 flex flex-col items-center justify-center gap-3 py-16"
          >
            <Wifi size={24} className="text-accent-amber animate-pulse" aria-hidden="true" />
            <p className="text-sm font-mono text-accent-amber">
              Connecting to inference engine…
            </p>
          </div>
        )}

        {/* ── Output (streaming / completed / aborted) ──────────────── */}
        {(status === "streaming" || status === "completed" || status === "aborted") && (
          <div className="flex-1 flex flex-col gap-3">
            <div
              ref={outputRef}
              aria-live="polite"
              aria-atomic="false"
              aria-label="Model output stream"
              className={cn(
                "flex-1 rounded-lg border bg-canvas/60 p-4",
                "overflow-y-auto font-mono text-sm text-text-primary leading-relaxed",
                "min-h-[280px] max-h-[420px]",
                status === "streaming" ? "border-accent-cyan/30" : "border-border"
              )}
            >
              {output}
              {status === "streaming" && (
                <span
                  aria-hidden="true"
                  className="inline-block w-0.5 h-4 bg-accent-cyan ml-0.5 align-middle animate-pulse"
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
                  Stream stopped by user — partial output ({tokenCount} tokens) preserved above
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────── */}
        {status === "error" && (
          <div className="flex-1 flex flex-col gap-3">
            {hasOutput && (
              <>
                <p className="text-xs font-mono text-text-muted">
                  Partial output before failure ({tokenCount} tokens):
                </p>
                <div
                  aria-live="polite"
                  aria-label="Partial output before error"
                  className="rounded-lg border border-border bg-canvas/60 p-4
                    overflow-y-auto font-mono text-sm text-text-primary leading-relaxed
                    min-h-[140px] max-h-[260px]"
                >
                  {output}
                </div>
              </>
            )}

            <div
              role="alert"
              aria-live="assertive"
              className="flex flex-col gap-2 px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/30"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-accent-red shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono font-semibold text-accent-red uppercase tracking-wider">
                  {error?.kind.replace(/_/g, " ") ?? "Stream Error"}
                </span>
              </div>
              <p className="text-xs text-text-secondary font-mono leading-relaxed">
                {error?.message ?? "An unexpected error occurred during inference."}
              </p>
              {hasOutput && (
                <p className="text-xs text-text-muted">
                  Use Retry to resume with the same prompt, or Clear to start over.
                </p>
              )}
            </div>
          </div>
        )}

        {status === "streaming" && (
          <div className="flex items-center gap-2" aria-hidden="true">
            <Loader2 size={11} className="text-accent-cyan animate-spin" />
            <span className="text-xs font-mono text-text-muted">Receiving tokens…</span>
          </div>
        )}

      </CardBody>
    </Card>
  );
}
