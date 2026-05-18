/**
 * App.tsx — Phase 5 update
 *
 * Session state is lifted to App level so:
 * - InferencePlayground can call addRun after each run
 * - SessionHistory page can read + interact with the same state
 *
 * PAGE_COMPONENTS becomes a render function so pages can receive props.
 */

import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { InferencePlayground } from "./pages/InferencePlayground";
import { DiffView } from "./pages/DiffView";
import { SessionHistory } from "./pages/SessionHistory";
import { useSessionHistory } from "./hooks/useSessionHistory";
import type { AppPage } from "./types";

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>("playground");

  const session = useSessionHistory();

  const renderPage = () => {
    switch (currentPage) {
      case "playground":
        return <InferencePlayground onRunComplete={session.addRun} />;
      case "diff":
        return <DiffView />;
      case "history":
        return (
          <SessionHistory
            runs={session.runs}
            selectedRunId={session.selectedRunId}
            selectedRun={session.selectedRun}
            onSelectRun={session.selectRun}
            onClearHistory={session.clearHistory}
          />
        );
    }
  };

  return (
    <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppShell>
  );
}
