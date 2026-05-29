import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listPanelBookings = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { bookings: data };
  },
);

export const listPanelSlots = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabaseAdmin
      .from("availability_slots")
      .select("*")
      .order("slot_date")
      .order("slot_time");
    if (error) throw new Error(error.message);
    return { slots: data };
  },
);

const slotsInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  times: z.array(z.string().min(1).max(20)).max(50),
});

export const setPanelDaySlots = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => slotsInput.parse(d))
  .handler(async ({ data }) => {
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
