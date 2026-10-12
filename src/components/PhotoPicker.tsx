// ছবি বাছাই — গ্যালারি থেকো বা ক্যামেরা দিয়ে সরাসরি তুলি।
// মোবাইলে capture থাকা ইনপুট চাপিলে ফোনৰ ক্যামেরা খুলবো।

import { useEffect, useMemo, type ChangeEvent, type ReactNode } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { t } from "@/lib/i18n";

const BTN =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-2 py-1.5 text-[11px] font-semibold text-foreground ring-1 ring-border transition-colors hover:ring-signal/60";

type Props = {
  photo: File | null;
  onPick: (file: File | null) => void;
  id: string;
  label: string;
  fallback?: ReactNode;
  /** মোবাইলত ক্যামেরা — "user" = সন্মুখৰ কেঁচু, "environment" = পিছনৰ কেঁচু */
  capture?: "user" | "environment";
  size?: number;
  hint?: string;
};

export function PhotoPicker({
  photo,
  onPick,
  id,
  label,
  fallback,
  capture = "environment",
  size = 56,
  hint,
}: Props) {
  const url = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onPick(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className="grid shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary ring-1 ring-border"
        style={{ width: size, height: size }}
      >
        {url ? (
          <img src={url} alt={t("ছবি")} className="size-full object-cover" />
        ) : (
          fallback ?? <ImagePlus className="size-5 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="label-mono">{label}</p>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <label htmlFor={`${id}-gallery`} className={BTN}>
            <ImagePlus className="size-3.5" />
            {t("গ্যালারি")}
          </label>
          <label htmlFor={`${id}-camera`} className={BTN}>
            <Camera className="size-3.5" />
            {t("ক্যামেরা")}
          </label>
        </div>
        {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
      </div>

      <input id={`${id}-gallery`} type="file" accept="image/*" className="hidden" onChange={pick} />
      <input
        id={`${id}-camera`}
        type="file"
        accept="image/*"
        capture={capture}
        className="hidden"
        onChange={pick}
      />
    </div>
  );
}
