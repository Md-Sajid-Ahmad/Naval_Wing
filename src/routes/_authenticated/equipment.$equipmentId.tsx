import { createFileRoute, Link } from "@tanstack/react-router";
import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthedShell } from "@/components/AuthedShell";
import { useState } from "react";
import { bn, initial } from "@/lib/bn";

export const Route = createFileRoute("/_authenticated/equipment/$equipmentId")({
  head: () => ({
    meta: [
      { title: "মালামাল বিস্তারিত — BNCC Naval Wing" },
      { name: "description", content: "একটি মালামালের বিস্তারিত তথ্য — ছবি, অবস্থা, সংখ্যা ও গ্রুপ।" },
      { property: "og:title", content: "মালামাল বিস্তারিত — BNCC Naval Wing" },
      { property: "og:description", content: "মালামালের ছবি, অবস্থা, সংখ্যা ও গ্রুপ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EquipmentDetail,
});

function EquipmentDetail() {
  const { equipmentId } = Route.useParams();
  const [shot, setShot] = useState(false);

  const { data: item } = useQuery({
    queryKey: ["equipment", equipmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("id", equipmentId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // বড় ছবির ঠিকানা — একই cache key, তাই তালিকা থেকে এলে আবার লোড হয় না।
  const { data: photoUrl } = useQuery({
    queryKey: ["cadet-photo", "equipment-photos", item?.photo_url],
    enabled: !!item?.photo_url,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("equipment-photos")
        .createSignedUrl(item?.photo_url as string, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });

  return (
    <AuthedShell>
      <Link to="/equipment" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ChevronLeft className="size-3.5" /> {t("মালামাল")}
      </Link>

      {!item ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("লোড হচ্ছে…")}</p>
      ) : (
        <>
          <figure className="rise mx-auto mb-4 max-w-[320px] overflow-hidden rounded-2xl glass">
            <div className="relative aspect-square w-full bg-secondary">
              <div className="absolute inset-0 grid place-items-center">
                <span className="text-[7rem] leading-none font-extrabold text-muted-foreground">
                  {initial(item.name)}
                </span>
              </div>
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt={item.name ?? t("মালামাল")}
                  decoding="async"
                  onLoad={() => setShot(true)}
                  onError={() => setShot(false)}
                  className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
                    shot ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}
            </div>
            <figcaption className="border-t border-border px-4 py-3">
              <p className="label-mono">{t("মালামাল")}</p>
              <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight">{item.name}</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">{t(item.category === "other" ? "Other" : item.category === "piled" ? "Pilot" : "প্যারেড")}</p>
            </figcaption>
          </figure>

          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <Info
              label={t("অবস্থা")}
              value={t(item.condition === "bad" ? "খারাপ" : "ভালো")}
            />
            <Info label={t("সংখ্যা")} value={bn(item.quantity)} />
            <Info label={t("গ্রুপ")} value={t(item.category === "other" ? "Other" : item.category === "piled" ? "Pilot" : "প্যারেড")} />
            <Info label={t("যোগ হয়েছে")} value={item.created_at ? bn(item.created_at.slice(0, 10)) : "—"} />
          </div>
        </>
      )}
    </AuthedShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl glass p-3">
      <p className="label-mono">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
