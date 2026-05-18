/**
 * session.ts
 *
 * Types for the Session History / Run Inspector feature.
 * Kept separate from inference.ts to maintain clear domain boundaries.
 */

import type { InferenceStatus, InputMode } from "./inference";

// ─── A single completed (or failed/aborted) inference run ─────────────────────

export interface InferenceRun {
  id: string;
  timestamp: number;          // Unix ms — from Date.now()
  inputMode: InputMode;
  prompt: string;             // text prompt or audio label
  output: string;             // full or partial output
  status: InferenceStatus;    // completed | error | aborted
  tokenCount: number;
  tokensPerSecond: number;
  durationMs: number;
  errorMessage?: string;
}

// ─── What the hook exposes ─────────────────────────────────────────────────────

export interface SessionHistoryState {
  runs: InferenceRun[];
  selectedRunId: string | null;
  selectedRun: InferenceRun | null;
}

export interface SessionHistoryActions {
  addRun: (run: InferenceRun) => void;
  selectRun: (id: string | null) => void;
  clearHistory: () => void;
}
