// ─── Navigation ────────────────────────────────────────────────────────────────

export type AppPage = "playground" | "diff" | "history";

export interface NavItem {
  id: AppPage;
  label: string;
  shortLabel: string;
  description: string;
}

// ─── Inference State Machine ───────────────────────────────────────────────────

export type InferenceStatus =
  | "idle"
  | "connecting"
  | "streaming"
  | "completed"
  | "error"
  | "aborted";

export type InputMode = "text" | "audio";

// ─── Session / Run ─────────────────────────────────────────────────────────────

export interface InferenceRun {
  id: string;
  timestamp: number;
  inputMode: InputMode;
  prompt: string;
  output: string;
  status: InferenceStatus;
  tokenCount: number;
  durationMs: number;
  tokensPerSecond: number;
  errorMessage?: string;
}

// ─── Diff ──────────────────────────────────────────────────────────────────────

export type DiffOperation = "equal" | "insert" | "delete" | "replace";

export interface DiffToken {
  text: string;
  operation: DiffOperation;
}

export interface DiffResult {
  leftTokens: DiffToken[];
  rightTokens: DiffToken[];
  stats: DiffStats;
}

export interface DiffStats {
  equal: number;
  inserted: number;
  deleted: number;
  replaced: number;
  similarityScore: number; // 0–1
}

// ─── UI Primitives ─────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type BadgeVariant =
  | "default"
  | "cyan"
  | "green"
  | "amber"
  | "red"
  | "purple";

export type CardVariant = "default" | "raised" | "inset";