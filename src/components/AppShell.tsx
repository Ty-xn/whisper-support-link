import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { quickExit } from "@/lib/safety";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/support", label: "Find Support" },
  { to: "/journal", label: "Journal" },
  { to: "/plan", label: "Plan" },
  { to: "/pathways", label: "Pathways" },
  { to: "/learn", label: "Learn" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-[560px] items-center justify-between px-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold text-foreground">SafePath</span>
            <span className="eyebrow">Support &amp; Prevention</span>
          </Link>
          <button
            type="button"
            onClick={quickExit}
            className="min-h-11 rounded-full border border-border px-4 text-sm font-semibold text-clay"
          >
            Quick exit
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[560px] px-4 pb-28 pt-6">{children}</main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm"
      >
        <ul className="mx-auto flex w-full max-w-[560px] items-stretch">
          {NAV.map((item) => (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-brand-deep font-semibold" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex min-h-14 flex-col items-center justify-center px-1 text-[11px] leading-tight"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
