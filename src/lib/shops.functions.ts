import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createShopSchema = z.object({
  buildingId: z.string().min(1),
  buildingName: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  floor: z.string().trim().max(60).optional().default(""),
  unit: z.string().trim().max(60).optional().default(""),
  category: z.string().trim().max(60).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  description: z.string().trim().max(500).optional().default(""),
});

export const createShop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createShopSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("shops")
      .insert({
        owner_id: context.userId,
        building_id: data.buildingId,
        building_name: data.buildingName,
        name: data.name,
        floor: data.floor || null,
        unit: data.unit || null,
        category: data.category || null,
        phone: data.phone || null,
        description: data.description || null,
      })
      .select("id, name")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listMyShops = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("shops")
      .select("id, name, floor, unit, category, building_id, building_name, created_at")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteMyShop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("shops")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });