-- একই নামের (স্পেস/বড়-ছোট হরফ পার্থক্য মানা হবে না) দ্বিতীয় মালামাল যোগ করা যাবে না;
-- মালামাল মুছে ফেললে নামটি আবার ব্যবহার করা যাবে।
CREATE UNIQUE INDEX IF NOT EXISTS equipment_name_unique_ci
  ON public.equipment (lower(btrim(name)));