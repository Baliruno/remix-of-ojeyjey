import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createGoodSchema = z.object({
  shopId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  price: z.number().nonnegative().max(1_000_000_000).nullable().optional(),
  unit: z.string().trim().max(40).optional().default(""),
  category: z.string().trim().max(60).optional().default(""),
  description: z.string().trim().max(500).optional().default(""),
  inStock: z.boolean().optional().default(true),
  imagePath: z.string().trim().max(300).optional().default(""),
});

export const addGood = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createGoodSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("shop_goods")
      .insert({
        shop_id: data.shopId,
        owner_id: context.userId,
        name: data.name,
        price: data.price ?? null,
        unit: data.unit || null,
        category: data.category || null,
        description: data.description || null,
        in_stock: data.inStock ?? true,
        image_url: data.imagePath || null,
      })
      .select("id, name")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listShopGoods = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ shopId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: rows, error } = await client
      .from("shop_goods")
      .select("id, shop_id, name, price, unit, category, description, in_stock, image_url, created_at")
      .eq("shop_id", data.shopId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const list = (rows ?? []) as Array<Record<string, unknown>>;
    const paths = list.map((r) => r["image_url"]).filter((v): v is string => typeof v === "string" && v.length > 0);
    let signed: Record<string, string> = {};
    if (paths.length) {
      const { data: urls } = await client.storage.from("goods-images").createSignedUrls(paths, 60 * 60 * 24);
      signed = Object.fromEntries(
        (urls ?? [])
          .filter((u) => u.signedUrl && u.path)
          .map((u) => [u.path as string, u.signedUrl as string]),
      );
    }
    return list.map((r) => ({
      ...r,
      image_url: typeof r["image_url"] === "string" ? (signed[r["image_url"] as string] ?? null) : null,
    })) as unknown as Array<{
      id: string;
      shop_id: string;
      name: string;
      price: number | null;
      unit: string | null;
      category: string | null;
      description: string | null;
      in_stock: boolean;
      image_url: string | null;
      created_at: string;
    }>;
  });

export const updateGoodStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), inStock: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("shop_goods")
      .update({ in_stock: data.inStock })
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGood = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("shop_goods")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
