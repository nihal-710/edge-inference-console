import React from "react";
import { History } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export function SessionHistory() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Run Inspector"
        title="Session History"
        description="Lightweight log of past inference runs. Select any run to inspect its full output."
        actions={
          <Badge variant="green" dot>
            localStorage Backed
          </Badge>
        }
      />

      <Card>
        <CardBody className="py-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
            <History size={24} className="text-accent-green" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-text-primary font-semibold font-mono">
              No runs yet
            </p>
            <p className="text-sm text-text-muted max-w-sm">
              Run inference in the Playground — sessions will appear here automatically with input mode, token count, duration, and status.
            </p>
          </div>
          <Badge variant="default">Phase 5: Session History</Badge>
        </CardBody>
      </Card>
    </div>
  );
}