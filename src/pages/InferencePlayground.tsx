/**
 * InferencePlayground.tsx — Phase 2 version
 *
 * Wires up the streaming engine to the UI.
 * Input controls, prompt textarea, failure simulation, action buttons.
 * Full audio mode comes in Phase 3.
 */

import { useState, useRef } from "react";
import {
  Terminal, Zap, Mic, ShieldCheck,
  ArrowRight, Radio, Play, Square, RotateCcw, AlertTriangle,
} from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/ui/StatCard";
import { StreamingOutput } from "../components/playground/StreamingOutput";
import { MetricsPanel } from "../components/playground/MetricsPanel";
import { useStreamingInference } from "../hooks/useStreamingInference";
import type { FailureMode } from "../types/inference";

const FEATURE_CARDS = [
  {
    icon: <Radio size={20} />,
    label: "Architecture",
    value: "Streaming",
    description: "Token-by-token rendering via ReadableStream + Fetch API. No buffering.",
    accent: "cyan" as const,
  },
  {
    icon: <Mic size={20} />,
    label: "Input Modes",
    value: "Multimodal",
    description: "Text and audio input with MediaRecorder API. Toggle between modes.",
    accent: "green" as const,
  },
  {
    icon: <Zap size={20} />,
    label: "Metrics",
    value: "Live",
    description: "Real-time token counter and tokens/sec updated on every chunk arrival.",
    accent: "amber" as const,
  },
  {
    icon: <ShieldCheck size={20} />,
    label: "Error Handling",
    value: "Resilient",
    description: "Preserves partial output on network drops, timeouts, and stream aborts.",
    accent: "purple" as const,
  },
];

const FAILURE_MODES: { value: FailureMode; label: string }[] = [
  { value: "none",         label: "No failure" },
  { value: "network_drop", label: "Network drop" },
  { value: "timeout",      label: "Timeout" },
];

const SAMPLE_PROMPTS = [
  "Explain how on-device inference works and what makes it different from cloud inference.",
  "Describe the ReadableStream API and how it enables token-by-token rendering.",
  "What are the tradeoffs of quantizing a language model to INT4 for edge deployment?",
];

export function InferencePlayground() {
  const inference = useStreamingInference();

  const [prompt, setPrompt] = useState("");
  const [failureMode, setFailureMode] = useState<FailureMode>("none");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRunning = inference.status === "connecting" || inference.status === "streaming";
  const canRetry  = inference.status === "error" || inference.status === "aborted";
  const hasOutput = inference.output.length > 0;

  const handleRun = () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isRunning) return;
    inference.run({ prompt: trimmedPrompt, inputMode: "text", failureMode });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <div className="space-y-8">

      <div className="stagger-1">
        <SectionHeader
          eyebrow="Part A — Inference Engine"
          title="Inference Playground"
          description="Stream token-by-token model responses directly in the browser. Supports text and audio input with live metrics and graceful error handling."
          actions={<Badge variant="green" dot>Live Streaming</Badge>}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {FEATURE_CARDS.map((card, i) => (
          <div key={card.label} className={`stagger-${i + 2}`}>
            <StatCard
              icon={card.icon}
              label={card.label}
              value={card.value}
              description={card.description}
              accent={card.accent}
            />
          </div>
        ))}
      </div>

      <div className="stagger-3 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ── Left column: Input + Metrics + Actions ── */}
        <div className="lg:col-span-1 flex flex-col gap-4">

          <Card>
            <CardHeader>
              <Terminal size={14} className="text-accent-cyan" aria-hidden="true" />
              <span className="text-xs font-mono font-semibold text-text-primary">Input</span>
              <Badge variant="cyan" className="ml-auto">Text Mode</Badge>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="prompt-input"
                  className="text-xs font-mono text-text-muted uppercase tracking-wider"
                >
                  Prompt
                </label>
                <textarea
                  id="prompt-input"
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isRunning}
                  placeholder="Enter your prompt here..."
                  rows={6}
                  aria-label="Inference prompt"
                  aria-describedby="prompt-hint"
                  className="w-full rounded-lg border border-border bg-canvas/60 px-3 py-2.5
                    text-sm font-mono text-text-primary placeholder:text-text-muted
                    resize-none leading-relaxed
                    focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-150"
                />
                <p id="prompt-hint" className="text-xs text-text-muted">
                  Ctrl+Enter to run
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-mono text-text-muted uppercase tracking-wider">
                  Sample prompts
                </p>
                <div className="flex flex-col gap-1.5">
                  {SAMPLE_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => { setPrompt(p); textareaRef.current?.focus(); }}
                      disabled={isRunning}
                      className="text-left text-xs text-text-secondary hover:text-text-primary
                        px-2.5 py-2 rounded border border-border hover:border-border-strong
                        bg-transparent hover:bg-surface-raised
                        transition-all duration-150 font-sans leading-relaxed
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan
                        disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {p.length > 80 ? p.slice(0, 80) + "…" : p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="failure-mode"
                  className="text-xs font-mono text-text-muted uppercase tracking-wider"
                >
                  Simulate failure
                </label>
                <select
                  id="failure-mode"
                  value={failureMode}
                  onChange={(e) => setFailureMode(e.target.value as FailureMode)}
                  disabled={isRunning}
                  className="w-full rounded-lg border border-border bg-canvas/60 px-3 py-2
                    text-sm font-mono text-text-primary
                    focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-150"
                >
                  {FAILURE_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                {failureMode !== "none" && (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-accent-amber/30 bg-accent-amber/5">
                    <AlertTriangle size={11} className="text-accent-amber shrink-0" aria-hidden="true" />
                    <span className="text-xs font-mono text-accent-amber">
                      Failure will be injected mid-stream
                    </span>
                  </div>
                )}
              </div>

            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <MetricsPanel
                status={inference.status}
                tokenCount={inference.tokenCount}
                tokensPerSecond={inference.tokensPerSecond}
                elapsedMs={inference.elapsedMs}
              />
            </CardBody>
          </Card>

          <div className="flex flex-col gap-2">
            {!isRunning ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleRun}
                disabled={!prompt.trim()}
                leftIcon={<Play size={14} />}
                className="w-full"
                aria-label="Run inference"
              >
                Run Inference
              </Button>
            ) : (
              <Button
                variant="danger"
                size="md"
                onClick={inference.stop}
                leftIcon={<Square size={14} />}
                className="w-full"
                aria-label="Stop inference stream"
              >
                Stop Stream
              </Button>
            )}

            {canRetry && (
              <Button
                variant="secondary"
                size="md"
                onClick={inference.retry}
                leftIcon={<RotateCcw size={14} />}
                className="w-full"
              >
                Retry
              </Button>
            )}

            {hasOutput && !isRunning && (
              <Button
                variant="ghost"
                size="sm"
                onClick={inference.reset}
                className="w-full"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* ── Right column: Output ──────────────────── */}
        <div className="lg:col-span-2">
          <StreamingOutput
            status={inference.status}
            output={inference.output}
            tokenCount={inference.tokenCount}
            error={inference.error}
          />
        </div>
      </div>

      {/* ── Live state machine ───────────────────────── */}
      <div className="stagger-4">
        <Card variant="inset">
          <CardHeader>
            <span className="text-xs font-mono font-semibold text-text-secondary">
              State Machine — current:
            </span>
            <Badge variant="cyan" className="font-mono">{inference.status}</Badge>
          </CardHeader>
          <CardBody>
            <div
              className="flex flex-wrap items-center gap-2"
              role="list"
              aria-label="Inference state machine stages"
            >
              {(["idle","connecting","streaming","completed","error","aborted"] as const).map(
                (s, i, arr) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      role="listitem"
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all duration-300 ${
                        inference.status === s
                          ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan scale-105"
                          : "border-border bg-surface-raised text-text-muted"
                      }`}
                    >
                      {s}
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowRight size={12} className="text-border-strong shrink-0" aria-hidden="true" />
                    )}
                  </div>
                )
              )}
            </div>
          </CardBody>
        </Card>
      </div>

    </div>
  );
}
