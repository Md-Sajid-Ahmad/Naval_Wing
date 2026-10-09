import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { CadetAvatar } from "@/components/CadetAvatar";
import { bn, RANK_BN, sortRanks } from "@/lib/bn";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "রিপোর্ট — BNCC Naval Wing" },
      {
        name: "description",
        content: "চিহ্নরার সারাংশ রিপোর্ট — দিরি নির্বাচন করলেই ক্যাডেটর উপস্থিতির হার, অনুপস্থিত ও ছুটির হিসেব দেখায়।",
      },
      { property: "og:title", content: "রিপোর্ট — BNCC Naval Wing" },
      { property: "og:description", content: "চিহ্ন থেকে ক্যাডেটর উপস্থিতির সারাংশ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const today = () => iso(new Date());
const monthStart = () => {
  const d = new Date();
  return iso(new Date(d.getFullYear(), d.getMonth(), 1));
};
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};

const RANGES = [
  { label: "এই মাস", from: monthStart, to: today },
  { label: "শেষ ৭ দিন", from: () => daysAgo(6), to: today },
  { label: "সব সময়", from: () => "2000-01-01", to: today },
] as const;

type Marks = { cadet_id: string; session_date: string; status: string };

/** বড় সময়সীমার রেকরডও যেন বাদ পড়রয় নাত — ১০০০র পাতা কেরে কেরে নোয়া হয়। */
async function fetchMarks(from: string, to: string): Promise<Marks[]> {
  const all: Marks[] = [];
  for (let page = 0; ; page += 1) {
    const { data, error } = await supabase
      .from("attendance")
      .select("cadet_id, session_date, status")
      .gte("session_date", from)
      .lte("session_date", to)
      .order("session_date", { ascending: true })
      .order("id", { ascending: true })
      .range(page * 1000, page * 1000 + 999);
    if (error) throw error;
    all.push(...data);
    if (data.length < 1000) break;
  }
  return all;
}

type Tally = { present: number; absent: number; excused: number; unreported: number };
const EMPTY: Tally = { present: 0, absent: 0, excused: 0, unreported: 0 };

function ReportsPage() {
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [sortBy, setSortBy] = useState<"name" | "rate">("name");

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
    queryKey: ["attendance-report", from, to],
    queryFn: () => fetchMarks(from, to),
    staleTime: 60_000,
  });

  const rows = useMemo(() => {
    const tally = new Map<string, Tally>();
    for (const m of marks) {
      const cur = tally.get(m.cadet_id) ?? { ...EMPTY };
      if (m.status === "present") cur.present += 1;
      else if (m.status === "absent") cur.absent += 1;
      else if (m.status === "excused") cur.excused += 1;
      else if (m.status === "unreported") cur.unreported += 1;
      tally.set(m.cadet_id, cur);
    }
    const list = cadets.map((c) => {
      const s = tally.get(c.id) ?? EMPTY;
      const total = s.present + s.absent + s.excused;
      return { ...c, ...s, total, rate: total ? Math.round((s.present / total) * 100) : 0 };
    });
    return sortBy === "rate"
      ? list.sort((a, b) => b.rate - a.rate || a.cadet_id.localeCompare(b.cadet_id))
      : list.sort((a, b) => a.cadet_id.localeCompare(b.cadet_id));
  }, [cadets, marks, sortBy]);

  const marked = marks.length;
  const presentTotal = marks.filter((m) => m.status === "present").length;
  const rate = marked ? Math.round((presentTotal / marked) * 100) : 0;
  const days = new Set(marks.map((m) => m.session_date)).size;
  const unmarked = rows.filter((r) => r.total === 0).length;

  const ranks = sortRanks(Array.from(new Set(cadets.map((c) => c.rank))));
  const byRank = ranks.map((r) => {
    const list = rows.filter((x) => x.rank === r);
    const total = list.reduce((n, x) => n + x.total, 0);
    const present = list.reduce((n, x) => n + x.present, 0);
    return { rank: r, cadets: list.length, rate: total ? Math.round((present / total) * 100) : 0 };
  });

  return (
    <AuthedShell>
      <div className="rise mb-4">
        <p className="label-mono">Muster Report</p>
        <h1 className="text-2xl font-extrabold tracking-tight">{t("রিপোর্ট")}</h1>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t("সময় বদল করলে সারাংশ আবার হিসেব হবো।")}
        </p>
      </div>

      <div className="rise mb-4 rounded-xl glass p-3">
        <div className="flex items-center gap-2">
          <label className="flex-1 rounded-lg bg-secondary px-2.5 py-1.5 ring-1 ring-border">
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              {t("থেক")}
            </span>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value || from)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <label className="flex-1 rounded-lg bg-secondary px-2.5 py-1.5 ring-1 ring-border">
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              {t("পর্যন্ত")}
            </span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value || to)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {RANGES.map((r) => {
            const active = from === r.from() && to === r.to();
            return (
              <button
                key={r.label}
                onClick={() => {
                  setFrom(r.from());
                  setTo(r.to());
                }}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors active:scale-[0.97] ${
                  active ? "bg-signal text-navy ring-signal" : "bg-secondary text-muted-foreground ring-border"
                }`}
              >
                {t(r.label)}
              </button>
            );
          })}
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            {bn(days)} {t("দিন")}
          </span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <Stat label={t("মোট ক্যাডেট")} value={bn(cadets.length)} />
        <Stat label={t("মোট চিহ্ন")} value={bn(marked)} />
        <Stat label={t("উপস্থিতির হার")} value={`${bn(rate)}%`} accent />
        <Stat label={t("চিহ্ন নাই")} value={bn(unmarked)} />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="label-mono">{t("ক্যাডেটর হিসেব")}</p>
        <div className="flex gap-1.5">
          {(["name", "rate"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors active:scale-[0.97] ${
                sortBy === s ? "bg-signal text-navy ring-signal" : "bg-secondary text-muted-foreground ring-border"
              }`}
            >
              {s === "name" ? t("নাম") : t("হার")}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-xl glass divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="px-3 py-2.5">
            <div className="flex items-center gap-3">
              <CadetAvatar path={r.photo_url} name={r.full_name} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{r.full_name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {r.cadet_id} · {RANK_BN[r.rank] ?? r.rank}
                </p>
              </div>
              <span className="font-mono text-sm font-bold text-signal">
                {r.total ? `${bn(r.rate)}%` : "—"}
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-signal" style={{ width: `${r.rate}%` }} />
            </div>
            <div className="mt-1.5 flex items-center gap-2.5 font-mono text-[10px] text-muted-foreground">
              <span className="text-signal">
                {t("উপস্থিত")} {bn(r.present)}
              </span>
              <span>
                {t("অনুপস্থিত")} {bn(r.absent)}
              </span>
              <span>
                {t("ছুটি")} {bn(r.excused)}
              </span>
              <span>
                {t("রিপোর্ট করে নাই")} {bn(r.unreported)}
              </span>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("কোনো তথ্য নেই।")}</p>
        )}
        {isFetching && <p className="px-3 py-2 text-center font-mono text-[10px] text-muted-foreground">…</p>}
      </div>

      <p className="label-mono mb-2">{t("Rank breakdown · র‍্যাংকভিত্তিক")}</p>
      <div className="overflow-hidden rounded-xl glass divide-y divide-border">
        {byRank.map((r) => (
          <div key={r.rank} className="flex items-center justify-between px-3 py-2.5">
            <span className="text-sm font-semibold">{RANK_BN[r.rank] ?? r.rank}</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {bn(r.cadets)} CADETS · {bn(r.rate)}%
            </span>
          </div>
        ))}
        {byRank.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("কোনো তথ্য নেই।")}</p>
        )}
      </div>
    </AuthedShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl glass p-3">
      <p className="label-mono">{label}</p>
      <p className={`mt-1 text-xl font-extrabold tracking-tight ${accent ? "text-signal" : ""}`}>{value}</p>
    </div>
  );
}
