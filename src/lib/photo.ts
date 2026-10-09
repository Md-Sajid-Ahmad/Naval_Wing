// ছবি আপলোডের আগে ছোট করি — ক্যামেরার ৫ মেগাপিক্সেল ছবি 그대로 আপলোড করলে
// খোলা দেখি। সবসময় canvas দিয়ে আবার আঁকা হয়, তাই ১ মেগাবাইটের নীচে থামে।

const MAX_EDGE = 1024;
const QUALITY = 0.82;
const SMALL_ENOUGH = 400_000;

export async function shrinkImage(file: File, maxEdge = MAX_EDGE): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
    if (scale >= 1 && file.size <= SMALL_ENOUGH) {
      bmp.close?.();
      return file;
    }
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close?.();
      return file;
    }
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[a-z0-9]+$/i, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    // না পারলেন আসল ছবিটাই যাক — কাজ থামবো না।
    return file;
  }
}
