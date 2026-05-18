/**
 * SessionHistory page — Phase 5
 *
 * Wraps the SessionHistory component with the page-level header.
 * Receives session state as props from App.tsx (lifted up so
 * InferencePlayground can also call addRun).
 */

import { Hash, Zap, Clock } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/ui/StatCard";
import { SessionHistory as SessionHistoryComponent } from "../components/history/SessionHistory";
import type { InferenceRun } from "../types/session";

interface SessionHistoryPageProps {
  runs: InferenceRun[];
  selectedRunId: string | null;
  selectedRun: InferenceRun | null;
  onSelectRun: (id: string | null) => void;
  onClearHistory: () => void;
}

export function SessionHistory({
  runs,
  selectedRunId,
  selectedRun,
  onSelectRun,
  onClearHistory,
}: SessionHistoryPageProps) {

  // Compute aggregate stats from runs
  const completedRuns = runs.filter((r) => r.status === "completed");
  const avgTps = completedRuns.length > 0
    ? Math.round(
        completedRuns.reduce((sum, r) => sum + r.tokensPerSecond, 0) / completedRuns.length * 10
      ) / 10
    : 0;
  const avgDuration = completedRuns.length > 0
    ? Math.round(
        completedRuns.reduce((sum, r) => sum + r.durationMs, 0) / completedRuns.length
      )
    : 0;

  const STAT_CARDS = [
    {
      icon: <Hash size={20} />,
      label: "Total Runs",
      value: String(runs.length),
      description: "Inference runs saved this session.",
      accent: "cyan" as const,
    },
    {
      icon: <Zap size={20} />,
      label: "Avg Tok/s",
      value: completedRuns.length > 0 ? String(avgTps) : "—",
      description: "Average throughput across completed runs.",
      accent: "green" as const,
    },
    {
      icon: <Clock size={20} />,
      label: "Avg Duration",
      value: completedRuns.length > 0
        ? avgDuration < 1000 ? `${avgDuration}ms` : `${(avgDuration / 1000).toFixed(1)}s`
        : "—",
      description: "Mean inference duration across completed runs.",
      accent: "amber" as const,
    },
  ];

  return (
    <div className="space-y-8">

      <div className="stagger-1">
        <SectionHeader
          eyebrow="Run Inspector"
          title="Session History"
          description="Lightweight log of all inference runs this session. Select any run to inspect its full output, metrics, and error state. Persisted to localStorage."
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="green" dot>localStorage Backed</Badge>
              <Badge variant="default" className="font-mono">
                {runs.length} {runs.length === 1 ? "run" : "runs"}
              </Badge>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STAT_CARDS.map((s, i) => (
          <div key={s.label} className={`stagger-${i + 2}`}>
            <StatCard
              icon={s.icon}
              label={s.label}
              value={s.value}
              description={s.description}
              accent={s.accent}
            />
          </div>
        ))}
      </div>

      <div className="stagger-3">
        <SessionHistoryComponent
          runs={runs}
          selectedRunId={selectedRunId}
          selectedRun={selectedRun}
          onSelectRun={onSelectRun}
          onClearHistory={onClearHistory}
        />
      </div>

    </div>
  );
}
