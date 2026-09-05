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
      <header className="sticky top-0 z-30 border-b border-border bg-navy/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[430px] items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg glass">
              <span className="font-mono text-[10px] tracking-widest text-signal">BN</span>
            </div>
            <div className="leading-tight">
              <p className="label-mono">BNCC · Naval Wing</p>
              <p className="text-sm font-extrabold tracking-tight">ব্রিজ কনসোল</p>
            </div>
          </div>
          <span className="rounded-full bg-signal/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-signal ring-1 ring-signal/30">
            সকলের জন্য উন্মুক্ত
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[430px] px-4 pb-28 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-border bg-navy/80 backdrop-blur-xl">
        <div className="grid h-16 grid-cols-5">
          {TABS.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
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
