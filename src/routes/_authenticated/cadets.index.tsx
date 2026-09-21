import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";

import { bn, STATUS_BN } from "@/lib/bn";
import { CadetAvatar } from "@/components/CadetAvatar";

export const Route = createFileRoute("/_authenticated/cadets/")({
  head: () => ({
    meta: [
      { title: "ক্যাডেট ম্যানেজমেন্ট — BNCC Naval Wing" },
      {
        name: "description",
        content: "ক্যাডেটদের তালিকা দেখুন, নাম বা আইডি দিয়ে খুঁজুন, ওয়ার্ড অনুযায়ী ফিল্টার করুন ও নতুন ক্যাডেট যোগ করুন।",
      },
      { property: "og:title", content: "ক্যাডেট ম্যানেজমেন্ট — BNCC Naval Wing" },
      { property: "og:description", content: "ক্যাডেট তালিকা, সার্চ, ফিল্টার ও নতুন ক্যাডেট নিবন্ধন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CadetsPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      তালিকা লোড করা যায়নি: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm">কোনো ক্যাডেট পাওয়া যায়নি।</div>,
});

const cadetSchema = z.object({
  cadet_id: z.string().trim().min(2, "ক্যাডেট আইডি দিন").max(30),
  full_name: z.string().trim().min(2, "নাম দিন").max(100),
  rank: z.string().trim().max(40),
  batch: z.string().trim().max(10),
  ward: z.string().trim().min(1).max(4),
  phone: z.string().trim().max(20).nullable(),
});

function CadetsPage() {
  // লগইন ছাড়াই খোলা অ্যাপ — সবাই ক্যাডেট যোগ করতে পারবে।
  const isStaff = true;
  const qc = useQueryClient();

  const [term, setTerm] = useState("");
  const [ward, setWard] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  const { data: cadets = [] } = useQuery({
    queryKey: ["cadets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadets")
        .select("id, cadet_id, full_name, rank, batch, ward, status, photo_url")
        .order("cadet_id");
      if (error) throw error;
      return data;
    },
  });

  const wards = useMemo(() => Array.from(new Set(cadets.map((c) => c.ward))).sort(), [cadets]);

  const filtered = cadets.filter((c) => {
    const t = term.trim().toLowerCase();
    const matchTerm =
      !t ||
      c.full_name.toLowerCase().includes(t) ||
      c.cadet_id.toLowerCase().includes(t) ||
      c.rank.toLowerCase().includes(t);
    return matchTerm && (ward === "all" || c.ward === ward);
  });

  const addCadet = useMutation({
    mutationFn: async ({ form, file }: { form: z.infer<typeof cadetSchema>; file: File | null }) => {
      let photo_url: string | null = null;
      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("cadet-photos").upload(path, file, {
          contentType: file.type || "image/jpeg",
        });
        if (upErr) throw upErr;
        photo_url = path;
      }
      const { error } = await supabase.from("cadets").insert({ ...form, photo_url });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("নতুন ক্যাডেট যোগ হয়েছে");
      setOpen(false);
      setPhoto(null);
      qc.invalidateQueries({ queryKey: ["cadets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = cadetSchema.safeParse({
      cadet_id: fd.get("cadet_id"),
      full_name: fd.get("full_name"),
      rank: fd.get("rank") || "Cadet",
      batch: fd.get("batch"),
      ward: fd.get("ward") || "A",
      phone: fd.get("phone") || null,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "তথ্য সঠিক নয়");
      return;
    }
    addCadet.mutate({ form: parsed.data, file: photo });
  }

  return (
    <AuthedShell>
      <div className="rise mb-4 flex items-end justify-between">
        <div>
          <p className="label-mono">Cadet Register</p>
          <h1 className="text-2xl font-extrabold tracking-tight">ক্যাডেটদের তালিকা</h1>
        </div>
        {isStaff && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-signal px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="size-3.5" /> যোগ করুন
          </button>
        )}
      </div>

      {open && isStaff && (
        <form onSubmit={submit} className="rise mb-4 space-y-2.5 rounded-2xl glass p-4">
          <p className="label-mono">New cadet · নতুন ক্যাডেট</p>
          <div className="flex items-center gap-3">
            <div className="grid size-14 place-items-center overflow-hidden rounded-xl bg-secondary ring-1 ring-border">
              {photo ? (
                <img src={URL.createObjectURL(photo)} alt="ছবি" className="size-full object-cover" />
              ) : (
                <span className="text-[10px] text-muted-foreground">ছবি</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <label className="label-mono" htmlFor="photo">
                ক্যাডেটের ছবি
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
          <div className="grid grid-cols-2 gap-2.5">
            <Field name="cadet_id" label="ক্যাডেট আইডি" placeholder="BN-2301" />
            <Field name="batch" label="ব্যাচ" placeholder="2025" />
          </div>
          <Field name="full_name" label="পূর্ণ নাম" placeholder="মোঃ রায়হান হোসেন" />
          <div className="grid grid-cols-3 gap-2.5">
            <Field name="rank" label="র‍্যাংক" placeholder="Cadet" />
            <Field name="ward" label="ওয়ার্ড" placeholder="A" />
            <Field name="phone" label="ফোন" placeholder="017…" />
          </div>
          <button
            type="submit"
            disabled={addCadet.isPending}
            className="w-full rounded-lg bg-signal py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {addCadet.isPending ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
          </button>
        </form>
      )}

      <div className="rise mb-3 flex items-center gap-2 rounded-xl glass px-3 py-2.5">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="নাম, আইডি বা র‍্যাংক খুঁজুন…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {["all", ...wards].map((w) => (
          <button
            key={w}
            onClick={() => setWard(w)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ring-1 ${
              ward === w
                ? "bg-signal/15 text-signal ring-signal/30"
                : "bg-secondary text-muted-foreground ring-border"
            }`}
          >
            {w === "all" ? "সব" : `ওয়ার্ড ${w}`}
          </button>
        ))}
      </div>

      <p className="mb-2 font-mono text-[10px] text-muted-foreground">
        {bn(filtered.length)} / {bn(cadets.length)} CADETS
      </p>

      <div className="overflow-hidden rounded-xl glass">
        <div className="divide-y divide-border">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to="/cadets/$cadetId"
              params={{ cadetId: c.id }}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <CadetAvatar path={c.photo_url} name={c.full_name} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.full_name}</p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">
                  ID · {c.cadet_id} / {c.rank}
                </p>
              </div>
              <span
                className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                  c.status === "active" ? "bg-signal/15 text-signal" : "bg-secondary text-muted-foreground"
                }`}
              >
                {STATUS_BN[c.status]}
              </span>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">কোনো ক্যাডেট মেলেনি।</p>
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
