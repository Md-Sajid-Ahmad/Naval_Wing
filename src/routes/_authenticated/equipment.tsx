// ============= Full file contents =============

import { useMemo, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, PackageOpen, Pencil, Plus, Search, Trash2, X } from "lucide-react";
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
      { name: "description", content: "ইকুইপমেন্ট ইনভেন্টরি — ভালো ও খারাপ মালামাল আলাদা ভাবে দেখুন, ছবি, নাম, অবস্থা, সংখ্যা ও গ্রুপসহ যোগ ও সংপাদন করুন।" },
      { property: "og:title", content: "মালামাল — BNCC Naval Wing" },
      { property: "og:description", content: "ভালো ও খারাপ মালামালের আলাদা তালিকা, যোগ ও সংপাদন।" },
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
type Category = (typeof CATEGORIES)[number];
type Condition = "good" | "bad";

const CATEGORY_BN: Record<string, string> = {
  parade: "প্যারেড",
  piled: "Pilot",
  other: "Other",
};
const CONDITION_BN: Record<Condition, string> = {
  good: "ভালো",
  bad: "খারাপ",
};
const SECTION_BN: Record<Condition, string> = {
  good: "ভালো মালামাল",
  bad: "খারাপ মালামাল",
};


function asCategory(c: string): Category {
  return (CATEGORIES as readonly string[]).includes(c) ? (c as Category) : "other";
}
function asCondition(c: string): Condition {
  return c === "bad" ? "bad" : "good";
}

const itemSchema = z.object({
  name: z.string().trim().min(2, "নাম দিন").max(100),
  condition: z.enum(["good", "bad"]),
  quantity: z.coerce.number().int().min(0, "সংখ্যা দিন").max(99999),
  category: z.enum(["parade", "piled", "other"]),
});

async function uploadPhoto(file: File): Promise<string> {
  const shot = await shrinkImage(file);
  const ext = shot.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("equipment-photos").upload(path, shot, {
    contentType: shot.type || "image/jpeg",
  });
  if (error) throw error;
  return path;
}

async function signedPhoto(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from("equipment-photos").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

// DB-তে unique index (lower(btrim(name))) আছে — একই নাম দ্বিতীয়বার গেলে Postgres 23505 দেয়।
function isDupName(e: unknown): boolean {
  return (e as { code?: string })?.code === "23505";
}
function onError(e: Error) {
  toast.error(isDupName(e) ? t("এই নামের মালামাল আগেই যোগ করা আছে — অন্য নাম দিন।") : e.message);
}

function EquipmentPage() {
  const qc = useQueryClient();
  const [cond, setCond] = useState<Condition>("good");
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [condition, setCondition] = useState<Condition>("good");
  const [newCategory, setNewCategory] = useState<Category>("parade");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const editSeq = useRef(0);

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

  const rows = useMemo(() => filtered.filter((it) => it.condition === cond), [filtered, cond]);
  const editing = useMemo(() => items.find((it) => it.id === editingId) ?? null, [items, editingId]);

  const totalQty = items.reduce((s, it) => s + it.quantity, 0);
  const goodQty = items.filter((it) => it.condition === "good").reduce((s, it) => s + it.quantity, 0);
  const badQty = totalQty - goodQty;
  const goodRate = totalQty ? Math.round((goodQty / totalQty) * 100) : 100;

  const counts: Record<Condition, number> = {
    good: items.filter((it) => it.condition === "good").length,
    bad: items.filter((it) => it.condition === "bad").length,
  };
  const qtys: Record<Condition, number> = { good: goodQty, bad: badQty };

  const addItem = useMutation({
    mutationFn: async ({ form, file }: { form: z.infer<typeof itemSchema>; file: File | null }) => {
      const photo_url = file && file.size > 0 ? await uploadPhoto(file) : null;
      const { data: added, error } = await supabase
        .from("equipment")
        .insert({ ...form, photo_url })
        .select("id, name, condition, quantity, category, photo_url")
        .single();
      if (error) throw error;
      return added;
    },
    onSuccess: (added) => {
      toast.success(t("নতুন মালামাল যোগ হয়েছে"));
      closeForm();
      qc.setQueryData(["equipment"], (old: typeof items | undefined) =>
        [...(old ?? []), added].sort((a, b) => a.name.localeCompare(b.name)),
      );
      qc.invalidateQueries({ queryKey: ["equipment"] });
    },
    onError,
  });

  const updateItem = useMutation({
    mutationFn: async ({
      id,
      form,
      file,
    }: {
      id: string;
      form: z.infer<typeof itemSchema>;
      file: File | null;
    }) => {
      const patch: z.infer<typeof itemSchema> & { photo_url?: string } = { ...form };
      if (file && file.size > 0) patch.photo_url = await uploadPhoto(file);
      const { data: updated, error } = await supabase
        .from("equipment")
        .update(patch)
        .eq("id", id)
        .select("id, name, condition, quantity, category, photo_url")
        .single();
      if (error) throw error;
      return updated;
    },
    onSuccess: (updated) => {
      toast.success(t("মালামাল সংপাদন হয়েছে"));
      closeForm();
      qc.setQueryData(["equipment"], (old: typeof items | undefined) =>
        (old ?? []).map((it) => (it.id === updated.id ? updated : it)),
      );
      qc.invalidateQueries({ queryKey: ["equipment"] });
    },
    onError,
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
    onError,
  });

  function closeForm() {
    setOpen(false);
    setEditingId(null);
    setPhoto(null);
    setEditingPhoto(null);
    setNewCategory("parade");
    setCondition(cond);
  }

  function toggleForm() {
    if (open) closeForm();
    else {
      setOpen(true);
      setCondition(cond);
    }
  }

  function startEdit(it: (typeof items)[number]) {
    const mine = ++editSeq.current;
    setOpen(true);
    setEditingId(it.id);
    setCondition(asCondition(it.condition));
    setNewCategory(asCategory(it.category));
    setPhoto(null);
    setEditingPhoto(null);
    if (it.photo_url) {
      void signedPhoto(it.photo_url).then((url) => {
        if (editSeq.current === mine) setEditingPhoto(url);
      });
    }
  }

  function pickTab(c: Condition) {
    setCond(c);
    setCondition(c);
    if (editingId) closeForm();
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = itemSchema.safeParse({
      name: fd.get("name"),
      condition,
      quantity: fd.get("quantity") || 1,
      category: newCategory,
    });
    if (!parsed.success) {
      toast.error(t(parsed.error.issues[0]?.message ?? "তথ্য সঠিক নয়"));
      return;
    }
    if (editingId) updateItem.mutate({ id: editingId, form: parsed.data, file: photo });
    else addItem.mutate({ form: parsed.data, file: photo });
  }

  const busy = addItem.isPending || updateItem.isPending;

  return (
    <AuthedShell>
      <div className="rise mb-4">
        <p className="label-mono">Equipment Inventory</p>
        <h1 className="text-2xl font-extrabold tracking-tight">{t("মালামাল")}</h1>
      </div>

      {/* সারাংশ হিরো কার্ড */}
      <div className="rise relative mb-3 overflow-hidden rounded-2xl glass p-4" style={{ animationDelay: "40ms" }}>
        <div className="sweep pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-foreground/10" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase text-signal">{t("সর্বমোট স্টক")}</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight">{bn(totalQty)}</p>
            <p className="text-[11px] text-muted-foreground">
              {bn(items.length)} {t("আইটেম")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-muted-foreground">CONDITION</p>
            <p className="text-lg font-bold text-signal">{bn(goodRate)}%</p>
            <p className="text-[11px] text-muted-foreground">
              {t("ভালো")} {bn(goodQty)} · {t("খারাপ")} {bn(badQty)}
            </p>
          </div>
        </div>
      </div>

      {/* Good / Bad option দুটো */}
      <div className="rise grid grid-cols-2 gap-2" style={{ animationDelay: "80ms" }}>
        {(["good", "bad"] as const).map((c) => (
          <button
            key={c}
            onClick={() => pickTab(c)}
            aria-pressed={cond === c}
            className={`rounded-xl px-3 py-2.5 text-left ring-1 transition-colors ${
              cond === c
                ? c === "good"
                  ? "bg-ok/15 ring-ok/40"
                  : "bg-destructive/15 ring-destructive/40"
                : "bg-secondary ring-border"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className={`size-1.5 rounded-full ${c === "good" ? "bg-ok" : "bg-destructive"}`} />
              <span
                className={`text-xs font-bold ${
                  cond === c ? (c === "good" ? "text-ok" : "text-destructive") : "text-muted-foreground"
                }`}
              >
                {t(SECTION_BN[c])}
              </span>
            </span>
            <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
              {bn(counts[c])} {t("আইটেম")} · ×{bn(qtys[c])}
            </span>
          </button>
        ))}
      </div>

      {/* যোগ / সংপাদন ফরম — এই option-এর ভিতরতেই */}
      <div className="rise mt-3 rounded-2xl glass p-3" style={{ animationDelay: "120ms" }}>
        <button
          onClick={toggleForm}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-signal py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          <Plus className={`size-4 transition-transform ${open ? "rotate-45" : ""}`} />
          {open && editing ? t("মালামাল সংপাদন") : `${t("যোগ করুন")} · ${t(SECTION_BN[cond])}`}
        </button>

        {open && (
          <form
            key={editingId ?? "new"}
            onSubmit={submit}
            className="rise mt-3 space-y-3"
            style={{ animationDelay: "160ms" }}
          >
            <p className="label-mono">{editing ? t("মালামাল সংপাদন") : t("নতুন মালামাল")}</p>

            <PhotoPicker
              photo={photo}
              onPick={setPhoto}
              id="eq"
              label={t("ছবি")}
              capture="environment"
              size={64}
              fallback={
                editingPhoto ? (
                  <img src={editingPhoto} alt={t("ছবি")} className="size-full object-cover" />
                ) : (
                  <ImagePlus className="size-5 text-muted-foreground" />
                )
              }
              hint={
                editing && photo === null && editingPhoto === null && editing.photo_url
                  ? t("আগেৰ ছবি রইছে")
                  : undefined
              }
            />
            <div>
              <label className="label-mono" htmlFor="name">
                {t("নাম")}
              </label>
              <input
                id="name"
                name="name"
                defaultValue={editing?.name ?? ""}
                placeholder={t("যেমন: প্যারেড বুট")}
                className="mt-1 w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-signal/60"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("অবস্থা")}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(["good", "bad"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`rounded-lg py-2 text-xs font-semibold ring-1 transition-colors ${
                      condition === c
                        ? c === "good"
                          ? "bg-signal/15 text-signal ring-signal/40"
                          : "bg-destructive/15 text-destructive ring-destructive/40"
                        : "bg-secondary text-muted-foreground ring-border"
                    }`}
                  >
                    {t(CONDITION_BN[c])}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("সংখ্যা")}
                </span>
                <input
                  name="quantity"
                  type="number"
                  min={0}
                  defaultValue={editing?.quantity ?? 1}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                />
              </label>
              <div>
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("গ্ৰুপ")}
                </span>
                <div className="flex gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCategory(c)}
                      className={`flex-1 rounded-lg px-1 py-2 text-[11px] font-semibold ring-1 transition-colors ${
                        newCategory === c
                          ? "bg-signal/15 text-signal ring-signal/40"
                          : "bg-secondary text-muted-foreground ring-border"
                      }`}
                    >
                      {t(CATEGORY_BN[c] ?? c)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-signal py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? t("সংরক্ষণ হচ্ছে…") : editing ? t("আপডেট করুন") : t("সংরক্ষণ করুন")}
            </button>

            {editing && (
              <button
                type="button"
                onClick={closeForm}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:text-destructive"
              >
                <X className="size-3.5" /> {t("বাতিল")}
              </button>
            )}
          </form>
        )}
      </div>

      <div className="rise mt-3 flex items-center gap-2 rounded-xl glass px-3 py-2.5" style={{ animationDelay: "160ms" }}>
        <Search className="size-4 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t("নাম দিয়ে খুঁজুন…")}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mb-3 mt-2 flex gap-1.5 overflow-x-auto pb-1">
        {["all", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ring-1 transition-colors ${
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
        {t(SECTION_BN[cond])} · {bn(rows.length)} / {bn(items.length)} ITEMS
      </p>

      <div className="overflow-hidden rounded-xl glass">
        <div className="divide-y divide-border">
          {rows.map((it) => (
            <div key={it.id} className="group flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-foreground/5">
              <Link
                to="/equipment/$equipmentId"
                params={{ equipmentId: it.id }}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <CadetAvatar path={it.photo_url} name={it.name} size={44} bucket="equipment-photos" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{it.name}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {t(CATEGORY_BN[it.category] ?? it.category)}
                  </p>
                </div>
                <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] font-bold">
                  ×{bn(it.quantity)}
                </span>
              </Link>
              <button
                onClick={() => startEdit(it)}
                aria-label={t("সংপাদন করুন")}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-signal"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={() => removeItem.mutate(it.id)}
                aria-label={t("মুছুন")}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
              <PackageOpen className="size-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">{t("কোনো মালামাল পাওয়া যায়নি।")}</p>
            </div>
          )}
        </div>
      </div>
    </AuthedShell>
  );
}
