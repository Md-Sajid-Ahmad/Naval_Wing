import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { CadetAvatar } from "@/components/CadetAvatar";
import { bn, RANK_BN, RANKS } from "@/lib/bn";

export const Route = createFileRoute("/_authenticated/cadets/dismissed")({
  head: () => ({
    meta: [
      { title: "বহিষ্কার লিস্ট — BNCC Naval Wing" },
      {
        name: "description",
        content: "বহিষ্কৃত ক্যাডেটদের মোট, পুরুষ ও নারী বিভাজনে র‍্যাংকভিত্তিক তালিকা — Cadet, LCPL, CPL, SGT, CUO।",
      },
      { property: "og:title", content: "বহিষ্কার লিস্ট — BNCC Naval Wing" },
      { property: "og:description", content: "বহিষ্কৃত ক্যাডেটদের র‍্যাংকভিত্তিক তালিকা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DismissedListPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      তথ্য লোড করা যায়নি: {error.message}
    </div>
  ),
});

const GROUPS = [
  { key: "total", label: "Total Cadet", caption: "মোট ক্যাডেট" },
  { key: "male", label: "Male Cadet", caption: "পুরুষ ক্যাডেট" },
  { key: "female", label: "Female Cadet", caption: "নারী ক্যাডেট" },
] as const;

function DismissedListPage() {
  const [group, setGroup] = useState<(typeof GROUPS)[number]["key"]>("total");

  const { data: cadets = [] } = useQuery({
    queryKey: ["cadets-dismissed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadets")
        .select("id, cadet_id, full_name, rank, gender, photo_url, status")
        .eq("status", "inactive")
        .order("cadet_id");
      if (error) throw error;
      return data;
    },
  });

  const scoped = cadets.filter((c) => group === "total" || c.gender === group);

  return (
    <AuthedShell>
      <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ChevronLeft className="size-3.5" /> ড্যাশবোর্ড
      </Link>

      <div className="rise mb-4">
        <p className="label-mono">Dismissed List</p>
        <h1 className="text-2xl font-extrabold tracking-tight">বহিষ্কার লিস্ট</h1>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {GROUPS.map((g) => {
          const count = cadets.filter((c) => g.key === "total" || c.gender === g.key).length;
          const active = group === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setGroup(g.key)}
              className={`rounded-xl px-2 py-2.5 text-left ring-1 ${
                active ? "bg-signal/15 ring-signal/40" : "glass ring-border"
              }`}
            >
              <p className="label-mono truncate">{g.label}</p>
              <p className="mt-0.5 text-xl font-extrabold">{bn(count)}</p>
              <p className={`text-[11px] ${active ? "text-signal" : "text-muted-foreground"}`}>{g.caption}</p>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {RANKS.map((r) => {
          const list = scoped.filter((c) => c.rank === r);
          return (
            <div key={r} className="overflow-hidden rounded-xl glass">
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <span className="text-sm font-semibold">
                  {r} · {RANK_BN[r]}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{bn(list.length)} CADETS</span>
              </div>
              <div className="divide-y divide-border">
                {list.map((c) => (
                  <Link
                    key={c.id}
                    to="/cadets/$cadetId"
                    params={{ cadetId: c.id }}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <CadetAvatar path={c.photo_url} name={c.full_name} size={30} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.full_name}</p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">ID · {c.cadet_id}</p>
                    </div>
                  </Link>
                ))}
                {list.length === 0 && (
                  <p className="px-3 py-4 text-center text-xs text-muted-foreground">এই র‍্যাংকে কেউ নেই।</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AuthedShell>
  );
}
