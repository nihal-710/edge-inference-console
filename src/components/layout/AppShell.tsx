import React from "react";
import { Cpu, ExternalLink } from "lucide-react";
import { NavTabs } from "./NavTabs";
import { Badge } from "../ui/Badge";
import { StatusDot } from "../ui/StatusDot";
import type { AppPage } from "../../types";

interface AppShellProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  children: React.ReactNode;
}

export function AppShell({ currentPage, onNavigate, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas bg-grid flex flex-col">

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed top-3 left-3 z-50 px-4 py-2 bg-accent-cyan text-canvas text-sm font-mono font-semibold rounded-md"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className="border-b border-border bg-surface/70 backdrop-blur-md sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 border border-accent-cyan/25 flex items-center justify-center">
                <Cpu size={17} className="text-accent-cyan" aria-hidden="true" />
              </div>
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-green border-2 border-canvas"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-display font-bold text-text-primary tracking-tight leading-none">
                  Edge Inference Console
                </h1>
                <Badge variant="amber" className="hidden sm:inline-flex shrink-0">
                  Frontend Assignment Prototype
                </Badge>
              </div>
              <p className="text-xs text-text-muted font-sans mt-0.5 leading-none truncate hidden sm:block">
                Browser-based playground for on-device AI evaluation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-canvas/50">
              <StatusDot label="Mock inference API active" />
              <span className="text-xs font-mono text-text-secondary">Mock API</span>
            </div>
            <Badge variant="default" className="font-mono">v0.1.0</Badge>
          </div>

        </div>

        <NavTabs currentPage={currentPage} onNavigate={onNavigate} />
      </header>

      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 outline-none"
      >
        <div
          role="tabpanel"
          aria-labelledby={`tab-${currentPage}`}
          className="animate-fade-in"
        >
          {children}
        </div>
      </main>

      <footer
        role="contentinfo"
        className="border-t border-border bg-surface/40 py-4"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-text-muted" aria-hidden="true" />
            <p className="text-xs font-mono text-text-muted">
              Edge Inference Developer Console
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs font-mono text-text-muted">
              No backend · Browser-native · ReadableStream
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub, opens in new tab"
              className="text-xs font-mono text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1"
            >
              GitHub
              <ExternalLink size={10} aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
