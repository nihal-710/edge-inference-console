import React from "react";
import { Cpu } from "lucide-react";
import { NavTabs } from "./NavTabs";
import { Badge } from "../ui/Badge";
import type { AppPage } from "../../types";

interface AppShellProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  children: React.ReactNode;
}

export function AppShell({ currentPage, onNavigate, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas bg-grid flex flex-col">

      <a href="#main-content" className="sr-only focus:not-sr-only fixed top-3 left-3 z-50 px-4 py-2 bg-accent-cyan text-canvas text-sm font-mono rounded-md">
        Skip to main content
      </a>

      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-40" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center" aria-hidden="true">
              <Cpu size={16} className="text-accent-cyan" />
            </div>
            <div>
              <p className="text-xs font-mono text-text-muted uppercase tracking-widest leading-none">
                Edge AI
              </p>
              <h1 className="text-sm font-semibold font-mono text-text-primary leading-tight">
                Inference Console
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="green" dot>Mock API Active</Badge>
            <Badge variant="default" className="hidden sm:inline-flex">v0.1.0</Badge>
          </div>

        </div>
      </header>

      <NavTabs currentPage={currentPage} onNavigate={onNavigate} />

      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 outline-none"
      >
        <div role="tabpanel" aria-labelledby={`tab-${currentPage}`} className="animate-fade-in">
          {children}
        </div>
      </main>

      <footer className="border-t border-border bg-surface/50 py-3" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <p className="text-xs font-mono text-text-muted">Edge Inference Developer Console</p>
          <p className="text-xs font-mono text-text-muted">No backend · Browser-native streaming</p>
        </div>
      </footer>

    </div>
  );
}