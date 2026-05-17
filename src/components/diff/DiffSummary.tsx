/**
 * DiffSummary.tsx
 *
 * Summary statistics panel for a diff result.
 * Shows equal/inserted/deleted/replaced counts, total changes, and similarity score.
 */

import { Equal, Plus, Minus, ArrowLeftRight, Hash, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import type { DiffStats } from "../../types/diff";

interface DiffSummaryProps {
  stats: DiffStats;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconClass: string;
  bgClass: string;
  borderClass: string;
  ariaLabel: string;
}

function StatItem({ icon, label, value, iconClass, bgClass, borderClass, ariaLabel }: StatItemProps) {
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "flex flex-col gap-2 p-4 rounded-xl border",
        bgClass, borderClass
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("shrink-0", iconClass)} aria-hidden="true">{icon}</span>
        <span className="text-xs font-mono text-text-muted uppercase tracking-widest text-right leading-tight">
          {label}
        </span>
      </div>
      <p className="text-2xl font-display font-bold text-text-primary leading-none">
        {value}
      </p>
    </div>
  );
}

export function DiffSummary({ stats }: DiffSummaryProps) {
  const similarityPct = Math.round(stats.similarityScore * 100);

  const similarityColor =
    similarityPct >= 80 ? "text-accent-green" :
    similarityPct >= 50 ? "text-accent-amber" :
    "text-accent-red";

  return (
    <div className="flex flex-col gap-4" aria-label="Diff summary statistics">

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatItem
          icon={<Equal size={16} />}
          label="Equal"
          value={stats.equalCount}
          iconClass="text-text-secondary"
          bgClass="bg-surface"
          borderClass="border-border"
          ariaLabel={`${stats.equalCount} equal tokens`}
        />
        <StatItem
          icon={<Plus size={16} />}
          label="Inserted"
          value={stats.insertedCount}
          iconClass="text-accent-green"
          bgClass="bg-accent-green/5"
          borderClass="border-accent-green/20"
          ariaLabel={`${stats.insertedCount} inserted tokens`}
        />
        <StatItem
          icon={<Minus size={16} />}
          label="Deleted"
          value={stats.deletedCount}
          iconClass="text-accent-red"
          bgClass="bg-accent-red/5"
          borderClass="border-accent-red/20"
          ariaLabel={`${stats.deletedCount} deleted tokens`}
        />
        <StatItem
          icon={<ArrowLeftRight size={16} />}
          label="Replaced"
          value={stats.replacedCount}
          iconClass="text-accent-amber"
          bgClass="bg-accent-amber/5"
          borderClass="border-accent-amber/20"
          ariaLabel={`${stats.replacedCount} replaced tokens`}
        />
        <StatItem
          icon={<Hash size={16} />}
          label="Changes"
          value={stats.totalChanges}
          iconClass="text-accent-purple"
          bgClass="bg-accent-purple/5"
          borderClass="border-accent-purple/20"
          ariaLabel={`${stats.totalChanges} total changes`}
        />
        <div
          aria-label={`Similarity score: ${similarityPct}%`}
          className="flex flex-col gap-2 p-4 rounded-xl border bg-surface border-border"
        >
          <div className="flex items-center justify-between">
            <TrendingUp size={16} className={cn("shrink-0", similarityColor)} aria-hidden="true" />
            <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
              Similar
            </span>
          </div>
          <p className={cn("text-2xl font-display font-bold leading-none", similarityColor)}>
            {similarityPct}%
          </p>
        </div>
      </div>

      {/* Token count row */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        <p className="text-xs font-mono text-text-muted">
          Model A: <span className="text-text-secondary">{stats.totalTokensLeft} tokens</span>
        </p>
        <span className="text-text-muted" aria-hidden="true">·</span>
        <p className="text-xs font-mono text-text-muted">
          Model B: <span className="text-text-secondary">{stats.totalTokensRight} tokens</span>
        </p>
        <span className="text-text-muted" aria-hidden="true">·</span>
        <p className="text-xs font-mono text-text-muted">
          Edit distance: <span className="text-text-secondary">{stats.totalChanges}</span>
        </p>
      </div>
    </div>
  );
}
