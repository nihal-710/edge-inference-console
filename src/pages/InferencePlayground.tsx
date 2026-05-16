import React from "react";
import { Terminal, Zap } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export function InferencePlayground() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Part A"
        title="Inference Playground"
        description="Run token-by-token streaming inference against the mock on-device model engine."
        actions={
          <Badge variant="cyan" dot>
            Streaming Ready
          </Badge>
        }
      />

      {/* Placeholder content */}
      <Card>
        <CardBody className="py-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
            <Terminal size={24} className="text-accent-cyan" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-text-primary font-semibold font-mono">
              Playground coming in Phase 2–3
            </p>
            <p className="text-sm text-text-muted max-w-sm">
              Multi-modal input, streaming responses, live token metrics, and error handling will be built here.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="amber">
              <Zap size={11} aria-hidden="true" />
              Phase 2: Streaming Engine
            </Badge>
            <Badge variant="purple">Phase 3: Full UI</Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}