/**
 * DiffInputPanel.tsx
 *
 * Input form for the diff view.
 * Collects: prompt, model A name + output, model B name + output.
 * Accessible: all inputs labelled, fieldsets for logical grouping.
 */

import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { GitCompare, Trash2, Beaker } from "lucide-react";
import type { DiffInput } from "../../types/diff";

interface DiffInputPanelProps {
  value: DiffInput;
  onChange: (value: DiffInput) => void;
  onCompare: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  disabled?: boolean;
}

const inputClass = cn(
  "w-full rounded-lg border border-border bg-canvas/60 px-3 py-2",
  "text-sm font-mono text-text-primary placeholder:text-text-muted",
  "transition-colors duration-150",
  "focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan"
);

const textareaClass = cn(
  inputClass,
  "resize-none leading-relaxed"
);

export function DiffInputPanel({
  value, onChange, onCompare, onLoadSample, onClear, disabled,
}: DiffInputPanelProps) {
  const update = (field: keyof DiffInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onChange({ ...value, [field]: e.target.value });

  const canCompare =
    value.modelAOutput.trim().length > 0 &&
    value.modelBOutput.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">

      {/* Prompt */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="diff-prompt" className="text-xs font-mono text-text-muted uppercase tracking-wider">
          Prompt (optional — for reference)
        </label>
        <input
          id="diff-prompt"
          type="text"
          value={value.prompt}
          onChange={update("prompt")}
          placeholder="What prompt produced these outputs?"
          className={inputClass}
          aria-label="Prompt that produced the model outputs"
        />
      </div>

      {/* Two-column model inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Model A */}
        <fieldset className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-surface">
          <legend className="sr-only">Model A — Baseline output</legend>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-text-muted shrink-0" aria-hidden="true" />
            <label htmlFor="model-a-name" className="text-xs font-mono font-semibold text-text-primary">
              Model A — Baseline
            </label>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="model-a-name" className="text-xs font-mono text-text-muted uppercase tracking-wider">
              Version name
            </label>
            <input
              id="model-a-name"
              type="text"
              value={value.modelAName}
              onChange={update("modelAName")}
              placeholder="e.g. v1.0-baseline"
              className={inputClass}
              aria-label="Model A version name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="model-a-output" className="text-xs font-mono text-text-muted uppercase tracking-wider">
              Output
            </label>
            <textarea
              id="model-a-output"
              value={value.modelAOutput}
              onChange={update("modelAOutput")}
              placeholder="Paste baseline model output here..."
              rows={8}
              className={textareaClass}
              aria-label="Model A baseline output text"
              aria-required="true"
            />
          </div>
        </fieldset>

        {/* Model B */}
        <fieldset className="flex flex-col gap-3 p-4 rounded-xl border border-accent-cyan/20 bg-surface">
          <legend className="sr-only">Model B — Updated output</legend>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan shrink-0" aria-hidden="true" />
            <label htmlFor="model-b-name" className="text-xs font-mono font-semibold text-text-primary">
              Model B — Updated
            </label>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="model-b-name" className="text-xs font-mono text-text-muted uppercase tracking-wider">
              Version name
            </label>
            <input
              id="model-b-name"
              type="text"
              value={value.modelBName}
              onChange={update("modelBName")}
              placeholder="e.g. v2.0-updated"
              className={inputClass}
              aria-label="Model B version name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="model-b-output" className="text-xs font-mono text-text-muted uppercase tracking-wider">
              Output
            </label>
            <textarea
              id="model-b-output"
              value={value.modelBOutput}
              onChange={update("modelBOutput")}
              placeholder="Paste updated model output here..."
              rows={8}
              className={textareaClass}
              aria-label="Model B updated output text"
              aria-required="true"
            />
          </div>
        </fieldset>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={onCompare}
          disabled={!canCompare || disabled}
          leftIcon={<GitCompare size={14} />}
          aria-label="Run token-level diff comparison"
        >
          Compare Outputs
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onLoadSample}
          disabled={disabled}
          leftIcon={<Beaker size={14} />}
          aria-label="Load sample model outputs for demonstration"
        >
          Load Sample
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={onClear}
          leftIcon={<Trash2 size={14} />}
          aria-label="Clear all inputs and results"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
