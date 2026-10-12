// ছবি আপলোডের আগে ১০–২০ KB-তে রূপান্তর — মান যতটা সম্ভব ভালো রেখে।
// ছবি অ্যাপে সর্বোচ্চ ৩২০px-এ দেখায়, তাই ~৪৮০px যথেষ্ট ধারালো।

const MAX_BYTES = 20_000;
const MIN_BYTES = 10_000;
const EDGES = [480, 420, 360, 320, 280, 240];
const QUALITIES = [0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4];

function encode(canvas: HTMLCanvasElement, type: string, q: number) {
  return new Promise<Blob | null>((res) => canvas.toBlob(res, type, q));
}

export async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bmp = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close?.();
      return file;
    }
    // WebP একই সাইজে JPEG-এর চেয়ে ভালো মান দেয়; না থাকলে JPEG।
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    const type = probe.toDataURL("image/webp").startsWith("data:image/webp") ? "image/webp" : "image/jpeg";

    let best: Blob | null = null;
    outer: for (const edge of EDGES) {
      const scale = Math.min(1, edge / Math.max(bmp.width, bmp.height));
      const w = Math.max(1, Math.round(bmp.width * scale));
      const h = Math.max(1, Math.round(bmp.height * scale));
      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(bmp, 0, 0, w, h);
      // সবচেয়ে বেশি মান যেটা ২০ KB-এর ভিতরে আসে
      for (const q of QUALITIES) {
        const blob = await encode(canvas, type, q);
        if (!blob) continue;
        if (blob.size <= MAX_BYTES) {
          best = blob;
          break outer;
        }
        if (!best || blob.size < best.size) best = blob;
      }
    }
    bmp.close?.();
    if (!best) return file;
    void MIN_BYTES; // ছোট ছবি স্বাভাবিকভাবেই ১০ KB-এর কম হতে পারে — জোর করে বড় করি না
    const ext = type === "image/webp" ? ".webp" : ".jpg";
    const name = file.name.replace(/\.[a-z0-9]+$/i, "") + ext;
    return new File([best], name, { type, lastModified: Date.now() });
  } catch {
    return file;
  }
}
