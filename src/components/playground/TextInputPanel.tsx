/**
 * TextInputPanel.tsx
 *
 * Prompt textarea with:
 * - Labelled input (htmlFor + id)
 * - Character count
 * - Ctrl/Cmd+Enter shortcut
 * - Sample prompt quick-fill buttons
 * - Disabled state while streaming
 * - Visible focus ring
 */

import { useRef } from "react";
import { FileText } from "lucide-react";
import { cn } from "../../lib/utils";

interface TextInputPanelProps {
  prompt: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const SAMPLE_PROMPTS = [
  "Explain how on-device inference works and what makes it different from cloud inference.",
  "Describe the ReadableStream API and how it enables token-by-token rendering in the browser.",
  "What are the tradeoffs of quantizing a language model to INT4 for edge deployment?",
];

const MAX_CHARS = 1000;

export function TextInputPanel({
  prompt,
  onChange,
  onSubmit,
  disabled = false,
}: TextInputPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (prompt.trim() && !disabled) onSubmit();
    }
  };

  const handleSampleClick = (p: string) => {
    onChange(p);
    textareaRef.current?.focus();
  };

  const remaining = MAX_CHARS - prompt.length;
  const isOverLimit = remaining < 0;

  return (
    <div className="flex flex-col gap-4">

      {/* Prompt textarea */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="prompt-textarea"
            className="text-xs font-mono text-text-muted uppercase tracking-wider"
          >
            Prompt
          </label>
          <span
            className={cn(
              "text-xs font-mono",
              isOverLimit ? "text-accent-red" : "text-text-muted"
            )}
            aria-live="polite"
            aria-label={`${remaining} characters remaining`}
          >
            {remaining}
          </span>
        </div>

        <textarea
          id="prompt-textarea"
          ref={textareaRef}
          value={prompt}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Enter your prompt here…"
          rows={7}
          aria-label="Inference prompt"
          aria-describedby="prompt-hint"
          aria-invalid={isOverLimit}
          className={cn(
            "w-full rounded-lg border bg-canvas/60 px-3 py-2.5",
            "text-sm font-mono text-text-primary placeholder:text-text-muted",
            "resize-none leading-relaxed",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-1",
            isOverLimit
              ? "border-accent-red focus:border-accent-red focus:ring-accent-red"
              : "border-border focus:border-accent-cyan focus:ring-accent-cyan",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <p id="prompt-hint" className="text-xs text-text-muted">
          Ctrl+Enter to run
        </p>
      </div>

      {/* Sample prompts */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <FileText size={11} className="text-text-muted" aria-hidden="true" />
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider">
            Sample prompts
          </p>
        </div>
        <div
          className="flex flex-col gap-1.5"
          role="list"
          aria-label="Sample prompts"
        >
          {SAMPLE_PROMPTS.map((p, i) => (
            <button
              key={i}
              role="listitem"
              onClick={() => handleSampleClick(p)}
              disabled={disabled}
              aria-label={`Use sample prompt: ${p}`}
              className={cn(
                "text-left text-xs text-text-secondary px-2.5 py-2 rounded",
                "border border-border bg-transparent",
                "transition-all duration-150 font-sans leading-relaxed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan",
                disabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:text-text-primary hover:border-border-strong hover:bg-surface-raised cursor-pointer"
              )}
            >
              {p.length > 85 ? p.slice(0, 85) + "…" : p}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
