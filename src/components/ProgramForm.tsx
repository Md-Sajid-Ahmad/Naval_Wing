import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CadetAvatar } from "@/components/CadetAvatar";
import { t } from "@/lib/i18n";
import { bn, RANK_BN, sortRanks } from "@/lib/bn";

export const PROGRAM_GROUPS = [
  { value: "cadet", label: "Cadet" },
  { value: "parade", label: "প্যারেড" },
  { value: "pilot", label: "পাইলট" },
  { value: "band", label: "ব্যান্ড" },
  { value: "extra", label: "অতিরিক্ত" },
] as const;
export const groupLabel = (v: string) => PROGRAM_GROUPS.find((g) => g.value === v)?.label ?? v;

const INPUT =
  "w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm text-foreground outline-none focus:border-signal";

export type ProgramInitial = {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  picked: Record<string, string>;
};

export function ProgramForm({ onClose, initial }: { onClose: () => void; initial?: ProgramInitial }) {
  const qc = useQueryClient();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(() => initial?.date ?? new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(initial?.time ?? "");
  const [picked, setPicked] = useState<Record<string, string>>(initial?.picked ?? {});
  const [rank, setRank] = useState("all");
  const [showPicker, setShowPicker] = useState(false);
  const [q, setQ] = useState("");

  const { data: cadets = [] } = useQuery({
    queryKey: ["cadets", "program-picker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadets")
        .select("id, cadet_id, full_name, rank, photo_url")
        .order("cadet_id");
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return cadets
      .filter((c) => rank === "all" || c.rank === rank)
      .filter((c) => !s || c.full_name.toLowerCase().includes(s) || c.cadet_id.toLowerCase().includes(s));
  }, [cadets, q, rank]);
  const ranks = useMemo(() => sortRanks(Array.from(new Set(cadets.map((c) => c.rank)))), [cadets]);

  const save = useMutation({
    mutationFn: async () => {
      if (name.trim().length < 2) throw new Error(t("প্রোগ্রামের নাম দিন"));
      const fields = { name: name.trim(), description: description.trim() || null, program_date: date, program_time: time || null };
      let programId: string;
      if (initial) {
        const { error } = await supabase.from("programs").update(fields).eq("id", initial.id);
        if (error) throw error;
        const { error: e1 } = await supabase.from("program_cadets").delete().eq("program_id", initial.id);
        if (e1) throw e1;
        programId = initial.id;
      } else {
        const { data, error } = await supabase.from("programs").insert(fields).select("id").single();
        if (error) throw error;
        programId = data.id;
      }
      const rows = Object.entries(picked).map(([cadet_id, group_name]) => ({ program_id: programId, cadet_id, group_name }));
      if (rows.length) {
        const { error: e2 } = await supabase.from("program_cadets").insert(rows);
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      toast.success(t(initial ? "প্রোগ্রাম আপডেট হয়েছে" : "প্রোগ্রাম যোগ হয়েছে"));
      qc.invalidateQueries({ queryKey: ["programs"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = (id: string) =>
    setPicked((p) => {
      const n = { ...p };
      if (n[id]) delete n[id];
      else n[id] = "cadet";
      return n;
    });

  const count = Object.keys(picked).length;

  return (
    <div className="glass mb-5 space-y-3 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-paper">{initial ? t("প্রোগ্রাম সম্পাদনা") : "Add Program"}</p>
        <button onClick={onClose} aria-label="close" className="text-muted-foreground"><X className="size-4" /></button>
      </div>
      <label className="block space-y-1">
        <span className="label-mono">Program Name</span>
        <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
      </label>
      <label className="block space-y-1">
        <span className="label-mono">Description</span>
        <textarea className={INPUT} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="label-mono">Date</span>
          <input type="date" className={INPUT} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="label-mono">Time</span>
          <input type="time" className={INPUT} value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setShowPicker((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-signal/60 px-3 py-2 text-sm font-semibold text-signal"
      >
        <span className="flex items-center gap-1.5"><Plus className="size-4" /> Add Cadet</span>
        <span>{bn(String(count))} {t("জন")}</span>
      </button>

      {showPicker && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {["all", ...ranks].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRank(r)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${rank === r ? "bg-signal text-navy" : "border border-border text-muted-foreground"}`}
              >
                {r === "all" ? t("সব") : t(RANK_BN[r] ?? r)}
              </button>
            ))}
          </div>
          <input className={INPUT} placeholder={t("নাম বা আইডি দিয়ে খুঁজুন")} value={q} onChange={(e) => setQ(e.target.value)} />
          <ul className="max-h-80 space-y-1.5 overflow-y-auto">
            {filtered.map((c) => {
              const g = picked[c.id];
              return (
                <li key={c.id} className={`rounded-lg border p-2 ${g ? "border-signal/60 bg-signal/5" : "border-border"}`}>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!g} onChange={() => toggle(c.id)} className="size-4 accent-[var(--signal)]" />
                    <CadetAvatar path={c.photo_url} name={c.full_name} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-paper">{c.full_name}</p>
                      <p className="text-[11px] text-muted-foreground">{c.cadet_id} · {t(RANK_BN[c.rank] ?? c.rank)}</p>
                    </div>
                  </label>
                  {g && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
                      {PROGRAM_GROUPS.map((gr) => (
                        <button
                          key={gr.value}
                          type="button"
                          onClick={() => setPicked((p) => ({ ...p, [c.id]: gr.value }))}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${g === gr.value ? "bg-signal text-navy" : "border border-border text-muted-foreground"}`}
                        >
                          {t(gr.label)}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="w-full rounded-full bg-signal py-2.5 text-sm font-semibold text-navy disabled:opacity-60"
      >
        {save.isPending ? t("সেভ হচ্ছে…") : initial ? t("আপডেট করুন") : t("প্রোগ্রাম যোগ করুন")}
      </button>
    </div>
  );
}
