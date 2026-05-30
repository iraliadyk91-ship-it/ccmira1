import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listPanelBookings,
  listPanelSlots,
  setPanelDaySlots,
} from "@/lib/panel.functions";
import { Calendar } from "@/components/ui/calendar";

export const Route = createFileRoute("/panel")({
  head: () => ({ meta: [{ title: "Админ Панель" }] }),
  component: PanelPage,
});

const BROWN = "#593110";
const BG = "#f5f4f2";
const BORDER = "#e0d6cf";

const HOUR_SLOTS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`,
);

function PanelPage() {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState<"bookings" | "schedule">("bookings");

  useEffect(() => {
    const auth = (() => {
      try {
        return sessionStorage.getItem("panel-auth") === "1";
      } catch {
        return false;
      }
    })();
    if (!auth) navigate({ to: "/panel-login" });
    else setOk(true);
  }, [navigate]);

  if (!ok) return null;

  return (
    <div style={{ backgroundColor: BG }} className="min-h-screen px-4 sm:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl sm:text-5xl mb-6" style={{ color: BROWN }}>
          Админ Панель
        </h1>

        <div className="flex gap-2 mb-6">
          {([
            ["bookings", "Бронирования"],
            ["schedule", "График"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="px-4 py-2 rounded-lg text-sm font-display"
              style={{
                backgroundColor: tab === id ? BROWN : "#fff",
                color: tab === id ? "#fff" : BROWN,
                border: `1px solid ${BORDER}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "bookings" ? <BookingsTab /> : <ScheduleTab />}
      </div>
    </div>
  );
}

type FailedAttempt = { phrase?: string; at?: string };

function BookingsTab() {
  const fn = useServerFn(listPanelBookings);
  const { data, isLoading } = useQuery({
    queryKey: ["panel-bookings"],
    queryFn: () => fn(),
  });
  const [filter, setFilter] = useState<"all" | "pending" | "success">("all");

  const bookings = useMemo(() => {
    const list = data?.bookings ?? [];
    if (filter === "all") return list;
    return list.filter((b) => b.status === filter);
  }, [data, filter]);

  if (isLoading) return <p style={{ color: BROWN }}>Загрузка…</p>;

  return (
    <div>
      <div className="flex gap-2 mb-4 items-center">
        <span className="text-sm" style={{ color: BROWN }}>Статус:</span>
        {([
          ["all", "Все"],
          ["pending", "Pending"],
          ["success", "Success"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className="px-3 py-1.5 rounded-lg text-xs font-display"
            style={{
              backgroundColor: filter === id ? BROWN : "#fff",
              color: filter === id ? "#fff" : BROWN,
              border: `1px solid ${BORDER}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border" style={{ borderColor: BORDER }}>
        <table className="min-w-full text-sm">
          <thead style={{ backgroundColor: "#f0ebe7", color: BROWN }}>
            <tr>
              <th className="px-3 py-2 text-left">Имя</th>
              <th className="px-3 py-2 text-left">Телефон</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Дата и Время</th>
              <th className="px-3 py-2 text-left">Статус</th>
              <th className="px-3 py-2 text-left">Дата создания</th>
              <th className="px-3 py-2 text-left">Фраза-ключ</th>
              <th className="px-3 py-2 text-left">История ошибок</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const attempts = (Array.isArray(b.failed_attempts)
                ? b.failed_attempts
                : []) as FailedAttempt[];
              return (
                <tr
                  key={b.id}
                  className="border-t align-top"
                  style={{ borderColor: BORDER, color: BROWN }}
                >
                  <td className="px-3 py-2">{b.full_name}</td>
                  <td className="px-3 py-2">{b.phone}</td>
                  <td className="px-3 py-2">{b.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {b.booking_date} {b.booking_time}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        backgroundColor:
                          b.status === "success" ? "#d8ecd8" : "#f3e3cf",
                        color: b.status === "success" ? "#2e6b2e" : "#8a5a1a",
                      }}
                    >
                      {b.status === "success" ? "Success" : "Pending"}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(b.created_at).toLocaleString("ru-RU")}
                  </td>
                  <td className="px-3 py-2">{b.key_phrase_attempt || "—"}</td>
                  <td className="px-3 py-2">
                    {attempts.length === 0 ? (
                      "—"
                    ) : (
                      <ul className="space-y-1 max-w-[220px]">
                        {attempts.map((a, i) => (
                          <li key={i} className="text-xs opacity-80">
                            «{a.phrase}»
                            {a.at && (
                              <span className="opacity-60">
                                {" "}
                                ({new Date(a.at).toLocaleString("ru-RU")})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center opacity-70" style={{ color: BROWN }}>
                  Пока пусто
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ScheduleTab() {
  const list = useServerFn(listPanelSlots);
  const save = useServerFn(setPanelDaySlots);
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["panel-slots"],
    queryFn: () => list(),
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const byDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const s of data?.slots ?? []) {
      if (!s.is_active) continue;
      (map[s.slot_date] ||= []).push(s.slot_time);
    }
    return map;
  }, [data]);

  const workingDays = useMemo(
    () =>
      Object.keys(byDate)
        .filter((d) => byDate[d].length > 0)
        .map((d) => new Date(d + "T00:00:00")),
    [byDate],
  );

  function openDay(d: Date) {
    const iso = toISO(d);
    setSelected(iso);
    setChecked(byDate[iso] ?? []);
  }

  function toggle(t: string) {
    setChecked((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  async function submit() {
    if (!selected) return;
    setSaving(true);
    try {
      await save({ data: { date: selected, times: checked } });
      await qc.invalidateQueries({ queryKey: ["panel-slots"] });
      setSelected(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-sm mb-4 opacity-80" style={{ color: BROWN }}>
        Выберите дату в календаре, чтобы настроить доступное время. Зелёный —
        рабочий день, серый — выходной.
      </p>
      <div
        className="inline-block bg-white rounded-2xl border p-2"
        style={{ borderColor: BORDER }}
      >
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={new Date(new Date().getFullYear() - 1, 0)}
          endMonth={new Date(new Date().getFullYear() + 5, 11)}
          onSelect={(d) => d && openDay(d)}
          modifiers={{ working: workingDays }}
          modifiersStyles={{
            working: { backgroundColor: "#dcecd8", color: BROWN },
          }}
          className="pointer-events-auto"
        />
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl border p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto"
            style={{ borderColor: BORDER }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl mb-3" style={{ color: BROWN }}>
              {new Date(selected + "T00:00:00").toLocaleDateString("ru-RU", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>
            <p className="text-xs opacity-70 mb-2" style={{ color: BROWN }}>
              Выберите доступное время (00:00–23:00)
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {HOUR_SLOTS.map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: BROWN }}
                >
                  <input
                    type="checkbox"
                    checked={checked.includes(t)}
                    onChange={() => toggle(t)}
                  />
                  {t}
                </label>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg px-4 py-2 border text-sm"
                style={{ borderColor: BORDER, color: BROWN }}
              >
                Отмена
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="rounded-lg px-4 py-2 font-display text-sm"
                style={{ backgroundColor: BROWN, color: "#fff" }}
              >
                {saving ? "..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
