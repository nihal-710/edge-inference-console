// ─── Navigation ────────────────────────────────────────────────────────────────

export type AppPage = "playground" | "diff" | "history";

export interface NavItem {
  id: AppPage;
  label: string;
  shortLabel: string;
  description: string;
}

// ─── Re-export inference types so components can import from either location ───
export type {
  InferenceStatus,
  InputMode,
  InferenceRun,
  FailureMode,
  InferenceState,
  InferenceActions,
  InferenceRequest,
  StreamError,
  StreamErrorKind,
  LiveMetrics,
} from "./inference";

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
  similarityScore: number;
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
