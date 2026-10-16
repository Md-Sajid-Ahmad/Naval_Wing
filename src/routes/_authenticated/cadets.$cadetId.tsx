import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { t } from "@/lib/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Pencil, Phone, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { bn, initial, RANK_BN, RANK_ORDER, STATUS_BN } from "@/lib/bn";
import { CadetEquipment } from "@/components/CadetEquipment";
import { CadetAvatar } from "@/components/CadetAvatar";
import { PhotoPicker } from "@/components/PhotoPicker";
import { shrinkImage } from "@/lib/photo";

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

const editSchema = z.object({
  cadet_id: z.string().trim().min(2, "ক্যাডেট আইডি দিন").max(30),
  full_name: z.string().trim().min(2, "নাম দিন").max(100),
  rank: z.string().trim().max(40),
  batch: z.string().trim().max(10),
  phone: z.string().trim().max(20).nullable(),
});

const INPUT_CLS =
  "mt-1 w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-signal/60";

function CadetDetail() {
  const { cadetId } = Route.useParams();
  const [shot, setShot] = useState(false);
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();

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

  // বড় ছবির ঠিকানা — একই cache key, তাই তালিকা থেকে এলে আবার লোড হয় না।
  const { data: photoUrl } = useQuery({
    queryKey: ["cadet-photo", cadet?.photo_url],
    enabled: !!cadet?.photo_url,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("cadet-photos")
        .createSignedUrl(cadet?.photo_url as string, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });

  // সম্পাদনা — নাম, আইডি, র‍্যাংক, ব্যাচ, ফোন আর ছবি বদলানো যায়।
  const editCadet = useMutation({
    mutationFn: async ({ form, file }: { form: z.infer<typeof editSchema>; file: File | null }) => {
      let photo_url: string | null = null;
      if (file && file.size > 0) {
        const shot = await shrinkImage(file);
        const ext = shot.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("cadet-photos").upload(path, shot, {
          contentType: shot.type || "image/jpeg",
        });
        if (upErr) throw upErr;
        photo_url = path;
      }
      const { error } = await supabase
        .from("cadets")
        .update({ ...form, ...(photo_url ? { photo_url } : {}) })
        .eq("id", cadetId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("ক্যাডেট সংপাদন হয়েছে"));
      setEditing(false);
      setPhoto(null);
      qc.invalidateQueries({ queryKey: ["cadet", cadetId] });
      qc.invalidateQueries({ queryKey: ["cadets"] });
      qc.invalidateQueries({ queryKey: ["cadets", "report"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => {
      const code = (e as Error & { code?: string }).code;
      if (code === "23505") {
        toast.error(t("এই ক্যাডেট আইডি আগেই ব্যবহৃত — অন্য আইডি দিন।"));
      } else {
        toast.error(e.message);
      }
    },
  });

  // মুছে ফেলা — ক্যাডেটের সাথে তার উপস্থিতি ও মালামালের হিসাবও মুছে যায় (CASCADE)।
  const deleteCadet = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cadets").delete().eq("id", cadetId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("ক্যাডেট মুছে ফেলা হয়েছে"));
      qc.invalidateQueries({ queryKey: ["cadets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      navigate({ to: "/cadets" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function confirmDelete() {
    if (!cadet) return;
    if (window.confirm(t("এই ক্যাডেটকে মুছে ফেলবেন? সব উপস্থিতি ও মালামালের হিসাবও মুছে যাবে।"))) {
      deleteCadet.mutate();
    }
  }

  function submitEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cadet) return;
    const fd = new FormData(e.currentTarget);
    const parsed = editSchema.safeParse({
      cadet_id: fd.get("cadet_id"),
      full_name: fd.get("full_name"),
      rank: fd.get("rank") || "Cadet",
      batch: fd.get("batch"),
      phone: fd.get("phone") || null,
    });
    if (!parsed.success) {
      toast.error(t(parsed.error.issues[0]?.message ?? "তথ্য সঠিক নয়"));
      return;
    }
    editCadet.mutate({ form: parsed.data, file: photo });
  }

  function toggleEdit() {
    setEditing((v) => !v);
    setPhoto(null);
  }

  return (
    <AuthedShell>
      <button
        onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: "/cadets" }))}
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground"
      >
        <ChevronLeft className="size-3.5" /> {t("ফিরে যান")}
      </button>

      {!cadet ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("লোড হচ্ছে…")}</p>
      ) : (
        <>
          <figure className="rise mx-auto mb-4 max-w-[320px] overflow-hidden rounded-2xl glass">
            <div className="relative aspect-square w-full bg-secondary">
              <div className="absolute inset-0 grid place-items-center">
                <span className="text-[7rem] leading-none font-extrabold text-muted-foreground">
                  {initial(cadet.full_name)}
                </span>
              </div>
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt={cadet.full_name ?? t("ক্যাডেট")}
                  decoding="async"
                  onLoad={() => setShot(true)}
                  onError={() => setShot(false)}
                  className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
                    shot ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}
            </div>
            <figcaption className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <div className="min-w-0">
                <p className="label-mono">ID · {cadet.cadet_id}</p>
                <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight">{cadet.full_name}</h1>
                <p className="mt-0.5 text-xs text-muted-foreground">{RANK_BN[cadet.rank] ?? cadet.rank}</p>
              </div>
              <button
                type="button"
                onClick={toggleEdit}
                aria-label={t("সংপাদন করুন")}
                className={`grid size-10 shrink-0 place-items-center rounded-full ring-1 transition-transform active:scale-95 ${
                  editing ? "bg-signal text-primary-foreground ring-signal/40" : "bg-secondary ring-border"
                }`}
              >
                <Pencil className="size-4" />
              </button>
            </figcaption>
          </figure>

          {editing && (
            <form
              key={`${cadet.id}-${cadet.updated_at ?? ""}`}
              onSubmit={submitEdit}
              className="rise mb-4 space-y-2.5 rounded-2xl glass p-4"
            >
              <p className="label-mono">{t("ক্যাডেট সংপাদন")}</p>
              <PhotoPicker
                photo={photo}
                onPick={setPhoto}
                id="edit"
                label={t("ছবি বদল করুন")}
                capture="user"
                fallback={<CadetAvatar path={cadet.photo_url} name={cadet.full_name} size={56} />}
              />
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="label-mono" htmlFor="edit-cadet_id">
                    {t("ক্যাডেট আইডি")}
                  </label>
                  <input
                    id="edit-cadet_id"
                    name="cadet_id"
                    defaultValue={cadet.cadet_id}
                    className={INPUT_CLS}
                  />
                </div>
                <div>
                  <label className="label-mono" htmlFor="edit-batch">
                    {t("ব্যাচ")}
                  </label>
                  <input id="edit-batch" name="batch" defaultValue={cadet.batch ?? ""} className={INPUT_CLS} />
                </div>
              </div>
              <div>
                <label className="label-mono" htmlFor="edit-full_name">
                  {t("পূর্ণ নাম")}
                </label>
                <input
                  id="edit-full_name"
                  name="full_name"
                  defaultValue={cadet.full_name}
                  className={INPUT_CLS}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("র‍্যাংক")}
                  </span>
                  <select
                    name="rank"
                    defaultValue={cadet.rank}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                  >
                    {Array.from(new Set([...RANK_ORDER, cadet.rank])).map((r) => (
                      <option key={r} value={r}>
                        {RANK_BN[r] ?? r}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <label className="label-mono" htmlFor="edit-phone">
                    {t("ফোন")}
                  </label>
                  <input
                    id="edit-phone"
                    name="phone"
                    defaultValue={cadet.phone ?? ""}
                    placeholder="017…"
                    className={INPUT_CLS}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={editCadet.isPending}
                  className="flex-1 rounded-lg bg-signal py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {editCadet.isPending ? t("সংরক্ষণ হচ্ছে…") : t("আপডেট করুন")}
                </button>
                <button
                  type="button"
                  onClick={toggleEdit}
                  className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold ring-1 ring-border"
                >
                  {t("বাতিল")}
                </button>
              </div>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteCadet.isPending}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold text-destructive ring-1 ring-destructive/40 transition-transform active:scale-[0.99] disabled:opacity-60"
              >
                <Trash2 className="size-4" />
                {deleteCadet.isPending ? t("মুছে ফেলা হচ্ছে…") : t("ক্যাডেট মুছে ফেলুন")}
              </button>
            </form>
          )}

          <div className="mb-2.5 grid grid-cols-2 gap-2.5">
            <Info label={t("ব্যাচ")} value={cadet.batch ? bn(cadet.batch) : "—"} />
            <Info
              label={t("যোগদান")}
              value={cadet.joined_on ? bn(cadet.joined_on) : "—"}
            />
          </div>

          <PhoneRow phone={cadet.phone} />

          <CadetEquipment cadetId={cadetId} />

        </>
      )}
    </AuthedShell>
  );
}

function Info({
  label,
  value,
  danger,
  className,
}: {
  label: string;
  value: string;
  danger?: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-xl glass p-3 ${className ?? ""}`}>
      <p className="label-mono">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${danger ? "text-destructive" : ""}`}>{value}</p>
    </div>
  );
}

/** নম্বৰ দিয়ে কল করাৰ বাটন — ফোন নাইকিলে কল বাটন দেখুওৱা নয়। */
function PhoneRow({ phone }: { phone?: string | null }) {
  const digits = phone?.replace(/[^+\d]/g, "") ?? "";
  const callable = digits.replace(/\D/g, "").length >= 6;
  const body = (
    <>
      <span className="min-w-0">
        <span className="label-mono block">{t("ফোন")}</span>
        <span className="mt-1 block truncate text-sm font-semibold">{phone ? bn(phone) : "—"}</span>
      </span>
      {callable && (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-signal px-3.5 py-2 text-xs font-bold text-navy">
          <Phone className="size-3.5" /> {t("কল করুন")}
        </span>
      )}
    </>
  );
  const cls =
    "mb-4 flex items-center justify-between gap-3 rounded-xl glass p-3 transition-transform active:scale-[0.99]";
  return callable ? (
    <a href={`tel:${digits}`} className={cls} aria-label={`${t("কল করুন")} ${phone}`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}
