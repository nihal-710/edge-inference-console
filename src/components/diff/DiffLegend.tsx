/**
 * DiffLegend.tsx
 *
 * Visual legend for diff token highlighting.
 * Uses both colour AND a text symbol so colour is never the only signal.
 * WCAG 2.1 SC 1.4.1 (Use of Color) compliant.
 */

import type { DiffOperation } from "../../types/diff";

interface LegendItem {
  operation: DiffOperation;
  label: string;
  symbol: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  ariaLabel: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  {
    operation: "equal",
    label: "Equal",
    symbol: "=",
    bgClass: "bg-transparent",
    textClass: "text-text-primary",
    borderClass: "border-border",
    ariaLabel: "Equal — token unchanged in both outputs",
  },
  {
    operation: "delete",
    label: "Deleted",
    symbol: "−",
    bgClass: "bg-accent-red/10",
    textClass: "text-accent-red",
    borderClass: "border-accent-red/30",
    ariaLabel: "Deleted — token present in baseline but removed in updated",
  },
  {
    operation: "insert",
    label: "Inserted",
    symbol: "+",
    bgClass: "bg-accent-green/10",
    textClass: "text-accent-green",
    borderClass: "border-accent-green/30",
    ariaLabel: "Inserted — token absent in baseline but added in updated",
  },
  {
    operation: "replace",
    label: "Replaced",
    symbol: "~",
    bgClass: "bg-accent-amber/10",
    textClass: "text-accent-amber",
    borderClass: "border-accent-amber/30",
    ariaLabel: "Replaced — token substituted with a different token",
  },
];

export function DiffLegend() {
  return (
    <div
      role="list"
      aria-label="Diff token legend"
      className="flex flex-wrap items-center gap-3"
    >
      <span className="text-xs font-mono text-text-muted uppercase tracking-wider mr-1">
        Legend:
      </span>
      {LEGEND_ITEMS.map((item) => (
        <div
          key={item.operation}
          role="listitem"
          aria-label={item.ariaLabel}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono
            ${item.bgClass} ${item.textClass} ${item.borderClass}`}
        >
          <span aria-hidden="true" className="font-bold w-3 text-center">
            {item.symbol}
          </span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
