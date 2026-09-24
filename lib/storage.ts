import { secret } from "./db";

// Product photos live in Supabase Storage (free tier, no credit card) and
// are served to visitors via /img/[...key], so the bucket itself stays
// private and image URLs keep working even if the backend ever changes.

function cfg() {
  // Be liberal: users often paste the URL with whitespace, a trailing slash,
  // or even a full ".../storage/v1" endpoint — normalize to the bare base.
  let url = secret("SUPABASE_URL").trim().replace(/\/+$/, "");
  url = url.replace(/\/storage\/v1\/?$/, "");
  const key = secret("SUPABASE_SERVICE_KEY").trim();
  const bucket = secret("SUPABASE_BUCKET", "product-images").trim();
  if (!url || !key)
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY missing");
  return { url, key, bucket };
}

function authHeaders(key: string): Record<string, string> {
  return { apikey: key, Authorization: `Bearer ${key}` };
}

export async function uploadImage(
  name: string,
  data: ArrayBuffer,
  contentType: string
): Promise<void> {
  const { url, key, bucket } = cfg();
  const target = `${url}/storage/v1/object/${bucket}/${encodeURIComponent(name)}`;
  const res = await fetch(target, {
    method: "POST",
    headers: {
      ...authHeaders(key),
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body: data,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Admin-only surface: base URL (no secrets in it) included for diagnosis.
    throw new Error(
      `upload failed (${res.status}) @ ${url}: ${body.slice(0, 200)}`
    );
  }
}

export async function getImage(
  name: string
): Promise<{ body: ReadableStream | null; contentType: string } | null> {
  const { url, key, bucket } = cfg();
  const res = await fetch(
    `${url}/storage/v1/object/${bucket}/${encodeURIComponent(name)}`,
    { headers: authHeaders(key) }
  );
  if (!res.ok) return null;
  return {
    body: res.body,
    contentType: res.headers.get("Content-Type") || "application/octet-stream",
  };
}

export async function deleteImage(name: string): Promise<void> {
  const { url, key, bucket } = cfg();
  try {
    await fetch(`${url}/storage/v1/object/${bucket}`, {
      method: "DELETE",
      headers: { ...authHeaders(key), "Content-Type": "application/json" },
      body: JSON.stringify([name]),
    });
  } catch {
    // Orphan objects are harmless; ignore.
  }
}

// Best-effort delete of a stored object referenced by an /img/... URL.
export async function deleteUploadByUrl(url: string): Promise<void> {
  const m = /^\/img\/(.+)$/.exec(url);
  if (!m) return;
  try {
    await deleteImage(decodeURIComponent(m[1]));
  } catch {
    // Ignore — see above.
  }
}
