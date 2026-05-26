import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Доступ запрещён");
}

export const listBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { bookings: data };
  });

export const listAllSlots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("availability_slots")
      .select("*")
      .order("slot_date")
      .order("slot_time");
    if (error) throw new Error(error.message);
    return { slots: data };
  });

const slotsInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  times: z.array(z.string().min(1).max(20)),
});

export const setDaySlots = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => slotsInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    await supabaseAdmin
      .from("availability_slots")
      .delete()
      .eq("slot_date", data.date);
    if (data.times.length > 0) {
      const rows = data.times.map((t) => ({
        slot_date: data.date,
        slot_time: t,
        is_active: true,
      }));
      const { error } = await supabaseAdmin
        .from("availability_slots")
        .insert(rows);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// Blog management
const blogInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(300),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9-]+$/),
  preview_image: z.string().url().optional().or(z.literal("")),
  short_description: z.string().max(500).optional(),
  content: z.string().min(1),
  published: z.boolean(),
});

export const upsertBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => blogInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const row = {
      title: data.title,
      slug: data.slug,
      preview_image: data.preview_image || null,
      short_description: data.short_description || null,
      content: data.content,
      published: data.published,
    };
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("blog_posts")
        .update(row)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("blog_posts").insert(row);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("blog_posts")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAllBlogPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { posts: data };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const grantSelfAdminIfNoneExists = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Bootstrap: if no admin exists, grant the calling user admin role
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { granted: false };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { granted: true };
  });