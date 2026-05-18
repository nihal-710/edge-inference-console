/**
 * InferencePlayground.tsx — Phase 5 update
 *
 * Adds onRunComplete prop — called after every run that reaches
 * completed, error, or aborted state with a full InferenceRun record.
 *
 * The run is saved to session history exactly once per lifecycle.
 * We use a ref to track whether we've already saved for the current run
 * so React's double-render in StrictMode doesn't duplicate entries.
 */

import { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Zap,
  Mic,
  ShieldCheck,
  ArrowRight,
  Radio,
  Play,
  Square,
  RotateCcw,
} from "lucide-react";
import { cn } from "../lib/utils";
import { generateId } from "../lib/utils";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/ui/StatCard";
import { StreamingOutput } from "../components/playground/StreamingOutput";
import { MetricsPanel } from "../components/playground/MetricsPanel";
import { StatusBanner } from "../components/playground/StatusBanner";
import { TextInputPanel } from "../components/playground/TextInputPanel";
import { AudioInputPanel } from "../components/playground/AudioInputPanel";
import { FailureControls } from "../components/playground/FailureControls";
import { useStreamingInference } from "../hooks/useStreamingInference";
import type { FailureMode, InputMode } from "../types/inference";
import type { InferenceRun } from "../types/session";

// ─── Feature cards ─────────────────────────────────────────────────────────────

const FEATURE_CARDS = [
  {
    icon: <Radio size={20} />,
    label: "Architecture",
    value: "Streaming",
    description: "Token-by-token via ReadableStream + Fetch API. No buffering.",
    accent: "cyan" as const,
  },
  {
    icon: <Mic size={20} />,
    label: "Input Modes",
    value: "Multimodal",
    description:
      "Text and audio via MediaRecorder API with live permission handling.",
    accent: "green" as const,
  },
  {
    icon: <Zap size={20} />,
    label: "Metrics",
    value: "Live",
    description:
      "Token count and tok/s update on every chunk arrival via 100ms ticker.",
    accent: "amber" as const,
  },
  {
    icon: <ShieldCheck size={20} />,
    label: "Error Handling",
    value: "Resilient",
    description:
      "Partial output preserved on network drops, timeouts, and aborts.",
    accent: "purple" as const,
  },
];

const INPUT_MODES: { id: InputMode; label: string; icon: React.ReactNode }[] = [
  {
    id: "text",
    label: "Text",
    icon: <Terminal size={14} aria-hidden="true" />,
  },
  { id: "audio", label: "Audio", icon: <Mic size={14} aria-hidden="true" /> },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface InferencePlaygroundProps {
  onRunComplete: (run: InferenceRun) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InferencePlayground({
  onRunComplete,
}: InferencePlaygroundProps) {
  const inference = useStreamingInference();

  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [textPrompt, setTextPrompt] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [failureMode, setFailureMode] = useState<FailureMode>("none");

  // Track the prompt for the current run so we can save it
  const currentPromptRef = useRef("");
  // Prevent double-save in React StrictMode double-render
  const savedForStatusRef = useRef<string>("");

  const isRunning =
    inference.status === "connecting" || inference.status === "streaming";
  const canRetry =
    inference.status === "error" || inference.status === "aborted";
  const hasOutput = inference.output.length > 0;
  const canRun =
    inputMode === "text" ? textPrompt.trim().length > 0 : audioBlob !== null;

  // ── Save run to session history when terminal state is reached ──────────────
  useEffect(() => {
    const terminalStatuses = ["completed", "error", "aborted"] as const;
    const isTerminal = terminalStatuses.includes(
      inference.status as (typeof terminalStatuses)[number],
    );

    // Only save once per status transition
    const saveKey = `${inference.status}-${inference.tokenCount}`;
    if (!isTerminal || savedForStatusRef.current === saveKey) return;
    savedForStatusRef.current = saveKey;

    const run: InferenceRun = {
      id: generateId(),
      timestamp: Date.now(),
      inputMode,
      prompt: currentPromptRef.current,
      output: inference.output,
      status: inference.status,
      tokenCount: inference.tokenCount,
      tokensPerSecond: inference.tokensPerSecond,
      durationMs: inference.elapsedMs,
      errorMessage: inference.error?.message,
    };

    onRunComplete(run);
  }, [
    inference.status,
    inference.output,
    inference.tokenCount,
    inference.tokensPerSecond,
    inference.elapsedMs,
    inference.error,
    inputMode,
    onRunComplete,
  ]);

  // ── Run handler ─────────────────────────────────────────────────────────────

  const handleRun = () => {
    if (isRunning) return;
    savedForStatusRef.current = "";

    if (inputMode === "text") {
      const prompt = textPrompt.trim();
      if (!prompt) return;
      currentPromptRef.current = prompt;
      inference.run({ prompt, inputMode: "text", failureMode });
    } else {
      if (!audioBlob) return;
      const label = `[Audio — ${(audioBlob.size / 1024).toFixed(1)} KB via MediaRecorder]`;
      currentPromptRef.current = label;
      inference.run({ prompt: label, inputMode: "audio", failureMode });
    }
  };

  const handleModeChange = (mode: InputMode) => {
    if (isRunning) return;
    setInputMode(mode);
  };

  return (
    <div className="space-y-8">
      <div className="stagger-1">
        <SectionHeader
          eyebrow="Part A — Inference Engine"
          title="Inference Playground"
          description="Stream token-by-token model responses in the browser. Toggle between text and audio input, observe live metrics, and test error resilience."
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="green" dot>
                Live Streaming
              </Badge>
              <Badge variant="cyan">Part A Complete</Badge>
            </div>
          }
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
        {/* Left column */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              {inputMode === "text" ? (
                <Terminal
                  size={14}
                  className="text-accent-cyan"
                  aria-hidden="true"
                />
              ) : (
                <Mic
                  size={14}
                  className="text-accent-green"
                  aria-hidden="true"
                />
              )}
              <span className="text-xs font-mono font-semibold text-text-primary">
                Input
              </span>
              <div
                role="tablist"
                aria-label="Input mode selector"
                className="ml-auto flex rounded-lg border border-border overflow-hidden"
              >
                {INPUT_MODES.map((mode) => {
                  const isActive = inputMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`input-panel-${mode.id}`}
                      id={`mode-tab-${mode.id}`}
                      onClick={() => handleModeChange(mode.id)}
                      disabled={isRunning}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono",
                        "transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-inset",
                        "disabled:opacity-40 disabled:cursor-not-allowed",
                        isActive
                          ? "bg-accent-cyan/10 text-accent-cyan"
                          : "text-text-muted hover:text-text-secondary hover:bg-surface-raised",
                      )}
                    >
                      {mode.icon}
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </CardHeader>
            <CardBody>
              <div
                id="input-panel-text"
                role="tabpanel"
                aria-labelledby="mode-tab-text"
                hidden={inputMode !== "text"}
              >
                {inputMode === "text" && (
                  <TextInputPanel
                    prompt={textPrompt}
                    onChange={setTextPrompt}
                    onSubmit={handleRun}
                    disabled={isRunning}
                  />
                )}
              </div>
              <div
                id="input-panel-audio"
                role="tabpanel"
                aria-labelledby="mode-tab-audio"
                hidden={inputMode !== "audio"}
              >
                {inputMode === "audio" && (
                  <AudioInputPanel
                    onAudioReady={(blob) => setAudioBlob(blob)}
                    disabled={isRunning}
                  />
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

          <Card variant="inset">
            <CardBody>
              <FailureControls
                value={failureMode}
                onChange={setFailureMode}
                disabled={isRunning}
              />
            </CardBody>
          </Card>

          <div
            className="flex flex-col gap-2"
            role="group"
            aria-label="Inference controls"
          >
            {!isRunning ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleRun}
                disabled={!canRun}
                leftIcon={<Play size={14} />}
                className="w-full"
                aria-label={
                  inputMode === "text"
                    ? "Run text inference"
                    : "Run audio inference"
                }
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

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <StatusBanner
            status={inference.status}
            tokenCount={inference.tokenCount}
            tokensPerSecond={inference.tokensPerSecond}
            errorKind={inference.error?.kind}
          />
          <StreamingOutput
            status={inference.status}
            output={inference.output}
            tokenCount={inference.tokenCount}
            error={inference.error}
            className="flex-1"
          />
        </div>
      </div>

      {/* State machine */}
      <div className="stagger-4">
        <Card variant="inset">
          <CardHeader>
            <span className="text-xs font-mono font-semibold text-text-secondary">
              State Machine — current:
            </span>
            <Badge variant="cyan" className="font-mono ml-1">
              {inference.status}
            </Badge>
          </CardHeader>
          <CardBody>
            <div
              className="flex flex-wrap items-center gap-2"
              role="list"
              aria-label="Inference state machine stages"
            >
              {(
                [
                  "idle",
                  "connecting",
                  "streaming",
                  "completed",
                  "error",
                  "aborted",
                ] as const
              ).map((s, i, arr) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    role="listitem"
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all duration-300",
                      inference.status === s
                        ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan scale-105"
                        : "border-border bg-surface-raised text-text-muted",
                    )}
                  >
                    {s}
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight
                      size={12}
                      className="text-border-strong shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
