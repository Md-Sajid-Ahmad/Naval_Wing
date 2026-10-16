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
  "মালামাল": "Equipment",
  "প্রোগ্রাম": "Program", "পাইলট": "Pilot", "ব্যান্ড": "Band", "অতিরিক্ত": "Extra", "জন": "cadets", "জন ক্যাডেট": "cadets", "এখনো কোনো প্রোগ্রাম নেই": "No programs yet", "প্রোগ্রাম যোগ করুন": "Add program", "প্রোগ্রাম যোগ হয়েছে": "Program added", "প্রোগ্রামের নাম দিন": "Enter program name", "প্রোগ্রাম মুছে ফেলা হয়েছে": "Program deleted", "এই প্রোগ্রাম মুছে ফেলবেন?": "Delete this program?", "নাম বা আইডি দিয়ে খুঁজুন": "Search by name or ID",
  "এই গ্রুপে কেউ নেই": "No one in this group", "প্রোগ্রাম আপডেট হয়েছে": "Program updated", "প্রোগ্রাম সম্পাদনা": "Edit program",
  "সম্পাদনা": "Edit",
  // equipment
  "নতুন মালামাল": "New equipment",
  "নতুন মালামাল যোগ হয়েছে": "New equipment added",
  "মালামাল মুছে ফেলা হয়েছে": "Equipment removed",
  "মালামালের ছবি": "Equipment photo",
  "অবস্থা": "Condition",
  "ভালো": "Good",
  "খারাপ": "Bad",
  "ভালো মালামাল": "Good Equipment",
  "খারাপ মালামাল": "Bad Equipment",
  "সংখ্যা": "Quantity",
  "গ্রুপ": "Group",
  "প্যারেড": "Parade",
  "Pilot": "Pilot",
  "মোট": "Total",
  "নাম দিয়ে খুঁজুন…": "Search by name…",
  "কোনো মালামাল পাওয়া যায়নি।": "No equipment found.",
"মুছুন": "Delete",
  "সংপাদন করুন": "Edit",
  "ক্যাডেট সংপাদন": "Edit cadet",
  "ক্যাডেট সংপাদন হয়েছে": "Cadet updated",
  "এই ক্যাডেট আইডি আগেই ব্যবহৃত — অন্য আইডি দিন।": "This cadet ID is already in use — please use a different ID.",
  "মালামাল সংপাদন": "Edit equipment",
"মালামাল সংপাদন হয়েছে": "Equipment updated",
  "এই নামের মালামাল আগেই যোগ করা আছে — অন্য নাম দিন।": "This name is already in use — please use a different name.",
  "আপডেট করুন": "Update",
  "বাতিল": "Cancel",
  "ছবি বদল করুন": "Change photo",
  "আগেৰ ছবি রইছে": "Existing photo kept",
  "যেমন: প্যারেড বুট": "e.g. Parade boots",
  "সর্বমোট স্টক": "Total stock",
  "আইটেম": "items",
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
  "ফিরে যান": "Go back",
  "প্রোগ্রাম আপডেট": "Program Updates",
  "চলমান ও আসন্ন প্রোগ্রামের সর্বশেষ খবর": "Latest news on running and upcoming programs",
  "চলমান প্রোগ্রাম": "Running Programs",
  "আসন্ন প্রোগ্রাম": "Upcoming Programs",
  "আজ কোনো প্রোগ্রাম নেই": "No program today",
  "কোনো আসন্ন প্রোগ্রাম নেই": "No upcoming programs",
  "দিন বাকি": "days left",
  "ঘণ্টা বাকি": "hours left",
  "মিনিট বাকি": "minutes left",
  "আগামীকাল": "Tomorrow",
  "এখন চলছে": "Live now",
  "আজ": "Today",
  "যোগ করুন": "Add",
  "New cadet · নতুন ক্যাডেট": "New cadet",
  "ছবি": "Photo",
  "ক্যাডেটের ছবি": "Cadet photo",
  "গ্যালারি": "Gallery",
  "ক্যামেরা": "Camera",
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
  "সক্রিয়": "Active",
  "নাম": "Name",
  "দিন": "days",
  "একটিভ": "Active",
  "নন-একটিভ": "Non-active",
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
  "কল করুন": "Call",
  "যোগদান": "Joined",
  "Recent attendance · সাম্প্রতিক উপস্থিতি": "Recent attendance",
  "কোনো রেকর্ড নেই।": "No records.",
  "ক্যাডেট মুছে ফেলুন": "Delete cadet",
  "মুছে ফেলা হচ্ছে…": "Deleting…",
  "ক্যাডেট মুছে ফেলা হয়েছে": "Cadet deleted",
  "এই ক্যাডেটকে মুছে ফেলবেন? সব উপস্থিতি ও মালামালের হিসাবও মুছে যাবে।":
    "Delete this cadet? All attendance and equipment records will also be removed.",
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
