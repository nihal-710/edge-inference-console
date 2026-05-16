import React, { useRef } from "react";
import { Terminal, GitCompare, History } from "lucide-react";
import { cn } from "../../lib/utils";
import type { AppPage, NavItem } from "../../types";

const NAV_ITEMS: NavItem[] = [
  {
    id: "playground",
    label: "Inference Playground",
    shortLabel: "Playground",
    description: "Run and stream model inference",
  },
  {
    id: "diff",
    label: "Model Output Diff",
    shortLabel: "Diff View",
    description: "Compare outputs between model versions",
  },
  {
    id: "history",
    label: "Session History",
    shortLabel: "History",
    description: "Inspect past inference runs",
  },
];

const NAV_ICONS: Record<AppPage, React.ReactNode> = {
  playground: <Terminal size={15} aria-hidden="true" />,
  diff:       <GitCompare size={15} aria-hidden="true" />,
  history:    <History size={15} aria-hidden="true" />,
};

interface NavTabsProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function NavTabs({ currentPage, onNavigate }: NavTabsProps) {
  const tabRefs = useRef<Record<AppPage, HTMLButtonElement | null>>({
    playground: null,
    diff: null,
    history: null,
  });

  // Arrow-key navigation between tabs (WCAG tablist pattern)
  const handleKeyDown = (e: React.KeyboardEvent, id: AppPage) => {
    const ids = NAV_ITEMS.map((n) => n.id);
    const currentIndex = ids.indexOf(id);

    let nextIndex: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % ids.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + ids.length) % ids.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = ids.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextId = ids[nextIndex];
      onNavigate(nextId);
      tabRefs.current[nextId]?.focus();
    }
  };

  return (
    <nav aria-label="Main navigation" className="border-b border-border bg-surface-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          role="tablist"
          aria-orientation="horizontal"
          className="flex items-end gap-0 -mb-px overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                ref={(el) => { tabRefs.current[item.id] = el; }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${item.id}`}
                id={`tab-${item.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onNavigate(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-mono",
                  "border-b-2 transition-all duration-150 whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-inset",
                  isActive
                    ? "border-accent-cyan text-accent-cyan bg-accent-cyan/5"
                    : "border-transparent text-text-muted hover:text-text-secondary hover:border-border-strong"
                )}
              >
                {NAV_ICONS[item.id]}
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}