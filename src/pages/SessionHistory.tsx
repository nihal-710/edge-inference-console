import { History, Clock, Hash, Zap, Search } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { StatCard } from "../components/ui/StatCard";

const HISTORY_STATS = [
  {
    icon: <Hash size={20} />,
    label: "Total Runs",
    value: "0",
    description: "Inference runs completed this session.",
    accent: "cyan" as const,
  },
  {
    icon: <Zap size={20} />,
    label: "Avg Tokens/s",
    value: "—",
    description: "Average throughput across all completed runs.",
    accent: "green" as const,
  },
  {
    icon: <Clock size={20} />,
    label: "Avg Duration",
    value: "—",
    description: "Mean inference duration across completed runs.",
    accent: "amber" as const,
  },
];

export function SessionHistory() {
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
              <Button
                variant="ghost"
                size="sm"
                disabled
                leftIcon={<Search size={13} />}
              >
                Filter runs
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {HISTORY_STATS.map((s, i) => (
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
        <Card>
          <CardHeader>
            <History size={14} className="text-text-muted" aria-hidden="true" />
            <span className="text-xs font-mono font-semibold text-text-primary">Run Log</span>
            <Badge variant="default" className="ml-auto font-mono">0 runs</Badge>
          </CardHeader>
          <CardBody className="p-0">
            <EmptyState
              icon={<History size={22} />}
              title="No runs yet"
              description="Run inference in the Playground — each session will be logged here with input mode, token count, duration, and status."
              iconColor="green"
              meta={
                <>
                  <Badge variant="cyan">Input mode</Badge>
                  <Badge variant="amber">Token count</Badge>
                  <Badge variant="green">Duration</Badge>
                  <Badge variant="default">Status</Badge>
                </>
              }
            />
          </CardBody>
        </Card>
      </div>

      <div className="stagger-4">
        <Card variant="inset">
          <CardHeader>
            <span className="text-xs font-mono font-semibold text-text-secondary">
              Run Record Schema
            </span>
          </CardHeader>
          <CardBody>
            <pre className="text-xs font-mono text-text-secondary leading-relaxed overflow-x-auto">
{`interface InferenceRun {
  id:              string           // nanoid
  timestamp:       number           // Unix ms
  inputMode:       'text' | 'audio'
  prompt:          string
  output:          string           // partial on error
  status:          InferenceStatus
  tokenCount:      number
  durationMs:      number
  tokensPerSecond: number
  errorMessage?:   string
}`}
            </pre>
          </CardBody>
        </Card>
      </div>

    </div>
  );
}
