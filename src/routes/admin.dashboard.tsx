import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  listBookings,
  listAllSlots,
  setDaySlots,
  listAllBlogPosts,
  upsertBlogPost,
  deleteBlogPost,
  checkIsAdmin,
  grantSelfAdminIfNoneExists,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

type Tab = "bookings" | "slots" | "blog";

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("bookings");

  const check = useServerFn(checkIsAdmin);
  const bootstrap = useServerFn(grantSelfAdminIfNoneExists);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      const { isAdmin: ok } = await check();
      if (ok) {
        setIsAdmin(true);
      } else {
        // Bootstrap first admin
        try {
          const r = await bootstrap();
          if (r.granted) setIsAdmin(true);
        } catch {}
      }
      setReady(true);
    })();
  }, [navigate, check, bootstrap]);

  if (!ready) {
    return (
      <div style={{ backgroundColor: "#f5f4f2" }} className="min-h-screen p-8">
        <p style={{ color: "#593110" }}>Загрузка…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ backgroundColor: "#f5f4f2" }} className="min-h-screen p-8">
        <p style={{ color: "#593110" }}>
          У вас нет доступа администратора. Обратитесь к владельцу проекта.
        </p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f5f4f2" }} className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl sm:text-3xl" style={{ color: "#593110" }}>
            Админ-панель
          </h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              qc.clear();
              navigate({ to: "/admin/login" });
            }}
            className="text-sm underline"
            style={{ color: "#593110" }}
          >
            Выйти
          </button>
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["bookings", "slots", "blog"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-display"
              style={{
                backgroundColor: tab === t ? "#593110" : "#fff",
                color: tab === t ? "#fff" : "#593110",
                border: "1px solid #e0d6cf",
              }}
            >
              {t === "bookings" ? "Бронирования" : t === "slots" ? "Слоты" : "Блог"}
            </button>
          ))}
        </div>
        {tab === "bookings" && <BookingsTab />}
        {tab === "slots" && <SlotsTab />}
        {tab === "blog" && <BlogTab />}
      </div>
    </div>
  );
}

function BookingsTab() {
  const fn = useServerFn(listBookings);
  const { data, isLoading } = useQuery({ queryKey: ["admin-bookings"], queryFn: () => fn() });

  if (isLoading) return <p style={{ color: "#593110" }}>Загрузка…</p>;

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border" style={{ borderColor: "#e0d6cf" }}>
      <table className="min-w-full text-sm">
        <thead style={{ backgroundColor: "#f0ebe7", color: "#593110" }}>
          <tr>
            <th className="px-3 py-2 text-left">Имя</th>
            <th className="px-3 py-2 text-left">Телефон</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Дата</th>
            <th className="px-3 py-2 text-left">Время</th>
            <th className="px-3 py-2 text-left">Статус</th>
          </tr>
        </thead>
        <tbody>
          {(data?.bookings ?? []).map((b) => (
            <tr key={b.id} className="border-t" style={{ borderColor: "#e0d6cf", color: "#593110" }}>
              <td className="px-3 py-2">{b.full_name}</td>
              <td className="px-3 py-2">{b.phone}</td>
              <td className="px-3 py-2">{b.email}</td>
              <td className="px-3 py-2">{b.booking_date}</td>
              <td className="px-3 py-2">{b.booking_time}</td>
              <td className="px-3 py-2">{b.status}</td>
            </tr>
          ))}
          {(data?.bookings ?? []).length === 0 && (
            <tr><td colSpan={6} className="px-3 py-6 text-center opacity-70" style={{ color: "#593110" }}>Пока пусто</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SlotsTab() {
  const list = useServerFn(listAllSlots);
  const save = useServerFn(setDaySlots);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-slots"], queryFn: () => list() });

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timesText, setTimesText] = useState("");
  const [saving, setSaving] = useState(false);

  const byDate: Record<string, string[]> = {};
  for (const s of data?.slots ?? []) {
    (byDate[s.slot_date] ||= []).push(s.slot_time);
  }

  useEffect(() => {
    setTimesText((byDate[date] ?? []).join(", "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, data]);

  async function submit() {
    setSaving(true);
    try {
      const times = timesText
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      await save({ data: { date, times } });
      await qc.invalidateQueries({ queryKey: ["admin-slots"] });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#e0d6cf", color: "#593110" }}>
      <h2 className="font-display text-xl mb-3">Управление слотами</h2>
      <div className="grid sm:grid-cols-[200px_1fr_auto] gap-3 items-end">
        <div>
          <label className="block text-xs mb-1">Дата</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            style={{ borderColor: "#e0d6cf", color: "#593110" }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Время (через запятую, напр. 10:00, 11:30)</label>
          <input
            value={timesText}
            onChange={(e) => setTimesText(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            style={{ borderColor: "#e0d6cf", color: "#593110" }}
          />
        </div>
        <button
          onClick={submit}
          disabled={saving}
          className="rounded-lg px-4 py-2 font-display"
          style={{ backgroundColor: "#593110", color: "#fff" }}
        >
          {saving ? "..." : "Сохранить"}
        </button>
      </div>

      <h3 className="font-display text-lg mt-6 mb-2">Все даты</h3>
      <ul className="space-y-1 text-sm">
        {Object.keys(byDate).sort().map((d) => (
          <li key={d}>
            <button
              onClick={() => setDate(d)}
              className="underline"
              style={{ color: "#593110" }}
            >
              {d}
            </button>
            : {byDate[d].join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlogTab() {
  const list = useServerFn(listAllBlogPosts);
  const upsert = useServerFn(upsertBlogPost);
  const del = useServerFn(deleteBlogPost);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-posts"], queryFn: () => list() });

  const empty = {
    id: undefined as string | undefined,
    title: "",
    slug: "",
    preview_image: "",
    short_description: "",
    content: "",
    published: false,
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      await upsert({ data: form });
      setForm(empty);
      await qc.invalidateQueries({ queryKey: ["admin-posts"] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#e0d6cf", color: "#593110" }}>
        <h2 className="font-display text-xl mb-3">{form.id ? "Редактировать" : "Новая запись"}</h2>
        <div className="space-y-3 text-sm">
          <input
            placeholder="Заголовок"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
            style={{ borderColor: "#e0d6cf" }}
          />
          <input
            placeholder="slug (только a-z, 0-9, -)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
            style={{ borderColor: "#e0d6cf" }}
          />
          <input
            placeholder="URL превью-картинки"
            value={form.preview_image}
            onChange={(e) => setForm({ ...form, preview_image: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
            style={{ borderColor: "#e0d6cf" }}
          />
          <textarea
            placeholder="Краткое описание"
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 min-h-[60px]"
            style={{ borderColor: "#e0d6cf" }}
          />
          <textarea
            placeholder="Содержание"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 min-h-[200px]"
            style={{ borderColor: "#e0d6cf" }}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Опубликовано
          </label>
          {err && <p className="text-red-700">{err}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg px-4 py-2 font-display"
              style={{ backgroundColor: "#593110", color: "#fff" }}
            >
              {saving ? "..." : "Сохранить"}
            </button>
            {form.id && (
              <button onClick={() => setForm(empty)} className="rounded-lg px-4 py-2 border" style={{ borderColor: "#e0d6cf" }}>
                Отмена
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#e0d6cf", color: "#593110" }}>
        <h2 className="font-display text-xl mb-3">Все записи</h2>
        <ul className="space-y-3">
          {(data?.posts ?? []).map((p) => (
            <li key={p.id} className="flex items-start justify-between gap-3 border-b pb-3" style={{ borderColor: "#e0d6cf" }}>
              <div>
                <p className="font-display">{p.title}</p>
                <p className="text-xs opacity-70">/{p.slug} · {p.published ? "опубликовано" : "черновик"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setForm({
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    preview_image: p.preview_image ?? "",
                    short_description: p.short_description ?? "",
                    content: p.content,
                    published: p.published,
                  })}
                  className="text-xs underline"
                >
                  Изменить
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Удалить запись?")) return;
                    await del({ data: { id: p.id } });
                    await qc.invalidateQueries({ queryKey: ["admin-posts"] });
                  }}
                  className="text-xs text-red-700 underline"
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
          {(data?.posts ?? []).length === 0 && <li className="opacity-70 text-sm">Пока пусто</li>}
        </ul>
      </div>
    </div>
  );
}