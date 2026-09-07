import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
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
  beforeLoad: () => {
    throw redirect({ to: "/dashboard", replace: true });
  },
});
