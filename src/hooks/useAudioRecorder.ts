/**
 * useAudioRecorder.ts
 *
 * Manages the full MediaRecorder lifecycle:
 *   idle → requesting → recording → stopped → error
 *
 * Key decisions:
 * - Object URLs are always revoked on cleanup to prevent memory leaks.
 * - Permission errors are caught and exposed as a typed error state.
 * - Recording duration is tracked with a setInterval ticker.
 * - The recorded Blob is exposed so the caller can submit it for inference.
 * - Cleanup runs on unmount via useEffect return.
 */

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AudioRecorderStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "stopped"
  | "error";

export interface AudioRecorderError {
  kind: "permission_denied" | "not_supported" | "unknown";
  message: string;
}

export interface AudioRecorderState {
  status: AudioRecorderStatus;
  durationMs: number;
  audioURL: string | null;
  audioBlob: Blob | null;
  error: AudioRecorderError | null;
}

export interface AudioRecorderActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearRecording: () => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function getSupportedMimeType(): string {
  for (const mime of PREFERRED_MIME_TYPES) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return "";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAudioRecorder(): AudioRecorderState & AudioRecorderActions {
  const [state, setState] = useState<AudioRecorderState>({
    status: "idle",
    durationMs: 0,
    audioURL: null,
    audioBlob: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef     = useRef<number>(0);
  const currentURLRef    = useRef<string | null>(null);
  const isMountedRef     = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupResources();
    };
  }, []);

  // ─── Internal cleanup ────────────────────────────────────────────────────

  const cleanupResources = useCallback(() => {
    // Stop the ticker
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Stop all media tracks to release the microphone
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    // Stop the recorder if still active
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    mediaRecorderRef.current = null;
    // Revoke object URL to prevent memory leak
    if (currentURLRef.current) {
      URL.revokeObjectURL(currentURLRef.current);
      currentURLRef.current = null;
    }
    chunksRef.current = [];
  }, []);

  // ─── startRecording ──────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    // Check browser support
    if (typeof MediaRecorder === "undefined") {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: {
          kind: "not_supported",
          message: "MediaRecorder is not supported in this browser.",
        },
      }));
      return;
    }

    // Revoke any previous URL before starting fresh
    if (currentURLRef.current) {
      URL.revokeObjectURL(currentURLRef.current);
      currentURLRef.current = null;
    }
    chunksRef.current = [];

    setState((prev) => ({ ...prev, status: "requesting", error: null }));

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      if (!isMountedRef.current) return;
      const isDenied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");

      setState((prev) => ({
        ...prev,
        status: "error",
        error: {
          kind: isDenied ? "permission_denied" : "unknown",
          message: isDenied
            ? "Microphone access was denied. Allow microphone access in your browser settings and try again."
            : `Could not access microphone: ${err instanceof Error ? err.message : "Unknown error"}`,
        },
      }));
      return;
    }

    if (!isMountedRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    streamRef.current = stream;

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      if (!isMountedRef.current) return;

      const blob = new Blob(chunksRef.current, {
        type: mimeType || "audio/webm",
      });
      const url = URL.createObjectURL(blob);
      currentURLRef.current = url;

      setState((prev) => ({
        ...prev,
        status: "stopped",
        audioBlob: blob,
        audioURL: url,
      }));

      // Release microphone tracks
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    recorder.onerror = () => {
      if (!isMountedRef.current) return;
      setState((prev) => ({
        ...prev,
        status: "error",
        error: { kind: "unknown", message: "Recording failed unexpectedly." },
      }));
    };

    // Start recording — collect data every 250ms for smoother progress
    recorder.start(250);
    startTimeRef.current = Date.now();

    // Duration ticker
    timerRef.current = setInterval(() => {
      if (!isMountedRef.current) return;
      setState((prev) => ({
        ...prev,
        durationMs: Date.now() - startTimeRef.current,
      }));
    }, 100);

    setState((prev) => ({ ...prev, status: "recording", durationMs: 0 }));
  }, []);

  // ─── stopRecording ───────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ─── clearRecording ──────────────────────────────────────────────────────

  const clearRecording = useCallback(() => {
    cleanupResources();
    setState({
      status: "idle",
      durationMs: 0,
      audioURL: null,
      audioBlob: null,
      error: null,
    });
  }, [cleanupResources]);

  return {
    ...state,
    startRecording,
    stopRecording,
    clearRecording,
  };
}
