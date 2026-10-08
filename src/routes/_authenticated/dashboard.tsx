import { createFileRoute } from "@tanstack/react-router";
import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { bn, bn2 } from "@/lib/bn";
import { errorMessage } from "@/lib/error-message";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "অপারেশন ড্যাশবোর্ড — BNCC Naval Wing" },
      {
        name: "description",
        content: "ক্যাডেট সংখ্যা, আজকের উপস্থিতি, অপেক্ষমাণ চিঠি ও সরঞ্জামের সংক্ষিপ্ত চিত্র এক নজরে।",
      },
      { property: "og:title", content: "অপারেশন ড্যাশবোর্ড — BNCC Naval Wing" },
      { property: "og:description", content: "ক্যাডেট, উপস্থিতি ও কার্যক্রমের সংক্ষিপ্ত চিত্র এক নজরে।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {t("ডেটা লোড করা যায়নি:")} {errorMessage(error)}
    </div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm">{t("কিছু পাওয়া যায়নি।")}</div>,
});

const today = () => new Date().toISOString().slice(0, 10);

function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [cadets, attendance] = await Promise.all([
        supabase.from("cadets").select("id, full_name, cadet_id, rank, status").order("cadet_id"),
        supabase.from("attendance").select("cadet_id, status").eq("session_date", today()),
      ]);
      if (cadets.error) throw cadets.error;
      if (attendance.error) throw attendance.error;
      return { cadets: cadets.data, attendance: attendance.data };
    },
  });

  const cadets = data?.cadets ?? [];
  const active = cadets.filter((c) => c.status === "active");
  const present = (data?.attendance ?? []).filter((a) => a.status === "present").length;
  const rate = active.length ? Math.round((present / active.length) * 100) : 0;
  const ranks = Array.from(new Set(cadets.map((c) => c.rank))).sort();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("শুভ সকাল") : hour < 17 ? t("শুভ অপরাহ্ন") : t("শুভ সন্ধ্যা");

  return (
    <AuthedShell>
      <div className="rise mb-5 flex items-end justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground">{greeting}{t(", কমান্ডার")}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-balance">{t("অপারেশন ড্যাশবোর্ড")}</h1>
        </div>
        <span className="text-right font-mono text-[10px] text-muted-foreground">
          {new Date().toISOString().slice(0, 10)}
          <br />
          {bn2(new Date().getHours())}:{bn2(new Date().getMinutes())} BD
        </span>
      </div>

      <LanguageSwitch />

      <div className="rise relative mb-5 overflow-hidden rounded-2xl glass p-4" style={{ animationDelay: "60ms" }}>
        <div className="sweep pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-foreground/10" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-signal">{t("Today · আজকের সর্বমোট")}</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight">{bn(present)}</p>
            <p className="text-xs text-muted-foreground">{t("জন ক্যাডেট উপস্থিত")}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-muted-foreground">ATTENDANCE</p>
            <p className="text-lg font-bold text-signal">{bn(rate)}%</p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatTile delay={120} label="Total Cadets" value={bn(cadets.length)} caption={t("মোট ক্যাডেট")} />
        <StatTile delay={180} label="Attendance" value={bn(present)} caption={t("আজ উপস্থিত")} accent />
        <StatTile delay={240} label="Active" value={bn(active.length)} caption={t("সক্রিয় ক্যাডেট")} />
        <StatTile delay={300} label="Ranks" value={bn(ranks.length)} caption={t("র‍্যাংক")} />
      </div>

    </AuthedShell>
  );
}

function StatTile({
  label,
  value,
  caption,
  delay,
  accent,
}: {
  label: string;
  value: string;
  caption: string;
  delay: number;
  accent?: boolean;
}) {
  return (
    <div className="rise rounded-xl glass p-3" style={{ animationDelay: `${delay}ms` }}>
      <p className="label-mono">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
      <p className={`text-[11px] ${accent ? "text-signal" : "text-muted-foreground"}`}>{caption}</p>
    </div>
  );
}
