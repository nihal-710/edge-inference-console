/**
 * AudioInputPanel.tsx
 *
 * Audio recording UI using the useAudioRecorder hook.
 *
 * States handled:
 *   idle       → "Start Recording" button
 *   requesting → "Requesting permission…" spinner
 *   recording  → animated waveform + duration + "Stop" button
 *   stopped    → audio preview player + "Re-record" + "Use Recording" actions
 *   error      → permission denied / not supported messages with retry
 *
 * Accessibility:
 * - All buttons have explicit aria-label
 * - role="status" on recording status
 * - role="alert" on error state
 * - Audio element has accessible label
 * - Duration announced via aria-live
 */

import { Mic, MicOff, Square, RotateCcw, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";

interface AudioInputPanelProps {
  onAudioReady: (blob: Blob) => void;
  disabled?: boolean;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Animated recording bars — purely decorative
function RecordingWaveform() {
  return (
    <div
      className="flex items-end gap-0.5 h-6"
      aria-hidden="true"
    >
      {[3, 5, 8, 6, 4, 7, 5, 9, 6, 4, 8, 5, 3].map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-accent-red animate-pulse-dot"
          style={{
            height: `${h * 2}px`,
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function AudioInputPanel({ onAudioReady, disabled = false }: AudioInputPanelProps) {
  const recorder = useAudioRecorder();

  const handleUseRecording = () => {
    if (recorder.audioBlob) {
      onAudioReady(recorder.audioBlob);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Idle ─────────────────────────────────────────────────────── */}
      {recorder.status === "idle" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full border-2 border-border bg-surface flex items-center justify-center">
            <Mic size={24} className="text-text-muted" aria-hidden="true" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-mono text-text-primary">No recording yet</p>
            <p className="text-xs text-text-muted">
              Click below to start recording your audio prompt
            </p>
          </div>
          <button
            onClick={recorder.startRecording}
            disabled={disabled}
            aria-label="Start audio recording"
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg",
              "border border-accent-red/40 bg-accent-red/10 text-accent-red",
              "text-sm font-mono font-medium",
              "transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red",
              disabled
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-accent-red/20 hover:border-accent-red cursor-pointer"
            )}
          >
            <Mic size={15} aria-hidden="true" />
            Start Recording
          </button>
        </div>
      )}

      {/* ── Requesting permission ─────────────────────────────────────── */}
      {recorder.status === "requesting" && (
        <div
          role="status"
          aria-label="Requesting microphone permission"
          className="flex flex-col items-center gap-3 py-8"
        >
          <Loader2 size={28} className="text-accent-amber animate-spin" aria-hidden="true" />
          <p className="text-sm font-mono text-accent-amber">
            Requesting microphone access…
          </p>
          <p className="text-xs text-text-muted text-center">
            A permission dialog should appear in your browser.
          </p>
        </div>
      )}

      {/* ── Recording ──────────────────────────────────────────────────── */}
      {recorder.status === "recording" && (
        <div
          role="status"
          aria-label={`Recording in progress, duration ${formatDuration(recorder.durationMs)}`}
          className="flex flex-col items-center gap-4 py-6"
        >
          {/* Animated waveform */}
          <div className="flex flex-col items-center gap-3">
            <RecordingWaveform />
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full bg-accent-red animate-pulse"
                aria-hidden="true"
              />
              <span className="text-sm font-mono text-accent-red font-semibold">
                REC
              </span>
            </div>
          </div>

          {/* Duration */}
          <p
            className="text-3xl font-display font-bold text-text-primary tracking-tight"
            aria-live="polite"
            aria-label={`Recording duration: ${formatDuration(recorder.durationMs)}`}
          >
            {formatDuration(recorder.durationMs)}
          </p>

          {/* Stop button */}
          <button
            onClick={recorder.stopRecording}
            aria-label="Stop recording"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg
              border border-border bg-surface text-text-primary
              text-sm font-mono font-medium
              hover:border-border-strong hover:bg-surface-raised
              transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
          >
            <Square size={14} aria-hidden="true" />
            Stop Recording
          </button>
        </div>
      )}

      {/* ── Stopped — preview + actions ───────────────────────────────── */}
      {recorder.status === "stopped" && recorder.audioURL && (
        <div className="flex flex-col gap-4">
          {/* Recording info */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-accent-green/20 bg-accent-green/5">
            <CheckCircle size={13} className="text-accent-green shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-accent-green">
              Recording captured — {formatDuration(recorder.durationMs)}
            </span>
          </div>

          {/* Audio preview player */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-mono text-text-muted uppercase tracking-wider">
              Preview
            </p>
            <audio
              src={recorder.audioURL}
              controls
              aria-label="Recorded audio preview"
              className="w-full h-10 rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={recorder.clearRecording}
              aria-label="Discard recording and record again"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                border border-border bg-surface text-text-secondary
                text-xs font-mono font-medium
                hover:border-border-strong hover:text-text-primary hover:bg-surface-raised
                transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
            >
              <RotateCcw size={13} aria-hidden="true" />
              Re-record
            </button>
            <button
              onClick={handleUseRecording}
              disabled={disabled}
              aria-label="Use this recording for inference"
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
                "border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
                "text-xs font-mono font-medium",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan",
                disabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-accent-cyan/20 hover:border-accent-cyan cursor-pointer"
              )}
            >
              <CheckCircle size={13} aria-hidden="true" />
              Use Recording
            </button>
          </div>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {recorder.status === "error" && recorder.error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col gap-3 py-4"
        >
          <div className="flex flex-col gap-2 px-4 py-3 rounded-lg border border-accent-red/30 bg-accent-red/10">
            <div className="flex items-center gap-2">
              {recorder.error.kind === "permission_denied" ? (
                <MicOff size={15} className="text-accent-red shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle size={15} className="text-accent-red shrink-0" aria-hidden="true" />
              )}
              <span className="text-xs font-mono font-semibold text-accent-red uppercase tracking-wider">
                {recorder.error.kind === "permission_denied"
                  ? "Microphone Access Denied"
                  : recorder.error.kind === "not_supported"
                  ? "Not Supported"
                  : "Recording Error"}
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {recorder.error.message}
            </p>
            {recorder.error.kind === "permission_denied" && (
              <p className="text-xs text-text-muted">
                To fix: click the camera/mic icon in your browser address bar and allow microphone access, then try again.
              </p>
            )}
          </div>

          <button
            onClick={recorder.clearRecording}
            aria-label="Try recording again"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
              border border-border bg-surface text-text-secondary
              text-xs font-mono font-medium
              hover:border-border-strong hover:text-text-primary
              transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
          >
            <RotateCcw size={13} aria-hidden="true" />
            Try Again
          </button>
        </div>
      )}

    </div>
  );
}
