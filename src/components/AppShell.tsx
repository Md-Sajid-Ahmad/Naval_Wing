import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, Users, CheckSquare, Mail, FileBarChart } from "lucide-react";

const TABS = [
  { to: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutGrid },
  { to: "/cadets", label: "ক্যাডেট", icon: Users },
  { to: "/attendance", label: "উপস্থিতি", icon: CheckSquare },
  { to: "/letters", label: "চিঠি", icon: Mail },
  { to: "/reports", label: "রিপোর্ট", icon: FileBarChart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-30 border-b border-border bg-navy/95 [transform:translateZ(0)]">
        <div className="mx-auto flex h-14 max-w-[430px] items-center justify-center px-4">
          <p className="font-mono text-sm font-extrabold uppercase tracking-[0.18em] text-paper">
            BNCC NAVAL WING DATA
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-28 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-border bg-navy/95 [transform:translateZ(0)]">
        <div className="grid h-16 grid-cols-5">
          {TABS.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors active:scale-[0.97]"
              activeProps={{ className: "text-signal" }}
            >
              <tab.icon className="size-4" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
