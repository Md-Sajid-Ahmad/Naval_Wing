import { useState } from "react";
import { t } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";

import { bn, RANK_BN, STATUS_BN } from "@/lib/bn";
import { CadetAvatar } from "@/components/CadetAvatar";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({
    meta: [
      { title: "উপস্থিতি — BNCC Naval Wing" },
      { name: "description", content: "দৈনিক প্যারেড উপস্থিতি নিন — উপস্থিত, অনুপস্থিত বা ছুটি হিসেবে চিহ্নিত করুন।" },
      { property: "og:title", content: "উপস্থিতি — BNCC Naval Wing" },
      { property: "og:description", content: "দৈনিক প্যারেড উপস্থিতি রেকর্ড ও সারাংশ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AttendancePage,
});

const OPTIONS = ["present", "absent", "excused"] as const;

function AttendancePage() {
  // লগইন ছাড়াই খোলা অ্যাপ — সবাই উপস্থিতি নিতে পারবে।
  const isStaff = true;
  const qc = useQueryClient();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const { data: cadets = [] } = useQuery({
    queryKey: ["cadets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadets")
        .select("id, cadet_id, full_name, rank, photo_url")
        .order("cadet_id");
      if (error) throw error;
      return data;
    },
  });

  const { data: records = [] } = useQuery({
    queryKey: ["attendance", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("id, cadet_id, status")
        .eq("session_date", date);
      if (error) throw error;
      return data;
    },
  });

  const map = new Map(records.map((r) => [r.cadet_id, r.status]));

  // একই চিহ্নে আবার চাপ দিলে চিহ্ন মুছে যায় (ভুল সংশোধন), অন্য চিহ্নে চাপ দিলে বদলে যায়।
  const mark = useMutation({
    mutationFn: async ({ cadetId, status }: { cadetId: string; status: "present" | "absent" | "excused" }) => {
      if (map.get(cadetId) === status) {
        const { error } = await supabase
          .from("attendance")
          .delete()
          .eq("cadet_id", cadetId)
          .eq("session_date", date);
        if (error) throw error;
        return "cleared" as const;
      }
      const { error } = await supabase
        .from("attendance")
        .upsert({ cadet_id: cadetId, session_date: date, status }, { onConflict: "cadet_id,session_date" });
      if (error) throw error;
      return "marked" as const;
    },
    // চাপ দেওয়ার সাথে সাথেই চিহ্ন দেখায় — সার্ভারের উত্তরের অপেক্ষা করে না।
    onMutate: async ({ cadetId, status }) => {
      const key = ["attendance", date];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<{ id: string; cadet_id: string; status: string }[]>(key);
      const clearing = map.get(cadetId) === status;
      qc.setQueryData(key, (old: { id: string; cadet_id: string; status: string }[] = []) =>
        clearing
          ? old.filter((r) => r.cadet_id !== cadetId)
          : [...old.filter((r) => r.cadet_id !== cadetId), { id: `tmp-${cadetId}`, cadet_id: cadetId, status }],
      );
      return { prev };
    },
    onSuccess: (result) => {
      if (result === "cleared") toast.success(t("চিহ্ন মুছে ফেলা হয়েছে"));
    },
    onError: (e: Error, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["attendance", date], ctx.prev);
      toast.error(e.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const present = records.filter((r) => r.status === "present").length;

  return (
    <AuthedShell>
      <div className="rise mb-4">
        <p className="label-mono">Attendance Muster</p>
        <h1 className="text-2xl font-extrabold tracking-tight">{t("উপস্থিতি")}</h1>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t("ভুল হলে অন্য চিহ্ন চাপুন; নির্বাচিত চিহ্নে আবার চাপলে তা মুছে যাবে।")}
        </p>
      </div>

      <div className="rise mb-4 flex items-center justify-between rounded-xl glass px-3 py-2.5">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-transparent text-sm outline-none"
        />
        <span className="font-mono text-[10px] text-muted-foreground">
          {bn(present)} / {bn(cadets.length)} PRESENT
        </span>
      </div>

      <div className="overflow-hidden rounded-xl glass divide-y divide-border">
        {cadets.map((c) => {
          const status = map.get(c.id);
          return (
            <div key={c.id} className="px-3 py-2.5">
              <div className="flex items-center gap-3">
                <CadetAvatar path={c.photo_url} name={c.full_name} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.full_name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {c.cadet_id} · {RANK_BN[c.rank] ?? c.rank}
                  </p>
                </div>
                {!isStaff && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {status ? STATUS_BN[status] : "—"}
                  </span>
                )}
              </div>
              {isStaff && (
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {OPTIONS.map((o) => (
                    <button
                      key={o}
                      onClick={() => mark.mutate({ cadetId: c.id, status: o })}
                      className={`rounded-lg py-1.5 text-[11px] font-medium ring-1 ${
                        status === o
                          ? "bg-signal/15 text-signal ring-signal/30"
                          : "bg-secondary text-muted-foreground ring-border"
                      }`}
                    >
                      {STATUS_BN[o]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AuthedShell>
  );
}
