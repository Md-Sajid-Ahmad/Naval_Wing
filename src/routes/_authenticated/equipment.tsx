import { useMemo, useState } from "react";
import { t } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { bn } from "@/lib/bn";
import { CadetAvatar } from "@/components/CadetAvatar";
import { errorMessage } from "@/lib/error-message";
import { shrinkImage } from "@/lib/photo";

export const Route = createFileRoute("/_authenticated/equipment")({
  head: () => ({
    meta: [
      { title: "মালামাল — BNCC Naval Wing" },
      { name: "description", content: "ইকুইপমেন্ট ইনভেন্টরি — মালামালের ছবি, নাম, অবস্থা, সংখ্যা ও গ্রুপ অনুযায়ী হিসেব।" },
      { property: "og:title", content: "মালামাল — BNCC Naval Wing" },
      { property: "og:description", content: "ইকুইপমেন্ট ইনভেন্টরি ও মালামালের তালিকা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EquipmentPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {t("তালিকা লোড করা যায়নি:")} {errorMessage(error)}
    </div>
  ),
});

const CATEGORIES = ["parade", "piled", "other"] as const;
const CATEGORY_BN: Record<string, string> = {
  parade: "প্যারেড",
  piled: "Pilot",
  other: "Other",
};
const CONDITION_BN: Record<string, string> = {
  good: "ভালো",
  bad: "খারাপ",
};

const itemSchema = z.object({
  name: z.string().trim().min(2, "নাম দিন").max(100),
  condition: z.enum(["good", "bad"]),
  quantity: z.coerce.number().int().min(0, "সংখ্যা দিন").max(99999),
  category: z.enum(["parade", "piled", "other"]),
});

function EquipmentPage() {
  const qc = useQueryClient();
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("id, name, condition, quantity, category, photo_url")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(
    () =>
      items.filter((it) => {
        const q = term.trim().toLowerCase();
        const matchTerm = !q || it.name.toLowerCase().includes(q);
        return matchTerm && (category === "all" || it.category === category);
      }),
    [items, term, category],
  );

  const totalQty = items.reduce((s, it) => s + it.quantity, 0);
  const badQty = items.filter((it) => it.condition === "bad").reduce((s, it) => s + it.quantity, 0);

  const addItem = useMutation({
    mutationFn: async ({ form, file }: { form: z.infer<typeof itemSchema>; file: File | null }) => {
      let photo_url: string | null = null;
      if (file && file.size > 0) {
        const shot = await shrinkImage(file);
        const ext = shot.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("equipment-photos").upload(path, shot, {
          contentType: shot.type || "image/jpeg",
        });
        if (upErr) throw upErr;
        photo_url = path;
      }
      const { error } = await supabase.from("equipment").insert({ ...form, photo_url });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("নতুন মালামাল যোগ হয়েছে"));
      setOpen(false);
      setPhoto(null);
      qc.invalidateQueries({ queryKey: ["equipment"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("equipment").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("মালামাল মুছে ফেলা হয়েছে"));
      qc.invalidateQueries({ queryKey: ["equipment"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = itemSchema.safeParse({
      name: fd.get("name"),
      condition: fd.get("condition") || "good",
      quantity: fd.get("quantity") || 1,
      category: fd.get("category") || "other",
    });
    if (!parsed.success) {
      toast.error(t(parsed.error.issues[0]?.message ?? "তথ্য সঠিক নয়"));
      return;
    }
    addItem.mutate({ form: parsed.data, file: photo });
  }

  return (
    <AuthedShell>
      <div className="rise mb-4 flex items-end justify-between">
        <div>
          <p className="label-mono">Equipment Inventory</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("মালামাল")}</h1>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t("মোট")} {bn(totalQty)} · {t("খারাপ")} {bn(badQty)}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-signal px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="size-3.5" /> {t("যোগ করুন")}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="rise mb-4 space-y-2.5 rounded-2xl glass p-4">
          <p className="label-mono">{t("নতুন মালামাল")}</p>
          <div className="flex items-center gap-3">
            <div className="grid size-14 place-items-center overflow-hidden rounded-xl bg-secondary ring-1 ring-border">
              {photo ? (
                <img src={URL.createObjectURL(photo)} alt={t("ছবি")} className="size-full object-cover" />
              ) : (
                <span className="text-[10px] text-muted-foreground">{t("ছবি")}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <label className="label-mono" htmlFor="photo">
                {t("মালামালের ছবি")}
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="mt-1 w-full text-[11px] text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-[11px] file:text-foreground"
              />
            </div>
          </div>
          <Field name="name" label={t("নাম")} placeholder={t("যেমন: প্যারেড বুট")} />
          <div className="grid grid-cols-3 gap-2.5">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("অবস্থা")}
              </span>
              <select
                name="condition"
                defaultValue="good"
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="good">{t("ভালো")}</option>
                <option value="bad">{t("খারাপ")}</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("সংখ্যা")}
              </span>
              <input
                name="quantity"
                type="number"
                min={0}
                defaultValue={1}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("গ্রুপ")}
              </span>
              <select
                name="category"
                defaultValue="parade"
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(CATEGORY_BN[c] ?? c)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={addItem.isPending}
            className="w-full rounded-lg bg-signal py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {addItem.isPending ? t("সংরক্ষণ হচ্ছে…") : t("সংরক্ষণ করুন")}
          </button>
        </form>
      )}

      <div className="rise mb-3 flex items-center gap-2 rounded-xl glass px-3 py-2.5">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t("নাম দিয়ে খুঁজুন…")}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {["all", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ring-1 ${
              category === c
                ? "bg-signal/15 text-signal ring-signal/30"
                : "bg-secondary text-muted-foreground ring-border"
            }`}
          >
            {c === "all" ? t("সব") : t(CATEGORY_BN[c] ?? c)}
          </button>
        ))}
      </div>

      <p className="mb-2 font-mono text-[10px] text-muted-foreground">
        {bn(filtered.length)} / {bn(items.length)} ITEMS
      </p>

      <div className="overflow-hidden rounded-xl glass">
        <div className="divide-y divide-border">
          {filtered.map((it) => (
            <div key={it.id} className="flex items-center gap-3 px-3 py-2.5">
              <Link to="/equipment/$equipmentId" params={{ equipmentId: it.id }} className="flex min-w-0 flex-1 items-center gap-3">
                <CadetAvatar path={it.photo_url} name={it.name} size={40} bucket="equipment-photos" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{it.name}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {t(CATEGORY_BN[it.category] ?? it.category)} · {t("সংখ্যা")} {bn(it.quantity)}
                  </p>
                </div>
              </Link>
              <span
                className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                  it.condition === "good" ? "bg-signal/15 text-signal" : "bg-destructive/15 text-destructive"
                }`}
              >
                {t(CONDITION_BN[it.condition] ?? it.condition)}
              </span>
              <button
                onClick={() => removeItem.mutate(it.id)}
                aria-label={t("মুছুন")}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("কোনো মালামাল পাওয়া যায়নি।")}</p>
          )}
        </div>
      </div>
    </AuthedShell>
  );
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <div>
      <label className="label-mono" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-signal/60"
      />
    </div>
  );
}
