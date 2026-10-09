import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { initial } from "@/lib/bn";

/** ক্যাডেটের ছবি (থাকলে) দেখায়, না থাকলে নামের প্রথম অক্ষর। */
export function CadetAvatar({
  path,
  name,
  size = 36,
  rounded = "rounded-md",
  bucket = "cadet-photos",
}: {
  path?: string | null;
  name?: string | null;
  size?: number;
  rounded?: string;
  bucket?: string;
}) {
  const { data: url } = useQuery({
    queryKey: ["cadet-photo", bucket, path],
    enabled: !!path,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path as string, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden bg-secondary font-bold ring-1 ring-border ${rounded}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size / 3) }}
    >
      {url ? (
        <img src={url} alt={name ?? "ক্যাডেট"} className="size-full object-cover" loading="lazy" />
      ) : (
        initial(name)
      )}
    </div>
  );
}
