import { createClient } from "@supabase/supabase-js";

/** Publishable-key Supabase client for public, read-only server queries. */
export function createPublicSupabase() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export async function signGoodsImages(
  client: ReturnType<typeof createPublicSupabase>,
  paths: string[],
): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const { data: urls } = await client.storage
    .from("goods-images")
    .createSignedUrls(paths, 60 * 60 * 24);
  return Object.fromEntries(
    (urls ?? [])
      .filter((u) => u.signedUrl && u.path)
      .map((u) => [u.path as string, u.signedUrl as string]),
  );
}
