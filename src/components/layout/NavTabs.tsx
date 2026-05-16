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
  playground: <Terminal size={14} aria-hidden="true" />,
  diff:       <GitCompare size={14} aria-hidden="true" />,
  history:    <History size={14} aria-hidden="true" />,
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

  const handleKeyDown = (e: React.KeyboardEvent, id: AppPage) => {
    const ids = NAV_ITEMS.map((n) => n.id);
    const idx = ids.indexOf(id);
    let next: number | null = null;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (idx + 1) % ids.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (idx - 1 + ids.length) % ids.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = ids.length - 1;
    }

    if (next !== null) {
      e.preventDefault();
      onNavigate(ids[next]);
      tabRefs.current[ids[next]]?.focus();
    }
  };

  return (
    <nav aria-label="Main navigation">
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex items-end max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto gap-0"
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
              title={item.description}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3",
                "text-xs font-mono font-medium border-b-2 whitespace-nowrap",
                "transition-all duration-200 select-none",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-accent-cyan focus-visible:ring-inset focus-visible:rounded-sm",
                isActive
                  ? "border-accent-cyan text-accent-cyan"
                  : "border-transparent text-text-muted hover:text-text-secondary hover:border-border-strong"
              )}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-2 right-2 w-1 h-1 rounded-full bg-accent-cyan animate-pulse-dot"
                />
              )}
              {NAV_ICONS[item.id]}
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
