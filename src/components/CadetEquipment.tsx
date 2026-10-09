import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CadetAvatar } from "@/components/CadetAvatar";
import { bn } from "@/lib/bn";
import { t } from "@/lib/i18n";
import { errorMessage } from "@/lib/error-message";

export function CadetEquipment({ cadetId }: { cadetId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [equipmentId, setEquipmentId] = useState("");
  const [qty, setQty] = useState(1);

  const { data: held = [] } = useQuery({
    queryKey: ["cadet-equipment", cadetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_assignments")
        .select("id, quantity, assigned_on, equipment:equipment_id (id, name, photo_url)")
        .eq("cadet_id", cadetId)
        .order("assigned_on", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ["equipment"],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("id, name, condition, quantity, category, photo_url")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const give = useMutation({
    mutationFn: async () => {
      if (!equipmentId) throw new Error(t("মালামাল নির্বাচন করুন"));
      const { error } = await supabase
        .from("equipment_assignments")
        .insert({ cadet_id: cadetId, equipment_id: equipmentId, quantity: Math.max(1, qty) });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("মালামাল দেওয়া হয়েছে"));
      setOpen(false);
      setEquipmentId("");
      setQty(1);
      qc.invalidateQueries({ queryKey: ["cadet-equipment", cadetId] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const giveBack = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("equipment_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("ফেরত নেওয়া হয়েছে"));
      qc.invalidateQueries({ queryKey: ["cadet-equipment", cadetId] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <section className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="label-mono">{t("তার কাছে থাকা মালামাল")}</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg bg-signal px-2.5 py-1.5 text-xs font-bold text-navy"
        >
          <Plus className="size-3.5" /> {t("মালামাল দিন")}
        </button>
      </div>

      {open && (
        <div className="mb-2.5 grid gap-2 rounded-xl glass p-3">
          <select
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
          >
            <option value="">{t("মালামাল নির্বাচন করুন")}</option>
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} ({bn(it.quantity)})
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 1)}
              className="w-24 rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
              aria-label={t("সংখ্যা")}
            />
            <button
              type="button"
              disabled={give.isPending}
              onClick={() => give.mutate()}
              className="flex-1 rounded-lg bg-signal px-3 py-2 text-sm font-bold text-navy disabled:opacity-60"
            >
              {give.isPending ? t("সংরক্ষণ হচ্ছে…") : t("দিন")}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl glass divide-y divide-border">
        {held.map((h) => (
          <div key={h.id} className="flex items-center gap-3 px-3 py-2.5">
            {h.equipment ? (
              <Link
                to="/equipment/$equipmentId"
                params={{ equipmentId: h.equipment.id }}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <CadetAvatar name={h.equipment.name} path={h.equipment.photo_url} bucket="equipment-photos" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{h.equipment.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {t("সংখ্যা")}: {bn(h.quantity)} · {bn(h.assigned_on)}
                  </p>
                </div>
              </Link>
            ) : (
              <span className="flex-1 text-sm text-muted-foreground">—</span>
            )}
            <button
              type="button"
              onClick={() => giveBack.mutate(h.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px]"
            >
              <Undo2 className="size-3" /> {t("ফেরত")}
            </button>
          </div>
        ))}
        {held.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("কোনো মালামাল নেই।")}</p>
        )}
      </div>
    </section>
  );
}
