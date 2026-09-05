import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { AuthedShell } from "@/components/AuthedShell";

export const Route = createFileRoute("/_authenticated/letters")({
  head: () => ({
    meta: [
      { title: "অফিসিয়াল চিঠি — BNCC Naval Wing" },
      { name: "description", content: "অফিসিয়াল চিঠি তৈরি, সংরক্ষণ ও ট্র্যাক করার মডিউল — শীঘ্রই আসছে।" },
      { property: "og:title", content: "অফিসিয়াল চিঠি — BNCC Naval Wing" },
      { property: "og:description", content: "অফিসিয়াল চিঠি ব্যবস্থাপনা মডিউল।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LettersPage,
});

function LettersPage() {
  return (
    <AuthedShell>
      <div className="rise mb-4">
        <p className="label-mono">Official Correspondence</p>
        <h1 className="text-2xl font-extrabold tracking-tight">চিঠি ব্যবস্থাপনা</h1>
      </div>
      <div className="grid place-items-center rounded-2xl glass px-4 py-14 text-center">
        <Mail className="mb-3 size-8 text-signal" />
        <p className="text-sm font-semibold">এই মডিউলটি শীঘ্রই আসছে</p>
        <p className="mt-1 text-xs text-muted-foreground">
          চিঠি তৈরি, নম্বরিং ও ডিজিটাল সিগনেচার পরবর্তী ধাপে যুক্ত হবে।
        </p>
      </div>
    </AuthedShell>
  );
}
