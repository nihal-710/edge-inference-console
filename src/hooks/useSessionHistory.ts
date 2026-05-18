/**
 * useSessionHistory.ts
 *
 * Manages the list of past inference runs.
 *
 * Design decisions:
 * - localStorage for persistence across page refreshes.
 * - Capped at MAX_RUNS to prevent unbounded growth.
 * - Newest runs first (unshift, not push).
 * - useCallback for stable function references.
 * - Try/catch around localStorage to handle private browsing or quota errors.
 * - No external state library — plain useState is sufficient.
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import type {
  InferenceRun,
  SessionHistoryState,
  SessionHistoryActions,
} from "../types/session";

const STORAGE_KEY = "edge-inference-run-history";
const MAX_RUNS    = 50;

// ─── localStorage helpers ──────────────────────────────────────────────────────

function loadFromStorage(): InferenceRun[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as InferenceRun[];
  } catch {
    return [];
  }
}

function saveToStorage(runs: InferenceRun[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  } catch {
    // Quota exceeded or private browsing — fail silently
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSessionHistory(): SessionHistoryState & SessionHistoryActions {
  const [runs, setRuns] = useState<InferenceRun[]>(loadFromStorage);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  // Persist to localStorage whenever runs change
  useEffect(() => {
    saveToStorage(runs);
  }, [runs]);

  const addRun = useCallback((run: InferenceRun) => {
    setRuns((prev) => {
      const updated = [run, ...prev].slice(0, MAX_RUNS);
      return updated;
    });
    // Auto-select the new run so the inspector shows it immediately
    setSelectedRunId(run.id);
  }, []);

  const selectRun = useCallback((id: string | null) => {
    setSelectedRunId(id);
  }, []);

  const clearHistory = useCallback(() => {
    setRuns([]);
    setSelectedRunId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const selectedRun = useMemo(
    () => runs.find((r) => r.id === selectedRunId) ?? null,
    [runs, selectedRunId]
  );

  return { runs, selectedRunId, selectedRun, addRun, selectRun, clearHistory };
}
