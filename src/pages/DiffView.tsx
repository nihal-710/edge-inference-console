import { GitCompare, Minus, Plus, Equal, ArrowLeftRight } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { StatCard } from "../components/ui/StatCard";

const DIFF_STATS = [
  {
    icon: <Equal size={20} />,
    label: "Operation",
    value: "Equal",
    description: "Tokens shared between both model outputs, unchanged.",
    accent: "blue" as const,
  },
  {
    icon: <Plus size={20} />,
    label: "Operation",
    value: "Insert",
    description: "Tokens present in the new model output but not the baseline.",
    accent: "green" as const,
  },
  {
    icon: <Minus size={20} />,
    label: "Operation",
    value: "Delete",
    description: "Tokens removed from the baseline that the new model dropped.",
    accent: "red" as const,
  },
  {
    icon: <GitCompare size={20} />,
    label: "Operation",
    value: "Replace",
    description: "Token substitutions tracked at the individual word level.",
    accent: "amber" as const,
  },
];

export function DiffView() {
  return (
    <div className="space-y-8">

      <div className="stagger-1">
        <SectionHeader
          eyebrow="Part B — Token Diff Engine"
          title="Model Output Diff View"
          description="Side-by-side token-level comparison between two model versions on identical prompts. Built with a manual dynamic-programming edit-distance algorithm — no external diff libraries."
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="purple" dot>Manual DP Algorithm</Badge>
              <Badge variant="default">Phase 4</Badge>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {DIFF_STATS.map((s, i) => (
          <div key={s.value} className={`stagger-${i + 2}`}>
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

      <div className="stagger-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <span className="w-2 h-2 rounded-full bg-text-muted shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono font-semibold text-text-primary">
              Model A — Baseline
            </span>
            <Badge variant="default" className="ml-auto">v1.0</Badge>
          </CardHeader>
          <CardBody>
            <EmptyState
              icon={<Minus size={22} />}
              title="Baseline output"
              description="Paste or run baseline model output. Token-level diff highlighting will appear here."
              iconColor="amber"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <span className="w-2 h-2 rounded-full bg-accent-cyan shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono font-semibold text-text-primary">
              Model B — Updated
            </span>
            <Badge variant="cyan" className="ml-auto">v2.0</Badge>
          </CardHeader>
          <CardBody>
            <EmptyState
              icon={<Plus size={22} />}
              title="Updated output"
              description="Paste or run the new model output. Insertions, deletions, and replacements will be highlighted."
              iconColor="green"
            />
          </CardBody>
        </Card>
      </div>

      <div className="stagger-4">
        <Card variant="inset">
          <CardHeader>
            <ArrowLeftRight size={14} className="text-text-muted" aria-hidden="true" />
            <span className="text-xs font-mono font-semibold text-text-secondary">
              Algorithm — Dynamic Programming Edit Distance
            </span>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <p className="text-xs font-mono font-semibold text-accent-cyan uppercase tracking-wider">
                  Approach
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Wagner-Fischer DP over token arrays. Fills an (m+1) x (n+1) cost matrix
                  bottom-up, then backtracks to produce the minimal edit sequence.
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-mono font-semibold text-accent-amber uppercase tracking-wider">
                  Complexity
                </p>
                <div className="space-y-1">
                  <p className="text-sm text-text-secondary">
                    Time:{" "}
                    <code className="font-mono text-text-primary bg-surface-raised px-1.5 py-0.5 rounded text-xs">
                      O(m x n)
                    </code>
                  </p>
                  <p className="text-sm text-text-secondary">
                    Space:{" "}
                    <code className="font-mono text-text-primary bg-surface-raised px-1.5 py-0.5 rounded text-xs">
                      O(m x n)
                    </code>
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-mono font-semibold text-accent-green uppercase tracking-wider">
                  Why not LCS or Myers?
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  LCS misses replacements. Myers is optimal for line diffs but adds complexity
                  for token-level replace tracking. DP gives full edit classification in one pass.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

    </div>
  );
}
