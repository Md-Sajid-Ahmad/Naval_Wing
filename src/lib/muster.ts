/** ৩ বা তার বেশি ক্লাসে অনুপস্থিত থাকলে ক্যাডেট নন-একটিভ। */
export const ABSENT_LIMIT = 3;

/** উপস্থিতির হিসেব থেকে ক্যাডেটের একটিভ/নন-একটিভ অবস্থা। */
export function isInactive(absentCount: number): boolean {
  return absentCount >= ABSENT_LIMIT;
}
