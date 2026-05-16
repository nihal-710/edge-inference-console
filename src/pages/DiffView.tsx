import React from "react";
import { GitCompare } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export function DiffView() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Part B"
        title="Model Output Diff View"
        description="Token-level side-by-side comparison between two model version outputs on the same prompt."
        actions={
          <Badge variant="purple" dot>
            Manual Diff Algorithm
          </Badge>
        }
      />

      <Card>
        <CardBody className="py-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
            <GitCompare size={24} className="text-accent-purple" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-text-primary font-semibold font-mono">
              Diff View coming in Phase 4
            </p>
            <p className="text-sm text-text-muted max-w-sm">
              Token-level diffing with DP edit distance, insert/delete/replace highlighting, and similarity scores.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="purple">Phase 4: Diff Engine</Badge>
            <Badge variant="default">No external diff libraries</Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}