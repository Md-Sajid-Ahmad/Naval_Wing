import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { CadetAvatar } from "@/components/CadetAvatar";
import { ProgramForm, PROGRAM_GROUPS } from "@/components/ProgramForm";
import { fmtTime } from "./programs";
import { t } from "@/lib/i18n";
import { bn, RANK_BN } from "@/lib/bn";

export const Route = createFileRoute("/_authenticated/programs_/$programId")({
  head: () => ({
    meta: [
      { title: "প্রোগ্রাম — BNCC Naval Wing" },
      { name: "description", content: "প্রোগ্রামের বিবরণ ও অংশগ্রহণকারী ক্যাডেটদের গ্রুপভিত্তিক তালিকা।" },
      { property: "og:title", content: "প্রোগ্রাম — BNCC Naval Wing" },
      { property: "og:description", content: "প্রোগ্রামের বিবরণ ও ক্যাডেট তালিকা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProgramDetailPage,
});

function ProgramDetailPage() {
  const { programId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [groupView, setGroupView] = useState<string>("all");

  const { data: p, isLoading } = useQuery({
    queryKey: ["programs", programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("id, name, description, program_date, program_time, program_cadets(id, group_name, cadets(id, cadet_id, full_name, rank, photo_url))")
        .eq("id", programId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("programs").delete().eq("id", programId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("প্রোগ্রাম মুছে ফেলা হয়েছে"));
      qc.invalidateQueries({ queryKey: ["programs"] });
      navigate({ to: "/programs" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const members = p?.program_cadets ?? [];

  return (
    <AuthedShell>
      <Link to="/programs" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowLeft className="size-3.5" /> Program
      </Link>

      {isLoading && <p className="text-sm text-muted-foreground">{t("লোড হচ্ছে…")}</p>}

      {p && (
        <>
          <div className="glass rounded-xl p-4">
            <p className="text-lg font-bold text-paper">{p.name}</p>
            <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="size-3" />{bn(p.program_date)}</span>
              {p.program_time && <span className="flex items-center gap-1"><Clock className="size-3" />{fmtTime(p.program_time)}</span>}
              <span>{bn(String(members.length))} {t("জন ক্যাডেট")}</span>
            </p>
            {p.description && <p className="mt-3 whitespace-pre-wrap border-t border-border pt-3 text-sm text-foreground">{p.description}</p>}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {[{ value: "all", label: "সব" }, ...PROGRAM_GROUPS].map((g) => {
              const n = g.value === "all" ? members.length : members.filter((m) => m.group_name === g.value).length;
              return (
                <button
                  key={g.value}
                  onClick={() => setGroupView(g.value)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${groupView === g.value ? "bg-signal text-navy" : "border border-border text-muted-foreground"}`}
                >
                  {t(g.label)} · {bn(String(n))}
                </button>
              );
            })}
          </div>

          <div className="mt-3 space-y-3">
            {PROGRAM_GROUPS.filter((g) => groupView === "all" || g.value === groupView).map((g) => {
              const list = members.filter((m) => m.group_name === g.value && m.cadets);
              if (!list.length && groupView !== "all")
                return <p key={g.value} className="text-xs text-muted-foreground">{t("এই গ্রুপে কেউ নেই")}</p>;
              if (!list.length) return null;
              return (
                <div key={g.value} className="glass rounded-xl p-4">
                  <p className="label-mono mb-2">{t(g.label)} · {bn(String(list.length))}</p>
                  <ul className="space-y-1.5">
                    {list.map((m) => (
                      <li key={m.id}>
                        <Link
                          to="/cadets/$cadetId"
                          params={{ cadetId: m.cadets!.id }}
                          className="flex items-center gap-2 rounded-lg p-1 active:bg-signal/10"
                        >
                          <CadetAvatar path={m.cadets!.photo_url} name={m.cadets!.full_name} size={32} />
                          <div className="min-w-0">
                            <p className="truncate text-sm text-paper">{m.cadets!.full_name}</p>
                            <p className="text-[11px] text-muted-foreground">{m.cadets!.cadet_id} · {t(RANK_BN[m.cadets!.rank] ?? m.cadets!.rank)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-signal"
            >
              <Pencil className="size-3.5" /> {t("সম্পাদনা")}
            </button>
            <button
              onClick={() => window.confirm(t("এই প্রোগ্রাম মুছে ফেলবেন?")) && del.mutate()}
              className="flex items-center gap-1.5 text-xs font-semibold text-destructive"
            >
              <Trash2 className="size-3.5" /> {t("মুছে ফেলুন")}
            </button>
          </div>

          {editing && (
            <div className="mt-4">
              <ProgramForm
                key={p.id}
                onClose={() => setEditing(false)}
                initial={{
                  id: p.id,
                  name: p.name,
                  description: p.description ?? "",
                  date: p.program_date,
                  time: p.program_time ? p.program_time.slice(0, 5) : "",
                  picked: Object.fromEntries(members.map((m) => [m.cadets?.id ?? "", m.group_name]).filter(([k]) => k)),
                }}
              />
            </div>
          )}
        </>
      )}
    </AuthedShell>
  );
}
