import { useSyncExternalStore } from "react";

export type Lang = "bn" | "en";

let current: Lang = "bn";
const listeners = new Set<() => void>();
const KEY = "app-lang";

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang) {
  if (lang === current) return;
  current = lang;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/** Load saved language after hydration. */
export function loadSavedLang() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "en" || saved === "bn") setLang(saved);
  } catch {
    /* ignore */
  }
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => "bn",
  );
}

const EN: Record<string, string> = {
  // nav
  "ড্যাশবোর্ড": "Dashboard",
  "ক্যাডেট": "Cadet",
  "উপস্থিতি": "Attendance",
  "চিঠি": "Letters",
  "রিপোর্ট": "Reports",
  "মালামাল": "Equipment",
  // equipment
  "নতুন মালামাল": "New equipment",
  "নতুন মালামাল যোগ হয়েছে": "New equipment added",
  "মালামাল মুছে ফেলা হয়েছে": "Equipment removed",
  "মালামালের ছবি": "Equipment photo",
  "অবস্থা": "Condition",
  "ভালো": "Good",
  "খারাপ": "Bad",
  "সংখ্যা": "Quantity",
  "গ্রুপ": "Group",
  "প্যারেড": "Parade",
  "Pilot": "Pilot",
  "মোট": "Total",
  "নাম দিয়ে খুঁজুন…": "Search by name…",
  "কোনো মালামাল পাওয়া যায়নি।": "No equipment found.",
  "মুছুন": "Delete",
  "যেমন: প্যারেড বুট": "e.g. Parade boots",
  // language
  "ভাষা": "Language",
  // dashboard
  "ডেটা লোড করা যায়নি:": "Could not load data:",
  "কিছু পাওয়া যায়নি।": "Nothing found.",
  "শুভ সকাল": "Good morning",
  "শুভ অপরাহ্ন": "Good afternoon",
  "শুভ সন্ধ্যা": "Good evening",
  ", কমান্ডার": ", Commander",
  "অপারেশন ড্যাশবোর্ড": "Operations Dashboard",
  "Today · আজকের সর্বমোট": "Today · Total",
  "জন ক্যাডেট উপস্থিত": "cadets present",
  "মোট ক্যাডেট": "Total cadets",
  "আজ উপস্থিত": "Present today",
  "সক্রিয় ক্যাডেট": "Active cadets",
  "র‍্যাংক": "Rank",
  // cadets
  "তালিকা লোড করা যায়নি:": "Could not load list:",
  "কোনো ক্যাডেট পাওয়া যায়নি।": "No cadets found.",
  "ক্যাডেট আইডি দিন": "Enter cadet ID",
  "নাম দিন": "Enter name",
  "নতুন ক্যাডেট যোগ হয়েছে": "New cadet added",
  "তথ্য সঠিক নয়": "Invalid information",
  "ক্যাডেট তালিকা": "Cadet List",
  "যোগ করুন": "Add",
  "New cadet · নতুন ক্যাডেট": "New cadet",
  "ছবি": "Photo",
  "ক্যাডেটের ছবি": "Cadet photo",
  "ক্যাডেট আইডি": "Cadet ID",
  "ব্যাচ": "Batch",
  "পূর্ণ নাম": "Full name",
  "ফোন": "Phone",
  "সংরক্ষণ হচ্ছে…": "Saving…",
  "সংরক্ষণ করুন": "Save",
  "নাম, আইডি বা র‍্যাংক খুঁজুন…": "Search name, ID or rank…",
  "সব": "All",
  "কোনো ক্যাডেট মেলেনি।": "No matching cadets.",
  // attendance
  "চিহ্ন মুছে ফেলা হয়েছে": "Mark cleared",
  "ভুল হলে অন্য চিহ্ন চাপুন; নির্বাচিত চিহ্নে আবার চাপলে তা মুছে যাবে।":
    "If wrong, tap another mark; tap the selected mark again to clear it.",
  // reports
  "সক্রিয়": "Active",
  "মোট রেকর্ড": "Total records",
  "উপস্থিতির হার": "Attendance rate",
  "Rank breakdown · র‍্যাংকভিত্তিক": "Rank breakdown",
  "কোনো তথ্য নেই।": "No data.",
  "সময় বদল করলে সারাংশ আবার হিসেব হবো।": "Change the period and the summary is recalculated.",
  "থেক": "From",
  "পর্যন্ত": "To",
  "এই মাস": "This month",
  "শেষ ৭ দিন": "Last 7 days",
  "সব সময়": "All time",
  "দিন": "days",
  "মোট চিহ্ন": "Total marks",
  "চিহ্ন নাই": "Not marked",
  "ক্যাডেটর হিসেব": "Per-cadet tally",
  "নাম": "Name",
  "হার": "Rate",
  "একটিভ": "Active",
  "নন-একটিভ": "Non-active",
  "একটিভ ক্যাডেট": "Active cadets",
  "নন-একটিভ ক্যাডেট": "Non-active cadets",
  "৩ ক্লাস অনুপস্থিত থাকলে ক্যাডেট নন-একটিভ তালিকায় চলে যায়।":
    "A cadet moves to the non-active list after 3 absences.",
  // detail
  "যোগ হয়েছে": "Added",
  "তার কাছে থাকা মালামাল": "Equipment held",
  "মালামাল দিন": "Issue equipment",
  "মালামাল নির্বাচন করুন": "Select equipment",
  "মালামাল দেওয়া হয়েছে": "Equipment issued",
  "ফেরত নেওয়া হয়েছে": "Returned",
  "ফেরত": "Return",
  "কোনো মালামাল নেই।": "No equipment.",
  "লোড হচ্ছে…": "Loading…",
  "স্ট্যাটাস": "Status",
  "যোগদান": "Joined",
  "Recent attendance · সাম্প্রতিক উপস্থিতি": "Recent attendance",
  "কোনো রেকর্ড নেই।": "No records.",
  // letters
  "চিঠি ব্যবস্থাপনা": "Letter Management",
  "এই মডিউলটি শীঘ্রই আসছে": "This module is coming soon",
  "চিঠি তৈরি, নম্বরিং ও ডিজিটাল সিগনেচার পরবর্তী ধাপে যুক্ত হবে।":
    "Letter creation, numbering and digital signatures will be added next.",
  // ranks & statuses
  "লান্স কর্পোরাল": "Lance Corporal",
  "কর্পোরাল": "Corporal",
  "সার্জেন্ট": "Sergeant",
  "সিইউও": "CUO",
  "নিষ্ক্রিয়": "Inactive",
  "উত্তীর্ণ": "Passed out",
  "উপস্থিত": "Present",
  "অনুপস্থিত": "Absent",
  "ছুটি": "Excused",
  "রিপোর্ট করে নাই": "Not reported",
  "অ্যাডমিন": "Admin",
  "অফিসার": "Officer",
};

/** Translate a Bangla UI string into the active language. */
export function t(s: string): string {
  if (current === "bn") return s;
  return EN[s] ?? s;
}
