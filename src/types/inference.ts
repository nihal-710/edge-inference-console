// ─── Inference State Machine ───────────────────────────────────────────────────

export type InputMode = "text" | "audio";

export type InferenceStatus =
  | "idle"
  | "connecting"
  | "streaming"
  | "completed"
  | "error"
  | "aborted";

// ─── Failure simulation modes ──────────────────────────────────────────────────

export type FailureMode = "none" | "network_drop" | "timeout";

// ─── Service layer contract ────────────────────────────────────────────────────
// This interface is what the real API call must also satisfy.
// Replacing mock with real: swap createMockInferenceResponse() only.

export interface InferenceRequest {
  prompt: string;
  inputMode: "text" | "audio";
  failureMode?: FailureMode;
  signal?: AbortSignal;
}

export interface InferenceResponse {
  // A real Response whose .body is a ReadableStream<Uint8Array>
  // Consumers always call response.body.getReader()
  response: Response;
}

// ─── Stream reader callbacks ───────────────────────────────────────────────────

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError: (error: StreamError) => void;
}

// ─── Error types ──────────────────────────────────────────────────────────────

export type StreamErrorKind =
  | "network_drop"
  | "timeout"
  | "abort"
  | "decode_error"
  | "unknown";

export interface StreamError {
  kind: StreamErrorKind;
  message: string;
  // Partial output accumulated before the error
  partialOutput: string;
}

// ─── Hook state ───────────────────────────────────────────────────────────────

export interface InferenceState {
  status: InferenceStatus;
  output: string;
  tokenCount: number;
  tokensPerSecond: number;
  elapsedMs: number;
  error: StreamError | null;
}

export interface InferenceActions {
  run: (request: Omit<InferenceRequest, "signal">) => void;
  stop: () => void;
  retry: () => void;
  reset: () => void;
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export interface LiveMetrics {
  tokenCount: number;
  tokensPerSecond: number;
  elapsedMs: number;
}

// ─── Session run record ────────────────────────────────────────────────────────

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
