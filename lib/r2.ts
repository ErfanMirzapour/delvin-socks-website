import { getCloudflareContext } from "@opennextjs/cloudflare";

// Product photos live in the UPLOADS R2 bucket and are served via /img/[...key].
export function uploadsBucket(): R2Bucket {
  return getCloudflareContext().env.UPLOADS;
}

// Best-effort delete of an R2 object referenced by a stored /img/... URL.
export async function deleteUploadByUrl(url: string): Promise<void> {
  const m = /^\/img\/(.+)$/.exec(url);
  if (!m) return;
  try {
    await uploadsBucket().delete(decodeURIComponent(m[1]));
  } catch {
    // Orphan objects are harmless; ignore.
  }
}
