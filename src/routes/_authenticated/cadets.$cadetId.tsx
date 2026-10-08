import { createFileRoute, Link } from "@tanstack/react-router";
import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { bn, RANK_BN, STATUS_BN } from "@/lib/bn";
import { CadetAvatar } from "@/components/CadetAvatar";

export const Route = createFileRoute("/_authenticated/cadets/$cadetId")({
  head: () => ({
    meta: [
      { title: "ক্যাডেট প্রোফাইল — BNCC Naval Wing" },
      { name: "description", content: "একজন ক্যাডেটের বিস্তারিত তথ্য ও সাম্প্রতিক উপস্থিতির রেকর্ড দেখুন।" },
      { property: "og:title", content: "ক্যাডেট প্রোফাইল — BNCC Naval Wing" },
      { property: "og:description", content: "ক্যাডেটের বিস্তারিত তথ্য ও উপস্থিতির রেকর্ড।" },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CadetDetail,
});

function CadetDetail() {
  const { cadetId } = Route.useParams();

  const { data: cadet } = useQuery({
    queryKey: ["cadet", cadetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadets")
        .select("*")
        .eq("id", cadetId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: records = [] } = useQuery({
    queryKey: ["cadet-attendance", cadetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("id, session_date, status")
        .eq("cadet_id", cadetId)
        .order("session_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  return (
    <AuthedShell>
      <Link to="/cadets" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ChevronLeft className="size-3.5" /> {t("ক্যাডেট তালিকা")}
      </Link>

      {!cadet ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("লোড হচ্ছে…")}</p>
      ) : (
        <>
          <div className="rise mb-4 flex items-center gap-3 rounded-2xl glass p-4">
            <CadetAvatar path={cadet.photo_url} name={cadet.full_name} size={56} rounded="rounded-xl" />
            <div className="min-w-0">
              <p className="label-mono">ID · {cadet.cadet_id}</p>
              <h1 className="truncate text-xl font-extrabold tracking-tight">{cadet.full_name}</h1>
              <p className="text-xs text-muted-foreground">
                {RANK_BN[cadet.rank] ?? cadet.rank}
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <Info label={t("ব্যাচ")} value={cadet.batch ? bn(cadet.batch) : "—"} />
            <Info label={t("স্ট্যাটাস")} value={STATUS_BN[cadet.status] ?? cadet.status} />
            <Info label={t("ফোন")} value={cadet.phone ? bn(cadet.phone) : "—"} />
            <Info label={t("যোগদান")} value={cadet.joined_on ? bn(cadet.joined_on) : "—"} />
          </div>

          <p className="label-mono mb-2">{t("Recent attendance · সাম্প্রতিক উপস্থিতি")}</p>
          <div className="overflow-hidden rounded-xl glass divide-y divide-border">
            {records.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2.5">
                <span className="font-mono text-[11px] text-muted-foreground">{bn(r.session_date)}</span>
                <span className="text-xs font-semibold">{STATUS_BN[r.status] ?? r.status}</span>
              </div>
            ))}
            {records.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("কোনো রেকর্ড নেই।")}</p>
            )}
          </div>
        </>
      )}
    </AuthedShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl glass p-3">
      <p className="label-mono">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
