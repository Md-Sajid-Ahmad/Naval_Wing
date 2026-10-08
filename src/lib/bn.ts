import { getLang, t } from "./i18n";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Convert any latin digits inside a value to Bangla digits. */
export function bn(value: string | number): string {
  if (getLang() === "en") return String(value);
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

/** Pad a number to two digits, then render in Bangla. */
export function bn2(value: number): string {
  return bn(String(value).padStart(2, "0"));
}

export const RANK_BN: Record<string, string> = localized({
  Cadet: "ক্যাডেট",
  "Senior Cadet": "সিনিয়র ক্যাডেট",
  LCPL: "লান্স কর্পোরাল",
  CPL: "কর্পোরাল",
  Corporal: "কর্পোরাল",
  SGT: "সার্জেন্ট",
  Sergeant: "সার্জেন্ট",
  "Under Officer": "আন্ডার অফিসার",
});

export const STATUS_BN: Record<string, string> = localized({
  active: "সক্রিয়",
  inactive: "নিষ্ক্রিয়",
  passed_out: "উত্তীর্ণ",
  present: "উপস্থিত",
  absent: "অনুপস্থিত",
  late: "দেরি",
  excused: "ছুটি",
});

export const ROLE_BN: Record<string, string> = localized({
  admin: "অ্যাডমিন",
  officer: "অফিসার",
  cadet: "ক্যাডেট",
});

export function initial(name?: string | null): string {
  return (name ?? "").trim().charAt(0) || "?";
}

function localized(map: Record<string, string>): Record<string, string> {
  return new Proxy(map, {
    get(target, key) {
      const v = target[key as string];
      return typeof v === "string" ? t(v) : v;
    },
  });
}
