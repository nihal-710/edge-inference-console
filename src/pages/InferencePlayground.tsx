import React from "react";
import { Terminal, Zap, Mic, Waves, ShieldCheck, ArrowRight, Radio, Cpu } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { StatCard } from "../components/ui/StatCard";

const FEATURE_CARDS = [
  {
    icon: <Radio size={20} />,
    label: "Architecture",
    value: "Streaming",
    description: "Token-by-token rendering via ReadableStream and Fetch API. No buffering.",
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

const STATE_STEPS = [
  { state: "idle",       label: "Idle",       color: "text-status-idle",       desc: "Awaiting prompt" },
  { state: "connecting", label: "Connecting", color: "text-status-connecting", desc: "Establishing stream" },
  { state: "streaming",  label: "Streaming",  color: "text-status-streaming",  desc: "Tokens arriving" },
  { state: "completed",  label: "Completed",  color: "text-status-completed",  desc: "Run finished" },
];

export function InferencePlayground() {
  return (
    <div className="space-y-8">

      <div className="stagger-1">
        <SectionHeader
          eyebrow="Part A — Inference Engine"
          title="Inference Playground"
          description="Stream token-by-token model responses directly in the browser. Supports text and audio input with live metrics and graceful error handling."
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="green" dot>Streaming Ready</Badge>
              <Badge variant="default">Phase 2-3</Badge>
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

      <div className="stagger-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <Terminal size={14} className="text-accent-cyan" aria-hidden="true" />
            <span className="text-xs font-mono font-semibold text-text-primary">Input Panel</span>
            <Badge variant="default" className="ml-auto">Text / Audio</Badge>
          </CardHeader>
          <CardBody>
            <EmptyState
              icon={<Terminal size={22} />}
              title="Input panel"
              description="Multi-modal text and audio input with mode toggle will appear here in Phase 3."
              iconColor="cyan"
              meta={
                <>
                  <Badge variant="cyan">Text mode</Badge>
                  <Badge variant="green">Audio mode</Badge>
                </>
              }
            />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <Waves size={14} className="text-accent-green" aria-hidden="true" />
            <span className="text-xs font-mono font-semibold text-text-primary">Streaming Output</span>
            <Badge variant="default" className="ml-auto font-mono">0 tokens</Badge>
          </CardHeader>
          <CardBody>
            <EmptyState
              icon={<Waves size={22} />}
              title="Output stream"
              description="Token-by-token response output with live rendering and partial output preservation."
              iconColor="green"
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  rightIcon={<ArrowRight size={13} />}
                  disabled
                >
                  Run inference
                </Button>
              }
            />
          </CardBody>
        </Card>
      </div>

      <div className="stagger-4">
        <Card variant="inset">
          <CardHeader>
            <Cpu size={14} className="text-text-muted" aria-hidden="true" />
            <span className="text-xs font-mono font-semibold text-text-secondary">
              Inference State Machine
            </span>
          </CardHeader>
          <CardBody>
            <div
              className="flex flex-wrap items-center gap-2"
              role="list"
              aria-label="Inference state machine stages"
            >
              {STATE_STEPS.map((step, i) => (
                <React.Fragment key={step.state}>
                  <div
                    role="listitem"
                    className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-lg border border-border bg-surface-raised min-w-[90px]"
                  >
                    <span className={`text-xs font-mono font-semibold ${step.color}`}>
                      {step.label}
                    </span>
                    <span className="text-xs text-text-muted text-center">{step.desc}</span>
                  </div>
                  {i < STATE_STEPS.length - 1 && (
                    <ArrowRight size={14} className="text-border-strong shrink-0" aria-hidden="true" />
                  )}
                </React.Fragment>
              ))}
              <span className="text-text-muted text-xs font-mono mx-1" aria-hidden="true">
                also:
              </span>
              <div
                role="listitem"
                className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-lg border border-accent-red/20 bg-accent-red/5 min-w-[90px]"
              >
                <span className="text-xs font-mono font-semibold text-status-error">Error</span>
                <span className="text-xs text-text-muted text-center">Partial preserved</span>
              </div>
              <div
                role="listitem"
                className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-lg border border-accent-purple/20 bg-accent-purple/5 min-w-[90px]"
              >
                <span className="text-xs font-mono font-semibold text-status-aborted">Aborted</span>
                <span className="text-xs text-text-muted text-center">User stopped</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

    </div>
  );
}
