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

/** Official rank order: lowest to highest. */
export const RANK_ORDER = [
  "Cadet",
  "Lance Corporal",
  "Corporal",
  "Sergeant",
  "CUO",
] as const;

export const RANK_BN: Record<string, string> = localized({
  Cadet: "ক্যাডেট",
  "Lance Corporal": "লান্স কর্পোরাল",
  Corporal: "কর্পোরাল",
  Sergeant: "সার্জেন্ট",
  CUO: "সিইউও",
});

/** Sort rank names by official order; unknown ranks go last. */
export function sortRanks(ranks: string[]): string[] {
  return [...ranks].sort((a, b) => {
    const ia = RANK_ORDER.indexOf(a as (typeof RANK_ORDER)[number]);
    const ib = RANK_ORDER.indexOf(b as (typeof RANK_ORDER)[number]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });
}

export const STATUS_BN: Record<string, string> = localized({
  active: "সক্রিয়",
  inactive: "নিষ্ক্রিয়",
  passed_out: "উত্তীর্ণ",
  present: "উপস্থিত",
  absent: "অনুপস্থিত",
  excused: "ছুটি",
  unreported: "রিপোর্ট করে নাই",
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
