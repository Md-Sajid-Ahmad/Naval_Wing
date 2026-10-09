import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { CadetAvatar } from "@/components/CadetAvatar";
import { bn, RANK_BN } from "@/lib/bn";
import { ABSENT_LIMIT } from "@/lib/muster";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "রিপোর্ট — BNCC Naval Wing" },
      {
        name: "description",
        content: "ক্যাডেটদের সক্রিয় ও নন-একটিভ তালিকা — ৩ ক্লাস অনুপস্থিত থাকলে ক্যাডেট নন-একটিভ তালিকায় চলে যায়।",
      },
      { property: "og:title", content: "রিপোর্ট — BNCC Naval Wing" },
      { property: "og:description", content: "সক্রিয় ও নন-একটিভ ক্যাডেটের তালিকা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

type Marks = { cadet_id: string; status: string };

/** সব উপস্থিতির রেকর্ড — ১০০০র পাতা কেরে কেরে নোয়া হয়। */
async function fetchMarks(): Promise<Marks[]> {
  const all: Marks[] = [];
  for (let page = 0; ; page += 1) {
    const { data, error } = await supabase
      .from("attendance")
      .select("cadet_id, status")
      .order("session_date", { ascending: true })
      .order("id", { ascending: true })
      .range(page * 1000, page * 1000 + 999);
    if (error) throw error;
    all.push(...data);
    if (data.length < 1000) break;
  }
  return all;
}

type Row = {
  id: string;
  cadet_id: string;
  full_name: string;
  rank: string;
  photo_url: string | null;
  present: number;
  absent: number;
  excused: number;
  unreported: number;
};

function ReportsPage() {
  const [view, setView] = useState<"active" | "inactive" | null>(null);

  const { data: cadets = [] } = useQuery({
    queryKey: ["cadets", "report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadets")
        .select("id, cadet_id, full_name, rank, status, photo_url")
        .order("cadet_id");
      if (error) throw error;
      return data;
    },
  });

  const { data: marks = [], isFetching } = useQuery({
    queryKey: ["attendance-report-all"],
    queryFn: fetchMarks,
    staleTime: 60_000,
  });

  const { active, inactive } = useMemo(() => {
    const tally = new Map<string, { present: number; absent: number; excused: number; unreported: number }>();
    for (const m of marks) {
      const cur = tally.get(m.cadet_id) ?? { present: 0, absent: 0, excused: 0, unreported: 0 };
      if (m.status === "present") cur.present += 1;
      else if (m.status === "absent") cur.absent += 1;
      else if (m.status === "excused") cur.excused += 1;
      else if (m.status === "unreported") cur.unreported += 1;
      tally.set(m.cadet_id, cur);
    }
    const rows: Row[] = cadets.map((c) => ({
      ...c,
      ...(tally.get(c.id) ?? { present: 0, absent: 0, excused: 0, unreported: 0 }),
    }));
    return {
      active: rows.filter((r) => r.absent < ABSENT_LIMIT),
      inactive: rows.filter((r) => r.absent >= ABSENT_LIMIT),
    };
  }, [cadets, marks]);

  const shown = view === "active" ? active : view === "inactive" ? inactive : [];

  return (
    <AuthedShell>
      <div className="rise mb-4">
        <p className="label-mono">Muster Report</p>
        <h1 className="text-2xl font-extrabold tracking-tight">{t("রিপোর্ট")}</h1>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t("৩ ক্লাস অনুপস্থিত থাকলে ক্যাডেট নন-একটিভ তালিকায় চলে যায়।")}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setView(view === "active" ? null : "active")}
          className={`rise rounded-xl p-4 text-left ring-1 transition-colors active:scale-[0.98] ${
            view === "active" ? "bg-signal text-navy ring-signal" : "glass ring-border"
          }`}
        >
          <p className="label-mono">{t("একটিভ")}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">{bn(active.length)}</p>
          <p className={`mt-1 text-[10px] ${view === "active" ? "text-navy/70" : "text-muted-foreground"}`}>
            {t("ক্যাডেট")}
          </p>
        </button>
        <button
          onClick={() => setView(view === "inactive" ? null : "inactive")}
          className={`rise rounded-xl p-4 text-left ring-1 transition-colors active:scale-[0.98] ${
            view === "inactive" ? "bg-signal text-navy ring-signal" : "glass ring-border"
          }`}
        >
          <p className="label-mono">{t("নন-একটিভ")}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">{bn(inactive.length)}</p>
          <p className={`mt-1 text-[10px] ${view === "inactive" ? "text-navy/70" : "text-muted-foreground"}`}>
            {t("ক্যাডেট")}
          </p>
        </button>
      </div>

      {view && (
        <>
          <p className="label-mono mb-2">
            {view === "active" ? t("একটিভ ক্যাডেট") : t("নন-একটিভ ক্যাডেট")} · {bn(shown.length)}
          </p>
          <div className="overflow-hidden rounded-xl glass divide-y divide-border">
            {shown.map((r) => (
              <Link
                key={r.id}
                to="/cadets/$cadetId"
                params={{ cadetId: r.id }}
                className="flex items-center gap-3 px-3 py-2.5 transition-colors active:bg-secondary"
              >
                <CadetAvatar path={r.photo_url} name={r.full_name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.full_name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {r.cadet_id} · {RANK_BN[r.rank] ?? r.rank}
                  </p>
                </div>
                <div className="text-right font-mono text-[10px] text-muted-foreground">
                  <p>
                    {t("উপস্থিত")} {bn(r.present)}
                  </p>
                  <p className={r.absent >= ABSENT_LIMIT ? "text-destructive" : ""}>
                    {t("অনুপস্থিত")} {bn(r.absent)}
                  </p>
                </div>
              </Link>
            ))}
            {shown.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("কোনো তথ্য নেই।")}</p>
            )}
            {isFetching && (
              <p className="px-3 py-2 text-center font-mono text-[10px] text-muted-foreground">…</p>
            )}
          </div>
        </>
      )}
    </AuthedShell>
  );
}
