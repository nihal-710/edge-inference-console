/**
 * DiffRenderer.tsx
 *
 * Renders one side of the token-level diff (left or right).
 *
 * Accessibility:
 * - Each changed token has an aria-label describing the operation.
 * - Non-colour indicators: prefix symbols (−, +, ~) on changed tokens.
 * - role="mark" is used for highlighted spans (semantic highlighting).
 * - The output region has an accessible name.
 *
 * Token rendering:
 * - equal:   plain text, no highlight
 * - delete:  red background, strikethrough, "−" prefix
 * - insert:  green background, underline, "+" prefix
 * - replace: amber background, "~" prefix, tooltip showing original
 */

import { cn } from "../../lib/utils";
import type { DiffToken, DiffOperation } from "../../types/diff";

interface DiffRendererProps {
  tokens: DiffToken[];
  modelName: string;
  side: "left" | "right";
}

// ─── Token style map ───────────────────────────────────────────────────────────

interface TokenStyle {
  className: string;
  symbol: string;
  ariaPrefix: string;
}

function getTokenStyle(op: DiffOperation, side: "left" | "right"): TokenStyle {
  switch (op) {
    case "equal":
      return { className: "text-text-primary", symbol: "", ariaPrefix: "" };

    case "delete":
      // Only appears on left side
      return {
        className: cn(
          "bg-accent-red/20 text-accent-red",
          "rounded px-0.5 line-through",
          "outline outline-1 outline-accent-red/30"
        ),
        symbol: "−",
        ariaPrefix: "deleted: ",
      };

    case "insert":
      // Only appears on right side
      return {
        className: cn(
          "bg-accent-green/20 text-accent-green",
          "rounded px-0.5 underline underline-offset-2",
          "outline outline-1 outline-accent-green/30"
        ),
        symbol: "+",
        ariaPrefix: "inserted: ",
      };

    case "replace":
      return {
        className: cn(
          "bg-accent-amber/20 text-accent-amber",
          "rounded px-0.5",
          "outline outline-1 outline-accent-amber/30"
        ),
        symbol: "~",
        ariaPrefix: side === "left" ? "replaced: " : "replacement: ",
      };
  }
}

// ─── Single token ──────────────────────────────────────────────────────────────

interface TokenChipProps {
  token: DiffToken;
  side: "left" | "right";
}

function TokenChip({ token, side }: TokenChipProps) {
  const { className, symbol, ariaPrefix } = getTokenStyle(token.operation, side);
  const isChanged = token.operation !== "equal";

  const ariaLabel = isChanged
    ? `${ariaPrefix}${token.text.trim()}${
        token.replacedWith ? ` (replaced with: ${token.replacedWith.trim()})` : ""
      }`
    : undefined;

  if (!isChanged) {
    // Equal tokens: plain inline text, no wrapper overhead
    return <span>{token.text}</span>;
  }

  return (
    <mark
      className={cn("not-italic", className)}
      aria-label={ariaLabel}
      title={
        token.replacedWith
          ? `${side === "left" ? "Replaced with" : "Replaces"}: ${token.replacedWith.trim()}`
          : undefined
      }
    >
      {/* Non-colour symbol indicator — visually hidden from layout but present for AT */}
      <span aria-hidden="true" className="text-xs opacity-70 mr-0.5 font-bold">
        {symbol}
      </span>
      {token.text}
    </mark>
  );
}

// ─── Main renderer ─────────────────────────────────────────────────────────────

export function DiffRenderer({ tokens, modelName, side }: DiffRendererProps) {
  if (tokens.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full min-h-[200px] text-text-muted text-sm font-mono"
        aria-label={`${modelName} output — empty`}
      >
        (empty output)
      </div>
    );
  }

  return (
    <div
      aria-label={`${modelName} diff output`}
      className={cn(
        "rounded-lg border bg-canvas/60 p-4",
        "font-mono text-sm leading-loose",
        "min-h-[200px] overflow-y-auto",
        side === "left" ? "border-border" : "border-accent-cyan/20"
      )}
    >
      {tokens.map((token) => (
        <TokenChip key={`${side}-${token.index}-${token.text}`} token={token} side={side} />
      ))}
    </div>
  );
}
