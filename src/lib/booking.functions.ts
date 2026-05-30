import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function toLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const bookingInput = z.object({
  full_name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(254),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  booking_time: z.string().min(1).max(20),
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bookingInput.parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        booking_date: data.booking_date,
        booking_time: data.booking_time,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const getAvailableSlots = createServerFn({ method: "GET" }).handler(
  async () => {
    const today = toLocalISODate(new Date());
    const { data, error } = await supabaseAdmin
      .from("availability_slots")
      .select("slot_date, slot_time")
      .eq("is_active", true)
      .gte("slot_date", today)
      .order("slot_date")
      .order("slot_time");
    if (error) throw new Error(error.message);

    const { data: booked } = await supabaseAdmin
      .from("bookings")
      .select("booking_date, booking_time")
      .gte("booking_date", today)
      .eq("status", "success");

    const bookedSet = new Set(
      (booked ?? []).map((b) => `${b.booking_date}|${b.booking_time}`),
    );

    const byDate: Record<string, string[]> = {};
    for (const s of data ?? []) {
      const key = `${s.slot_date}|${s.slot_time}`;
      if (bookedSet.has(key)) continue;
      (byDate[s.slot_date] ||= []).push(s.slot_time);
    }
    return { byDate };
  },
);

const verifyInput = z.object({
  bookingId: z.string().uuid(),
  phrase: z.string().min(1).max(500),
});

export const verifyKeyPhrase = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => verifyInput.parse(d))
  .handler(async ({ data }) => {
    const { data: settings } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "key_phrase")
      .maybeSingle();
    const target = settings?.value ?? "";
    const match = normalize(target) === normalize(data.phrase);

    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("id, full_name, email, booking_date, booking_time, failed_attempts")
      .eq("id", data.bookingId)
      .maybeSingle();
    if (!booking) throw new Error("Бронирование не найдено");

    if (!match) {
      const attempts = Array.isArray(booking.failed_attempts)
        ? booking.failed_attempts
        : [];
      attempts.push({ phrase: data.phrase, at: new Date().toISOString() });
      await supabaseAdmin
        .from("bookings")
        .update({
          failed_attempts: attempts,
          key_phrase_attempt: data.phrase,
        })
        .eq("id", data.bookingId);
      return { success: false };
    }

    await supabaseAdmin
      .from("bookings")
      .update({
        status: "success",
        key_phrase_attempt: data.phrase,
      })
      .eq("id", data.bookingId);

    // Fire-and-collect side effects (email + telegram)
    await Promise.allSettled([
      sendBookingEmail(booking.email, booking.full_name),
      sendTelegramNotification({
        full_name: booking.full_name,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
      }),
    ]);

    return { success: true };
  });

async function sendBookingEmail(to: string, fullName: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping email");
    return;
  }
  const body = {
    from: "Целительный Центр Мира <onboarding@resend.dev>",
    to: [to],
    subject: "Ваша консультация в Целительном Центре Мира забронирована",
    text: `Здравствуйте, ${fullName}!\n\nБлагодарю вас за бронирование. Ваша консультация успешно назначена, и я с нетерпением жду нашей встречи.\n\nВаша ссылка для подключения к Google Meet: https://meet.google.com/two-eakb-xsj\n\nОбязательно подключайтесь вовремя. Что значит «быть вовремя»? Убедитесь, что никто и ничто вас не потревожит. Присоединяйтесь к звонку за 3-5 минут до начала, закройте глаза и побудьте с Собой.\n\nА пока вы ожидаете начала нашей сессии, предлагаю вам погрузиться в атмосферу Целительного Центра Мира. Теория и практика курса уже доступны вам по ссылке ниже. Начните прохождение с первой части под названием «Я=Все» и двигайтесь пошагово, не пропуская ни одного поста. Это поможет вам лучше подготовиться и настроиться на наш диалог.\n\nНачните ваше знакомство с потоком здесь: https://www.instagram.com/p/DWVoSOAiKS7/?igsh=MTg0b3NnZ2xkYmZ6Mw==\n\nДо встречи в Потоке!\n\nС Любовью, что расправляет крылья мира.`,
  };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.warn("Resend email failed:", res.status, await res.text());
  } catch (e) {
    console.warn("Resend email error:", e);
  }
}

async function sendTelegramNotification(b: {
  full_name: string;
  booking_date: string;
  booking_time: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set; skipping notification");
    return;
  }
  const text =
    `*Новая сессия забронирована*\n` +
    `Имя: ${b.full_name}\n` +
    `Дата: ${b.booking_date}\n` +
    `Время: ${b.booking_time}`;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: 606504761,
          text,
          parse_mode: "Markdown",
        }),
      },
    );
    if (!res.ok) console.warn("Telegram failed:", res.status, await res.text());
  } catch (e) {
    console.warn("Telegram error:", e);
  }
}