import { Loader2, CheckCircle, AlertTriangle, StopCircle, Wifi } from "lucide-react";
import { cn } from "../../lib/utils";
import type { InferenceStatus } from "../../types/inference";

interface StatusBannerProps {
  status: InferenceStatus;
  tokenCount: number;
  tokensPerSecond: number;
  errorKind?: string;
}

interface BannerConfig {
  role: "status" | "alert";
  icon: React.ReactNode;
  message: string;
  className: string;
}

function getBannerConfig(
  status: InferenceStatus,
  tokenCount: number,
  tokensPerSecond: number,
  errorKind?: string
): BannerConfig | null {
  switch (status) {
    case "idle":
      return null;

    case "connecting":
      return {
        role: "status",
        icon: <Wifi size={13} className="animate-pulse" aria-hidden="true" />,
        message: "Connecting to inference engine...",
        className: "border-accent-amber/30 bg-accent-amber/5 text-accent-amber",
      };

    case "streaming":
      return {
        role: "status",
        icon: <Loader2 size={13} className="animate-spin" aria-hidden="true" />,
        message: `Streaming · ${tokenCount} tokens · ${tokensPerSecond} tok/s`,
        className: "border-accent-cyan/30 bg-accent-cyan/5 text-accent-cyan",
      };

    case "completed":
      return {
        role: "status",
        icon: <CheckCircle size={13} aria-hidden="true" />,
        message: `Completed · ${tokenCount} tokens · ${tokensPerSecond} tok/s`,
        className: "border-accent-green/30 bg-accent-green/5 text-accent-green",
      };

    case "aborted":
      return {
        role: "status",
        icon: <StopCircle size={13} aria-hidden="true" />,
        message: `Stopped · ${tokenCount} tokens received · Partial output preserved`,
        className: "border-accent-purple/30 bg-accent-purple/5 text-accent-purple",
      };

    case "error":
      return {
        role: "alert",
        icon: <AlertTriangle size={13} aria-hidden="true" />,
        message: errorKind
          ? `Error: ${errorKind.replace(/_/g, " ")} · Partial output preserved above`
          : "Stream error · Partial output preserved above",
        className: "border-accent-red/30 bg-accent-red/5 text-accent-red",
      };

    default:
      return null;
  }
}

export function StatusBanner({ status, tokenCount, tokensPerSecond, errorKind }: StatusBannerProps) {
  const config = getBannerConfig(status, tokenCount, tokensPerSecond, errorKind);
  if (!config) return null;

  return (
    <div
      role={config.role}
      aria-live={config.role === "alert" ? "assertive" : "polite"}
      aria-atomic="true"
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border",
        "text-xs font-mono transition-all duration-300",
        config.className
      )}
    >
      {config.icon}
      <span>{config.message}</span>
    </div>
  );
}
