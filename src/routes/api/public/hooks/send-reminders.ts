import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/hooks/send-reminders")({
  server: {
    handlers: {
      POST: async () => {
        const now = new Date();
        const { data: bookings, error } = await supabaseAdmin
          .from("bookings")
          .select("*")
          .eq("status", "success")
          .gte("booking_date", new Date(now.getTime() - 24 * 3600 * 1000).toISOString().slice(0, 10));
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        const results: Array<{ id: string; type: string; ok: boolean }> = [];

        for (const b of bookings ?? []) {
          const when = new Date(`${b.booking_date}T${normalizeTime(b.booking_time)}:00`);
          const diffMin = (when.getTime() - now.getTime()) / 60000;

          // 60-minute reminder window: 55..65
          if (!b.reminder_60_sent && diffMin >= 55 && diffMin <= 65) {
            const ok = await sendEmail(
              b.email,
              "Через час встреча в Целительном Центре Мира",
              `Приветствую, ${b.full_name}!\n\nЭто напоминание о том, что через час мы встречаемся в Google Meet.\nСсылка на подключение: https://meet.google.com/two-eakb-xsj.\n\nПожалуйста, убедись, что ты будешь вовремя.\n\nЯ жду тебя в Потоке!`,
            );
            if (ok) {
              await supabaseAdmin
                .from("bookings")
                .update({ reminder_60_sent: true })
                .eq("id", b.id);
            }
            results.push({ id: b.id, type: "60", ok });
          }

          // 10-minute reminder window: 5..15
          if (!b.reminder_10_sent && diffMin >= 5 && diffMin <= 15) {
            const ok = await sendEmail(
              b.email,
              "Через 10 минут встреча в Целительном Центре Мира",
              `Приветствую, ${b.full_name}!\n\nЧерез 10 минут начнётся наша встреча в Google Meet.\nСсылка на подключение: https://meet.google.com/two-eakb-xsj.\n\nПожалуйста, подключайтесь заранее, закройте глаза и побудьте с Собой.\n\nДо встречи в Потоке!`,
            );
            if (ok) {
              await supabaseAdmin
                .from("bookings")
                .update({ reminder_10_sent: true })
                .eq("id", b.id);
            }
            results.push({ id: b.id, type: "10", ok });
          }
        }

        return new Response(
          JSON.stringify({ ok: true, processed: results.length, results }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});

function normalizeTime(t: string): string {
  // Accept "10:00", "10:00:00", or "10".
  const m = t.match(/^(\d{1,2})(?::(\d{1,2}))?/);
  if (!m) return "00:00";
  const h = m[1].padStart(2, "0");
  const mm = (m[2] ?? "00").padStart(2, "0");
  return `${h}:${mm}`;
}

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Целительный Центр Мира <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
      }),
    });
    return res.ok;
  } catch (e) {
    console.warn("Resend error", e);
    return false;
  }
}