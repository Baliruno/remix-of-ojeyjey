import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type RequestReply = {
  id: string;
  request_id: string;
  user_id: string;
  message: string;
  price: number | null;
  author_name: string | null;
  created_at: string;
};

export type ItemRequest = {
  id: string;
  user_id: string;
  title: string;
  area: string | null;
  details: string | null;
  status: string;
  author_name: string | null;
  created_at: string;
  replies: RequestReply[];
};

export const listRequests = createServerFn({ method: "GET" }).handler(async (): Promise<ItemRequest[]> => {
  const { createPublicSupabase } = await import("./supabase-public.server");
  const client = createPublicSupabase();

  const { data: rows, error } = await client
    .from("item_requests")
    .select("id, user_id, title, area, details, status, author_name, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  const requests = (rows ?? []) as Array<Record<string, any>>;
  if (!requests.length) return [];

  const { data: replyRows, error: replyError } = await client
    .from("request_replies")
    .select("id, request_id, user_id, message, price, author_name, created_at")
    .in(
      "request_id",
      requests.map((r) => r["id"] as string),
    )
    .order("created_at", { ascending: true });
  if (replyError) throw new Error(replyError.message);

  const byRequest = new Map<string, RequestReply[]>();
  for (const raw of (replyRows ?? []) as Array<Record<string, any>>) {
    const reply: RequestReply = {
      id: raw["id"],
      request_id: raw["request_id"],
      user_id: raw["user_id"],
      message: raw["message"],
      price: raw["price"] ?? null,
      author_name: raw["author_name"] ?? null,
      created_at: raw["created_at"],
    };
    const list = byRequest.get(reply.request_id) ?? [];
    list.push(reply);
    byRequest.set(reply.request_id, list);
  }

  return requests.map((r) => ({
    id: r["id"],
    user_id: r["user_id"],
    title: r["title"],
    area: r["area"] ?? null,
    details: r["details"] ?? null,
    status: r["status"] ?? "open",
    author_name: r["author_name"] ?? null,
    created_at: r["created_at"],
    replies: byRequest.get(r["id"]) ?? [],
  }));
});

const createRequestSchema = z.object({
  title: z.string().trim().min(3).max(120),
  area: z.string().trim().max(80).optional().default(""),
  details: z.string().trim().max(600).optional().default(""),
});

export const createRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createRequestSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("display_name")
      .eq("id", context.userId)
      .maybeSingle();

    const { data: row, error } = await context.supabase
      .from("item_requests")
      .insert({
        user_id: context.userId,
        title: data.title,
        area: data.area || null,
        details: data.details || null,
        author_name: profile?.display_name ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const setRequestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["open", "closed"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("item_requests")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("item_requests")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const replyToRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        requestId: z.string().uuid(),
        message: z.string().trim().min(2).max(500),
        price: z.number().nonnegative().max(1_000_000_000).nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("display_name")
      .eq("id", context.userId)
      .maybeSingle();

    const { error } = await context.supabase.from("request_replies").insert({
      request_id: data.requestId,
      user_id: context.userId,
      message: data.message,
      price: data.price ?? null,
      author_name: profile?.display_name ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("request_replies")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
