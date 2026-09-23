import { uploadsBucket } from "@/lib/r2";

export const dynamic = "force-dynamic";

// Public read for product photos stored in the UPLOADS R2 bucket.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const name = key.join("/");
  if (!name || name.includes(".."))
    return new Response("not found", { status: 404 });
  const obj = await uploadsBucket().get(name);
  if (!obj) return new Response("not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "Content-Type":
        obj.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
