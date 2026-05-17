/**
 * DiffView page — Part B
 *
 * Wraps the DiffView component with the page-level section header.
 */

import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/ui/StatCard";
import { DiffView as DiffViewComponent } from "../components/diff/DiffView";
import { Equal, Plus, Minus, ArrowLeftRight } from "lucide-react";

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
    description: "Tokens present in Model B that did not exist in Model A.",
    accent: "green" as const,
  },
  {
    icon: <Minus size={20} />,
    label: "Operation",
    value: "Delete",
    description: "Tokens in Model A that were removed in Model B.",
    accent: "red" as const,
  },
  {
    icon: <ArrowLeftRight size={20} />,
    label: "Operation",
    value: "Replace",
    description: "Direct token substitutions — tracked at word level.",
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
          description="Token-level side-by-side comparison between two model versions using a manual Wagner-Fischer dynamic programming algorithm. No external diff libraries."
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="purple" dot>
                Manual DP Algorithm
              </Badge>
              <Badge variant="cyan">Part B Complete</Badge>
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

      <div className="stagger-3">
        <DiffViewComponent />
      </div>
    </div>
  );
}
