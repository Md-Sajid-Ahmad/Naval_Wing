import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { bn, RANK_BN, RANKS } from "@/lib/bn";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "রিপোর্ট — BNCC Naval Wing" },
      { name: "description", content: "র‍্যাংক ও উপস্থিতির সারাংশ রিপোর্ট — ক্যাডেট সংখ্যা ও উপস্থিতির হার।" },
      { property: "og:title", content: "রিপোর্ট — BNCC Naval Wing" },
      { property: "og:description", content: "র‍্যাংকভিত্তিক ক্যাডেট ও উপস্থিতির সারাংশ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data: cadets = [] } = useQuery({
    queryKey: ["cadets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cadets").select("id, rank, status");
      if (error) throw error;
      return data;
    },
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("status").limit(1000);
      if (error) throw error;
      return data;
    },
  });

  const ranks = RANKS.filter((r) => cadets.some((c) => c.rank === r));
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const rate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <AuthedShell>
      <div className="rise mb-4">
        <p className="label-mono">Summary Reports</p>
        <h1 className="text-2xl font-extrabold tracking-tight">রিপোর্ট</h1>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <Stat label="মোট ক্যাডেট" value={bn(cadets.length)} />
        <Stat label="সক্রিয়" value={bn(cadets.filter((c) => c.status === "active").length)} />
        <Stat label="মোট রেকর্ড" value={bn(attendance.length)} />
        <Stat label="উপস্থিতির হার" value={`${bn(rate)}%`} />
      </div>

      <p className="label-mono mb-2">Rank breakdown · র‍্যাংকভিত্তিক</p>
      <div className="overflow-hidden rounded-xl glass divide-y divide-border">
        {ranks.map((r) => (
          <div key={r} className="flex items-center justify-between px-3 py-2.5">
            <span className="text-sm font-semibold">
              {r} · {RANK_BN[r]}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {bn(cadets.filter((c) => c.rank === r).length)} CADETS
            </span>
          </div>
        ))}
        {ranks.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">কোনো তথ্য নেই।</p>
        )}
      </div>
    </AuthedShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl glass p-3">
      <p className="label-mono">{label}</p>
      <p className="mt-1 text-xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}
