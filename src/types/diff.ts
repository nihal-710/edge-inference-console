/**
 * diff.ts — Type definitions for the token-level diff engine.
 *
 * Design note:
 * DiffOperation covers the four possible edit operations in Wagner-Fischer.
 * "replace" is not a primitive edit (it is delete+insert) but we surface it
 * as a first-class operation during backtracking because it produces cleaner,
 * more readable UI output than separate delete+insert pairs for the same token.
 */

// ─── Core operation type ───────────────────────────────────────────────────────

export type DiffOperation = "equal" | "insert" | "delete" | "replace";

// ─── A single token in the diff result ────────────────────────────────────────

export interface DiffToken {
  text: string;
  operation: DiffOperation;
  // For "replace", the paired token from the other side
  replacedWith?: string;
  // Position in the original token array (useful for debugging)
  index: number;
}

// ─── One side of the diff (left = model A, right = model B) ───────────────────

export interface DiffSide {
  tokens: DiffToken[];
  modelName: string;
  rawText: string;
}

// ─── Full diff result ─────────────────────────────────────────────────────────

export interface DiffResult {
  left: DiffSide;
  right: DiffSide;
  stats: DiffStats;
}

// ─── Summary statistics ────────────────────────────────────────────────────────

export interface DiffStats {
  equalCount: number;
  insertedCount: number;
  deletedCount: number;
  replacedCount: number;
  totalTokensLeft: number;
  totalTokensRight: number;
  totalChanges: number;
  similarityScore: number; // 0.0 – 1.0
}

// ─── Input to the diff engine ─────────────────────────────────────────────────

export interface DiffInput {
  prompt: string;
  modelAName: string;
  modelAOutput: string;
  modelBName: string;
  modelBOutput: string;
}

// ─── Internal DP table cell ───────────────────────────────────────────────────
// Used inside tokenDiff.ts — not exported to UI components.

export interface DPCell {
  cost: number;
  // Which operation produced this cell (for backtracking)
  op: "equal" | "substitute" | "insert" | "delete" | "start";
}
