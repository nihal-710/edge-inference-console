/**
 * DiffView.tsx
 *
 * Orchestrates the full diff view:
 * 1. Input panel (prompt + model A/B text)
 * 2. On compare: run the DP diff algorithm
 * 3. Show DiffSummary stats
 * 4. Show DiffLegend
 * 5. Show side-by-side DiffRenderer panels
 *
 * State is kept local — no external store needed.
 */

import { useState } from "react";
import { GitCompare } from "lucide-react";
import { computeDiff } from "../../utils/tokenDiff";
import { DiffInputPanel } from "./DiffInputPanel";
import { DiffSummary } from "./DiffSummary";
import { DiffLegend } from "./DiffLegend";
import { DiffRenderer } from "./DiffRenderer";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { DiffInput, DiffResult } from "../../types/diff";

// ─── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE_INPUT: DiffInput = {
  prompt: "Explain what makes on-device AI inference different from cloud inference.",
  modelAName: "v1.0 — Baseline",
  modelAOutput: `On-device inference runs machine learning models directly on the user's device, such as a smartphone or laptop, without sending data to a remote server. This approach offers several key advantages: lower latency since there is no network round-trip, enhanced privacy because sensitive data never leaves the device, and offline functionality. However, on-device models must be smaller and more efficient, often using quantization techniques like INT8 or INT4 to reduce memory usage. The tradeoff is some loss in accuracy compared to large cloud-hosted models.`,
  modelBName: "v2.0 — Updated",
  modelBOutput: `On-device inference executes neural network models locally on the user's hardware, such as a mobile phone or edge computer, eliminating the need to transmit data to remote servers. This architecture provides significant benefits: minimal latency due to the absence of network overhead, strong privacy guarantees as personal data remains on-device, and robust offline capabilities. Nevertheless, on-device models require aggressive optimization, commonly employing quantization strategies such as INT4 or INT8 to minimize memory footprint. The inherent tradeoff involves a measurable reduction in model accuracy relative to large-scale cloud-deployed models.`,
};

const EMPTY_INPUT: DiffInput = {
  prompt: "",
  modelAName: "v1.0 — Baseline",
  modelAOutput: "",
  modelBName: "v2.0 — Updated",
  modelBOutput: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DiffView() {
  const [input, setInput]   = useState<DiffInput>(EMPTY_INPUT);
  const [result, setResult] = useState<DiffResult | null>(null);

  const handleCompare = () => {
    if (!input.modelAOutput.trim() || !input.modelBOutput.trim()) return;
    const diff = computeDiff(
      input.modelAOutput,
      input.modelBOutput,
      input.modelAName || "Model A",
      input.modelBName || "Model B"
    );
    setResult(diff);
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_INPUT);
    setResult(null);
  };

  const handleClear = () => {
    setInput(EMPTY_INPUT);
    setResult(null);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Input panel */}
      <Card>
        <CardHeader>
          <GitCompare size={14} className="text-accent-purple" aria-hidden="true" />
          <span className="text-xs font-mono font-semibold text-text-primary">
            Model Outputs
          </span>
          <Badge variant="purple" className="ml-auto">Token-level DP Diff</Badge>
        </CardHeader>
        <CardBody>
          <DiffInputPanel
            value={input}
            onChange={setInput}
            onCompare={handleCompare}
            onLoadSample={handleLoadSample}
            onClear={handleClear}
          />
        </CardBody>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Summary stats */}
          <Card>
            <CardHeader>
              <span className="text-xs font-mono font-semibold text-text-primary">
                Diff Summary
              </span>
              <Badge variant="green" className="ml-auto">
                {Math.round(result.stats.similarityScore * 100)}% similar
              </Badge>
            </CardHeader>
            <CardBody>
              <DiffSummary stats={result.stats} />
            </CardBody>
          </Card>

          {/* Legend */}
          <Card variant="inset">
            <CardBody className="py-3">
              <DiffLegend />
            </CardBody>
          </Card>

          {/* Side-by-side diff */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Left: Model A */}
            <Card>
              <CardHeader>
                <span className="w-2.5 h-2.5 rounded-full bg-text-muted shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono font-semibold text-text-primary">
                  {result.left.modelName}
                </span>
                <Badge variant="default" className="ml-auto font-mono">
                  {result.stats.totalTokensLeft} tokens
                </Badge>
              </CardHeader>
              <CardBody>
                <DiffRenderer
                  tokens={result.left.tokens}
                  modelName={result.left.modelName}
                  side="left"
                />
              </CardBody>
            </Card>

            {/* Right: Model B */}
            <Card>
              <CardHeader>
                <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono font-semibold text-text-primary">
                  {result.right.modelName}
                </span>
                <Badge variant="cyan" className="ml-auto font-mono">
                  {result.stats.totalTokensRight} tokens
                </Badge>
              </CardHeader>
              <CardBody>
                <DiffRenderer
                  tokens={result.right.tokens}
                  modelName={result.right.modelName}
                  side="right"
                />
              </CardBody>
            </Card>
          </div>

          {/* Algorithm callout */}
          <Card variant="inset">
            <CardHeader>
              <span className="text-xs font-mono font-semibold text-text-secondary">
                Algorithm — Wagner-Fischer Dynamic Programming
              </span>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <p className="text-xs font-mono font-semibold text-accent-cyan uppercase tracking-wider">
                    Approach
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Fills an (m+1) x (n+1) DP table where dp[i][j] is the minimum edit
                    cost to convert A[0..i-1] into B[0..j-1]. Backtracks from dp[m][n]
                    to reconstruct the exact edit sequence.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-mono font-semibold text-accent-amber uppercase tracking-wider">
                    Complexity
                  </p>
                  <div className="space-y-1.5">
                    <p className="text-sm text-text-secondary">
                      Time:{" "}
                      <code className="font-mono text-text-primary bg-surface-raised px-1.5 py-0.5 rounded text-xs">
                        O(m × n)
                      </code>
                    </p>
                    <p className="text-sm text-text-secondary">
                      Space:{" "}
                      <code className="font-mono text-text-primary bg-surface-raised px-1.5 py-0.5 rounded text-xs">
                        O(m × n)
                      </code>
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      m = tokens in A, n = tokens in B
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-mono font-semibold text-accent-green uppercase tracking-wider">
                    Why not LCS or Myers?
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    LCS only produces insert + delete, missing replace. Myers is
                    optimised for line-level code diffs with low edit distance.
                    Wagner-Fischer gives us replace as a first-class operation
                    and handles high token churn naturally.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}

    </div>
  );
}
