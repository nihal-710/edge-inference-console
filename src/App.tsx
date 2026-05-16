import React, { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { InferencePlayground } from "./pages/InferencePlayground";
import { DiffView } from "./pages/DiffView";
import { SessionHistory } from "./pages/SessionHistory";
import type { AppPage } from "./types";

const PAGE_COMPONENTS: Record<AppPage, React.ReactNode> = {
  playground: <InferencePlayground />,
  diff: <DiffView />,
  history: <SessionHistory />,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>("playground");

  return (
    <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
      {PAGE_COMPONENTS[currentPage]}
    </AppShell>
  );
}