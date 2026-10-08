import { Languages } from "lucide-react";
import { setLang, t, useLang, type Lang } from "@/lib/i18n";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "bn", label: "বাংলা" },
  { value: "en", label: "English" },
];

export function LanguageSwitch() {
  const lang = useLang();
  return (
    <div className="rise mb-5 flex items-center justify-between rounded-xl glass px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm font-semibold">
        <Languages className="size-4 text-signal" /> {t("ভাষা")}
      </span>
      <div className="flex rounded-lg border border-border p-0.5">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setLang(o.value)}
            aria-pressed={lang === o.value}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              lang === o.value ? "bg-signal text-navy" : "text-muted-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
