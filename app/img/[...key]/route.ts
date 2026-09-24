import { getImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

// Public read for product photos (origin: Supabase Storage, proxied so the
// bucket stays private and URLs stay on our own domain).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const name = key.join("/");
  if (!name || name.includes("..") || name.includes("/"))
    return new Response("not found", { status: 404 });
  let img;
  try {
    img = await getImage(name);
  } catch {
    return new Response("not found", { status: 404 });
  }
  if (!img) return new Response("not found", { status: 404 });
  return new Response(img.body, {
    headers: {
      "Content-Type": img.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
