import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { bn, bn2 } from "@/lib/bn";

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
      ডেটা লোড করা যায়নি: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm">কিছু পাওয়া যায়নি।</div>,
});


function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const cadets = await supabase.from("cadets").select("id, batch, rank, status").order("cadet_id");
      if (cadets.error) throw cadets.error;
      return { cadets: cadets.data };
    },
  });

  const cadets = data?.cadets ?? [];
  const classes = Array.from(new Set(cadets.map((c) => c.batch).filter(Boolean)));
  const ranks = Array.from(new Set(cadets.map((c) => c.rank).filter(Boolean)));
  const dismissed = cadets.filter((c) => c.status === "inactive").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "শুভ সকাল" : hour < 17 ? "শুভ অপরাহ্ন" : "শুভ সন্ধ্যা";

  return (
    <AuthedShell>
      <div className="rise mb-5 flex items-end justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground">{greeting}, কমান্ডার</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-balance">অপারেশন ড্যাশবোর্ড</h1>
        </div>
        <span className="text-right font-mono text-[10px] text-muted-foreground">
          {new Date().toISOString().slice(0, 10)}
          <br />
          {bn2(new Date().getHours())}:{bn2(new Date().getMinutes())} BD
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/cadets/breakdown" className="contents">
          <StatTile delay={120} label="Total Cadets" value={bn(cadets.length)} caption="মোট ক্যাডেট" />
        </Link>
        <StatTile delay={180} label="Class" value={bn(classes.length)} caption="ক্লাস/ব্যাচ" />
        <StatTile delay={240} label="Ranks" value={bn(ranks.length)} caption="র‍্যাংক" />
        <Link to="/cadets/dismissed" className="contents">
          <StatTile delay={300} label="Dismissed" value={bn(dismissed)} caption="বহিষ্কার লিস্ট" accent />
        </Link>
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
