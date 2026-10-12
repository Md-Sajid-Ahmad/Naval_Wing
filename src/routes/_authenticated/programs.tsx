import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, CalendarDays, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { ProgramForm } from "@/components/ProgramForm";
import { t } from "@/lib/i18n";
import { bn } from "@/lib/bn";

export const Route = createFileRoute("/_authenticated/programs")({
  head: () => ({
    meta: [
      { title: "Program — BNCC Naval Wing" },
      { name: "description", content: "BNCC Naval Wing-এর প্রোগ্রাম, তারিখ, সময় ও অংশগ্রহণকারী ক্যাডেটদের গ্রুপ।" },
      { property: "og:title", content: "Program — BNCC Naval Wing" },
      { property: "og:description", content: "প্রোগ্রাম ও অংশগ্রহণকারী ক্যাডেটের তালিকা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProgramsPage,
});

export function fmtTime(tm: string | null) {
  if (!tm) return "";
  const [h = "0", m = "00"] = tm.split(":");
  const hh = Number(h);
  const ampm = hh >= 12 ? "PM" : "AM";
  return bn(`${((hh + 11) % 12) + 1}:${m} ${ampm}`);
}

function ProgramsPage() {
  const [open, setOpen] = useState(false);

  const { data: programs = [] } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("id, name, description, program_date, program_time, program_cadets(id)")
        .order("program_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <AuthedShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-paper">Program</h1>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-signal px-4 py-2 text-sm font-semibold text-navy active:scale-[0.97]"
          >
            <Plus className="size-4" /> Add Program
          </button>
        )}
      </div>

      {open && <ProgramForm key="new" onClose={() => setOpen(false)} />}

      {programs.length === 0 && !open && (
        <p className="glass rounded-xl p-6 text-center text-sm text-muted-foreground">
          {t("এখনো কোনো প্রোগ্রাম নেই")}
        </p>
      )}

      <ul className="space-y-3">
        {programs.map((p) => (
          <li key={p.id}>
            <Link
              to="/programs/$programId"
              params={{ programId: p.id }}
              className="glass flex items-center justify-between gap-2 rounded-xl p-4 active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-paper">{p.name}</p>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="size-3" />{bn(p.program_date)}</span>
                  {p.program_time && <span className="flex items-center gap-1"><Clock className="size-3" />{fmtTime(p.program_time)}</span>}
                  <span>{bn(String(p.program_cadets?.length ?? 0))} {t("জন ক্যাডেট")}</span>
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </AuthedShell>
  );
}
