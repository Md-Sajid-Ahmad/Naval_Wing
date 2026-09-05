import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "BNCC Naval Wing — ব্রিজ কনসোল" },
      {
        name: "description",
        content: "BNCC নেভাল উইং ম্যানেজমেন্ট অ্যাপ — ক্যাডেট, উপস্থিতি, চিঠি ও রিপোর্ট এক জায়গায়।",
      },
      { property: "og:title", content: "BNCC Naval Wing — ব্রিজ কনসোল" },
      { property: "og:description", content: "ক্যাডেট, উপস্থিতি, চিঠি ও রিপোর্ট ব্যবস্থাপনা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/dashboard", replace: true });
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl glass">
          <span className="font-mono text-[11px] tracking-widest text-signal">BN</span>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">BNCC Naval Wing</h1>
        <p className="mt-1 text-xs text-muted-foreground">ব্রিজ কনসোল লোড হচ্ছে…</p>
      </div>
    </div>
  );
}
