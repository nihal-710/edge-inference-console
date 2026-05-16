/**
 * useStreamingInference.ts
 *
 * React hook that owns the full inference lifecycle:
 *   idle → connecting → streaming → completed | error | aborted
 *
 * Key design decisions:
 * - AbortController is created fresh on every run() call.
 * - Partial output is ALWAYS preserved — never cleared on error or abort.
 * - Metrics (tokenCount, tokensPerSecond, elapsedMs) update on every token.
 * - useRef for mutable values that must not trigger re-renders (controller, timers).
 * - useCallback for stable function references.
 * - Cleanup in useEffect prevents stale state updates after unmount.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { createMockInferenceResponse } from "../services/mockInferenceService";
import { consumeInferenceStream, countTokens } from "../services/inferenceStream";
import type {
  InferenceState,
  InferenceActions,
  InferenceRequest,
  StreamError,
} from "../types/inference";

// ─── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_STATE: InferenceState = {
  status: "idle",
  output: "",
  tokenCount: 0,
  tokensPerSecond: 0,
  elapsedMs: 0,
  error: null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStreamingInference(): InferenceState & InferenceActions {
  const [state, setState] = useState<InferenceState>(INITIAL_STATE);

  // Refs — mutable values that must not cause re-renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const metricsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  // Track mount state to prevent setState after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    if (metricsIntervalRef.current !== null) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  // ─── Safe setState ────────────────────────────────────────────────────────

  const safeSetState = useCallback((updater: (prev: InferenceState) => InferenceState) => {
    if (isMountedRef.current) {
      setState(updater);
    }
  }, []);

  // ─── Metrics ticker ───────────────────────────────────────────────────────
  // Updates elapsedMs and tokensPerSecond every 100ms while streaming.
  // Uses a ref for tokenCount to avoid stale closure issues.

  const startMetricsTicker = useCallback(() => {
    startTimeRef.current = performance.now();
    tokenCountRef.current = 0;

    metricsIntervalRef.current = setInterval(() => {
      const elapsedMs = performance.now() - startTimeRef.current;
      const elapsedSec = elapsedMs / 1000;
      const tps = elapsedSec > 0 ? tokenCountRef.current / elapsedSec : 0;

      safeSetState((prev) => ({
        ...prev,
        elapsedMs: Math.round(elapsedMs),
        tokensPerSecond: Math.round(tps * 10) / 10,
      }));
    }, 100);
  }, [safeSetState]);

  const stopMetricsTicker = useCallback(() => {
    if (metricsIntervalRef.current !== null) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
  }, []);

  // ─── run() ────────────────────────────────────────────────────────────────

  const run = useCallback(
    async (request: Omit<InferenceRequest, "signal">) => {
      // Abort any in-flight stream before starting a new one
      cleanup();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Transition: idle → connecting
      safeSetState(() => ({
        ...INITIAL_STATE,
        status: "connecting",
      }));

      try {
        // ── Phase 1: Connect (simulated latency) ──────────────────────────
        const { response } = await createMockInferenceResponse({
          ...request,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        // ── Phase 2: Streaming ────────────────────────────────────────────
        safeSetState((prev) => ({ ...prev, status: "streaming" }));
        startMetricsTicker();

        await consumeInferenceStream(
          response,
          {
            // onToken: called for every decoded chunk
            onToken: (token: string) => {
              const newTokens = countTokens(token);
              tokenCountRef.current += newTokens;

              safeSetState((prev) => ({
                ...prev,
                output: prev.output + token,
                tokenCount: tokenCountRef.current,
              }));
            },

            // onComplete: stream closed cleanly
            onComplete: () => {
              stopMetricsTicker();
              const elapsedMs = Math.round(performance.now() - startTimeRef.current);
              const tps =
                elapsedMs > 0
                  ? Math.round((tokenCountRef.current / (elapsedMs / 1000)) * 10) / 10
                  : 0;

              safeSetState((prev) => ({
                ...prev,
                status: "completed",
                elapsedMs,
                tokensPerSecond: tps,
                error: null,
              }));
            },

            // onError: mid-stream failure — partial output is preserved
            onError: (error: StreamError) => {
              stopMetricsTicker();
              safeSetState((prev) => ({
                ...prev,
                status: "error",
                // Preserve whatever output was accumulated before the error
                output: prev.output || error.partialOutput,
                error,
              }));
            },
          },
          controller.signal
        );

        // If aborted during streaming (signal fired between read() calls)
        if (controller.signal.aborted) {
          stopMetricsTicker();
          safeSetState((prev) => ({
            ...prev,
            status: "aborted",
            // Partial output preserved — never cleared
          }));
        }
      } catch (err) {
        stopMetricsTicker();

        // AbortError from the connect phase (createMockInferenceResponse)
        if (err instanceof DOMException && err.name === "AbortError") {
          safeSetState((prev) => ({
            ...prev,
            status: "aborted",
          }));
          return;
        }

        safeSetState((prev) => ({
          ...prev,
          status: "error",
          error: {
            kind: "unknown",
            message: err instanceof Error ? err.message : "Unknown error",
            partialOutput: prev.output,
          },
        }));
      }
    },
    [cleanup, startMetricsTicker, stopMetricsTicker, safeSetState]
  );

  // ─── stop() ───────────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    stopMetricsTicker();
    safeSetState((prev) => ({
      ...prev,
      status: "aborted",
      // Partial output preserved
    }));
  }, [stopMetricsTicker, safeSetState]);

  // ─── retry() ──────────────────────────────────────────────────────────────
  // Exposed so Phase 3 UI can wire a retry button.
  // Stores last request in a ref for re-use.

  const lastRequestRef = useRef<Omit<InferenceRequest, "signal"> | null>(null);

  const runWithMemory = useCallback(
    (request: Omit<InferenceRequest, "signal">) => {
      lastRequestRef.current = request;
      run(request);
    },
    [run]
  );

  const retry = useCallback(() => {
    if (lastRequestRef.current) {
      run(lastRequestRef.current);
    }
  }, [run]);

  // ─── reset() ──────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    cleanup();
    setState(INITIAL_STATE);
    tokenCountRef.current = 0;
  }, [cleanup]);

  return {
    ...state,
    run: runWithMemory,
    stop,
    retry,
    reset,
  };
}
