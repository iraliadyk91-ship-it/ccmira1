import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Phone, Loader2, Play, CalendarIcon } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  createBooking,
  getAvailableSlots,
  verifyKeyPhrase,
} from "@/lib/booking.functions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2;

function parseISODate(dateStr: string): Date | undefined {
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!iso) return undefined;

  const year = Number(iso[1]);
  const month = Number(iso[2]);
  const day = Number(iso[3]);
  const result = new Date(year, month - 1, day);

  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day
  ) {
    return undefined;
  }

  return result;
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BookingDialog({ open, onClose }: Props) {
  const navigate = useNavigate();
  const create = useServerFn(createBooking);
  const fetchSlots = useServerFn(getAvailableSlots);
  const verify = useServerFn(verifyKeyPhrase);

  const [step, setStep] = useState<Step>(1);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Slots
  const [slots, setSlots] = useState<Record<string, string[]>>({});
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Step 2
  const [phrase, setPhrase] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSlotsLoading(true);
    fetchSlots()
      .then((r) => setSlots(r.byDate))
      .catch(() => setSlots({}))
      .finally(() => setSlotsLoading(false));
  }, [open, fetchSlots]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function reset() {
    setStep(1);
    setBookingId(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setDate("");
    setTime("");
    setPhrase("");
    setFormError(null);
    setVerifyError(null);
    setVideoPlaying(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const emailValid = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  const phoneValid = /^[+]?[\d\s()-]{5,30}$/.test(phone);
  const nameValid = fullName.trim().length >= 2;
  const dateValid = !!date;
  const timeValid = !!time;

  const formValid = nameValid && phoneValid && emailValid && dateValid && timeValid;

  const availableDates = useMemo(() => Object.keys(slots).sort(), [slots]);
  const timesForDate = date ? slots[date] ?? [] : [];
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);
  const selectedDate = useMemo(() => parseISODate(date), [date]);
  const enabledDates = useMemo(
    () => availableDates.map((item) => parseISODate(item)).filter(Boolean) as Date[],
    [availableDates],
  );

  const monthRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return { start, end };
  }, []);

  async function submitBooking() {
    if (!formValid) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await create({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          booking_date: date,
          booking_time: time,
        },
      });
      setBookingId(res.id);
      setStep(2);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitPhrase() {
    if (!bookingId || !phrase.trim()) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await verify({ data: { bookingId, phrase: phrase.trim() } });
      if (res.success) {
        handleClose();
        navigate({ to: "/thank-you" });
      } else {
        setVerifyError("Фраза указана неверно, пожалуйста повторите сново.");
      }
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setVerifying(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(202, 205, 208, 0.65)" }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg my-auto rounded-2xl shadow-2xl"
        style={{ backgroundColor: "#f5f4f2", borderRadius: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Закрыть"
          className="absolute right-3 top-3 p-2 rounded-md transition-colors hover:bg-[#e6d3cc]"
          style={{ color: "#593110" }}
        >
          <X size={22} />
        </button>

        {step === 1 && (
          <div className="p-6 sm:p-8">
            <h2 className="font-display text-2xl sm:text-3xl mb-1" style={{ color: "#593110" }}>
              Забронировать звонок
            </h2>
            <p className="text-sm mb-5 opacity-80" style={{ color: "#593110" }}>
              Бесплатная консультация в Google Meet
            </p>
            <div className="space-y-3">
              <Field
                label="Имя и Фамилия"
                value={fullName}
                onChange={setFullName}
                valid={nameValid}
              />
              <Field
                label="Номер телефона"
                type="tel"
                value={phone}
                onChange={setPhone}
                valid={phoneValid}
                placeholder="+7..."
              />
              <Field
                label="Емейл"
                type="email"
                value={email}
                onChange={setEmail}
                valid={emailValid}
              />
              <div>
                <label className="block text-sm mb-1" style={{ color: "#593110" }}>
                  Выберите дату
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-between rounded-lg px-3 py-2 font-normal",
                        !date && "text-muted-foreground",
                      )}
                      style={{ borderColor: "#e0d6cf", color: "#593110", backgroundColor: "#fff" }}
                    >
                      <span>
                        {date && selectedDate
                          ? selectedDate.toLocaleDateString("ru-RU", {
                              weekday: "short",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : slotsLoading
                            ? "Загрузка..."
                            : "— выберите дату —"}
                      </span>
                      <CalendarIcon size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-[70] w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(value) => {
                        if (!value) return;
                        const iso = toISODate(value);
                        if (!availableDateSet.has(iso)) return;
                        setDate(iso);
                        setTime("");
                      }}
                      disabled={(value) => !availableDateSet.has(toISODate(value))}
                      modifiers={{ working: enabledDates }}
                      modifiersStyles={{
                        working: { backgroundColor: "#dcecd8", color: "#593110" },
                      }}
                      captionLayout="dropdown"
                      startMonth={enabledDates[0]}
                      endMonth={enabledDates[enabledDates.length - 1]}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {!slotsLoading && availableDates.length === 0 && (
                  <p className="text-xs mt-1 opacity-70" style={{ color: "#593110" }}>
                    Свободных дат пока нет. Пожалуйста, попробуйте позже.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "#593110" }}>
                  Выберите время
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={!date}
                  className="w-full rounded-lg border px-3 py-2 bg-white disabled:opacity-60"
                  style={{ borderColor: "#e0d6cf", color: "#593110" }}
                >
                  <option value="">— выберите время —</option>
                  {timesForDate.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="text-sm text-red-700">{formError}</p>
              )}

              <button
                onClick={submitBooking}
                disabled={!formValid || submitting}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg py-3 font-display text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#593110", color: "#ffffff" }}
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Phone size={18} />}
                Забронировать звонок
              </button>
              <p className="text-xs mt-2 opacity-70 leading-snug" style={{ color: "#593110" }}>
                Ваши ответы останутся полностью конфиденциальными и будут использованы исключительно для подготовки перед звонком.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 sm:p-8">
            <h2 className="font-display text-xl sm:text-2xl mb-3" style={{ color: "#593110" }}>
              Подтверждение
            </h2>
            <p className="text-sm mb-4" style={{ color: "#593110" }}>
              Время для звонка успешно забронировано. Чтобы наша встреча состоялась и
              прошла максимально эффективно, внимательно посмотрите видео до конца — там
              вы получите фразу-ключ.
            </p>
            <div
              className="relative w-full overflow-hidden rounded-xl mb-4"
              style={{ aspectRatio: "16/9", backgroundColor: "#000" }}
            >
              {videoPlaying ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&controls=1&rel=0&modestbranding=1&disablekb=1&fs=0&playsinline=1"
                  title="Видео-ключ"
                  allow="autoplay; encrypted-media"
                  allowFullScreen={false}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setVideoPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Воспроизвести"
                >
                  <span className="absolute inset-0 bg-black/40" />
                  <span
                    className="relative flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                    style={{ backgroundColor: "#c8704d" }}
                  >
                    <Play size={28} className="ml-1 text-white" fill="white" />
                  </span>
                </button>
              )}
            </div>
            <label className="block text-sm mb-1" style={{ color: "#593110" }}>
              Фраза-ключ
            </label>
            <input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 bg-white"
              style={{ borderColor: "#e0d6cf", color: "#593110" }}
              placeholder="Введите фразу-ключ"
            />
            {verifyError && (
              <p className="text-sm text-red-700 mt-2">{verifyError}</p>
            )}
            <button
              onClick={submitPhrase}
              disabled={!phrase.trim() || verifying}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg py-3 font-display text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#593110", color: "#ffffff" }}
            >
              {verifying ? <Loader2 className="animate-spin" size={18} /> : null}
              Получить ссылку на звонок
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  valid,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  valid: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1" style={{ color: "#593110" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2 bg-white"
        style={{
          borderColor: value.length > 0 && !valid ? "#b91c1c" : "#e0d6cf",
          color: "#593110",
        }}
      />
    </div>
  );
}