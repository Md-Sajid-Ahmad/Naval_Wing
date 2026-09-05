import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "লগইন — BNCC Naval Wing ব্রিজ কনসোল" },
      {
        name: "description",
        content: "BNCC নেভাল উইং ম্যানেজমেন্ট অ্যাপে নিরাপদে সাইন ইন করুন — ক্যাডেট, উপস্থিতি ও রিপোর্ট ব্যবস্থাপনা।",
      },
      { property: "og:title", content: "লগইন — BNCC Naval Wing" },
      { property: "og:description", content: "BNCC নেভাল উইং ম্যানেজমেন্ট অ্যাপে নিরাপদে সাইন ইন করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email({ message: "সঠিক ইমেইল দিন" }).max(255),
  password: z.string().min(6, { message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের" }).max(72),
  fullName: z.string().trim().max(100).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "তথ্য সঠিক নয়");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard" });
        else toast.success("নিবন্ধন সফল — ইমেইল যাচাই করে লগইন করুন।");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "কিছু একটা ভুল হয়েছে");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="mb-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg glass">
            <span className="font-mono text-[10px] tracking-widest text-signal">BN</span>
          </div>
          <div className="leading-tight">
            <p className="label-mono">BNCC · Naval Wing</p>
            <p className="text-sm font-extrabold tracking-tight">ব্রিজ কনসোল</p>
          </div>
        </Link>

        <div className="rise rounded-2xl glass p-5">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {mode === "signin" ? "সাইন ইন" : "নতুন অ্যাকাউন্ট"}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {mode === "signin"
              ? "অনুমোদিত সদস্যদের জন্য সংরক্ষিত কনসোল।"
              : "নতুন সদস্য ডিফল্টে ক্যাডেট রোল পাবেন।"}
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <div>
                <label className="label-mono" htmlFor="fullName">
                  Full name · পূর্ণ নাম
                </label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg bg-secondary px-3 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-signal/60"
                  placeholder="মোঃ রায়হান হোসেন"
                />
              </div>
            )}
            <div>
              <label className="label-mono" htmlFor="email">
                Email · ইমেইল
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg bg-secondary px-3 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-signal/60"
                placeholder="officer@bncc.gov.bd"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label-mono" htmlFor="password">
                Password · পাসওয়ার্ড
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg bg-secondary px-3 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-signal/60"
                placeholder="••••••••"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-lg bg-signal py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {busy ? "অপেক্ষা করুন…" : mode === "signin" ? "সাইন ইন করুন" : "নিবন্ধন করুন"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {mode === "signin" ? "অ্যাকাউন্ট নেই? নিবন্ধন করুন" : "অ্যাকাউন্ট আছে? সাইন ইন করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
