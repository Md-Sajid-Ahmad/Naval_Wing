import { createFileRoute, Link } from "@tanstack/react-router";
import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { bn } from "@/lib/bn";
import { errorMessage } from "@/lib/error-message";
import { CalendarDays, Clock, Radio } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "প্রোগ্রাম আপডেট — BNCC Naval Wing" },
      {
        name: "description",
        content: "চলমান ও আসন্ন প্রোগ্রাম এবং কত সময় বাকি — এক নজরে।",
      },
      { property: "og:title", content: "প্রোগ্রাম আপডেট — BNCC Naval Wing" },
      { property: "og:description", content: "চলমান ও আসন্ন প্রোগ্রামের সর্বশেষ আপডেট।" },
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

type Program = {
  id: string;
  name: string;
  description: string | null;
  program_date: string;
  program_time: string | null;
};

function daysUntil(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date(today() + "T00:00:00");
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

function countdown(p: Program): string {
  const days = daysUntil(p.program_date);
  if (days > 1) return `${bn(days)} ${t("দিন বাকি")}`;
  if (days === 1) return t("আগামীকাল");
  // today
  if (p.program_time) {
    const [h, m] = p.program_time.split(":").map(Number);
    const target = new Date();
    target.setHours(h ?? 0, m ?? 0, 0, 0);
    const diffMin = Math.round((target.getTime() - Date.now()) / 60000);
    if (diffMin > 60) return `${bn(Math.floor(diffMin / 60))} ${t("ঘণ্টা বাকি")}`;
    if (diffMin > 0) return `${bn(diffMin)} ${t("মিনিট বাকি")}`;
    return t("এখন চলছে");
  }
  return t("আজ");
}

function fmtTime(time: string | null) {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  const hour = h ?? 0;
  const ampm = hour < 12 ? "AM" : "PM";
  const hr = hour % 12 === 0 ? 12 : hour % 12;
  return `${bn(hr)}:${bn(String(m ?? 0).padStart(2, "0"))} ${ampm}`;
}

function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard-programs"],
    queryFn: async () => {
      const res = await supabase
        .from("programs")
        .select("id, name, description, program_date, program_time")
        .gte("program_date", today())
        .order("program_date", { ascending: true })
        .order("program_time", { ascending: true });
      if (res.error) throw res.error;
      return res.data as Program[];
    },
    refetchInterval: 60000,
  });

  const programs = data ?? [];
  const running = programs.filter((p) => p.program_date === today());
  const upcoming = programs.filter((p) => p.program_date > today());

  return (
    <AuthedShell>
      <div className="rise mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-balance">{t("প্রোগ্রাম আপডেট")}</h1>
        <p className="text-[13px] text-muted-foreground">{t("চলমান ও আসন্ন প্রোগ্রামের সর্বশেষ খবর")}</p>
      </div>

      <LanguageSwitch />

      <section className="rise mb-6" style={{ animationDelay: "60ms" }}>
        <div className="mb-2 flex items-center gap-2">
          <Radio className="h-4 w-4 text-signal" />
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
            {t("চলমান প্রোগ্রাম")} · {bn(running.length)}
          </h2>
        </div>
        {running.length === 0 ? (
          <p className="rounded-xl glass p-4 text-sm text-muted-foreground">{t("আজ কোনো প্রোগ্রাম নেই")}</p>
        ) : (
          <div className="space-y-2">
            {running.map((p) => (
              <ProgramCard key={p.id} program={p} live />
            ))}
          </div>
        )}
      </section>

      <section className="rise" style={{ animationDelay: "120ms" }}>
        <div className="mb-2 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {t("আসন্ন প্রোগ্রাম")} · {bn(upcoming.length)}
          </h2>
        </div>
        {upcoming.length === 0 ? (
          <p className="rounded-xl glass p-4 text-sm text-muted-foreground">{t("কোনো আসন্ন প্রোগ্রাম নেই")}</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        )}
      </section>
    </AuthedShell>
  );
}

function ProgramCard({ program, live }: { program: Program; live?: boolean }) {
  return (
    <Link
      to="/programs/$programId"
      params={{ programId: program.id }}
      className="block rounded-xl glass p-4 transition-colors hover:bg-foreground/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold">{program.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {bn(program.program_date)}
            {program.program_time && (
              <>
                <Clock className="ml-1 h-3 w-3" />
                {fmtTime(program.program_time)}
              </>
            )}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${
            live ? "bg-signal text-primary-foreground" : "bg-foreground/10 text-muted-foreground"
          }`}
        >
          {countdown(program)}
        </span>
      </div>
      {program.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{program.description}</p>
      )}
    </Link>
  );
}
