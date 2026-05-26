import { createFileRoute } from "@tanstack/react-router";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CtaButton } from "@/components/CtaButton";
import { useBooking } from "@/hooks/use-booking";
import { useEffect } from "react";

export const Route = createFileRoute("/ecosystem")({
  head: () => ({
    meta: [
      { title: 'Эко-система «Соединись с Потоком» — Целительный Центр Мира' },
      {
        name: "description",
        content:
          'Энергетическая Эко-Система «Соединись с Потоком». Я=Всё, Я-Целитель, Поток-Сила, Перевод Сути и путь к себе настоящей.',
      },
      { property: "og:title", content: 'Эко-система «Соединись с Потоком»' },
      {
        property: "og:description",
        content:
          'Энергетическая Эко-Система «Соединись с Потоком» — авторский путь Целительного Центра Мира.',
      },
    ],
  }),
  component: EcosystemPage,
});

const SECTIONS = [
  {
    id: "ya-vse",
    title: "Я = Всё",
    text: 'Первая ступень — осознание своей целостности. Здесь мы соединяемся с базовым принципом единства: всё, что я вижу в мире, есть отражение меня. Это вход в поток.',
  },
  {
    id: "soedinis-s-potokom",
    title: 'Эко-система «Соединись с Потоком»',
    text: 'Авторская энергетическая Эко-Система — целостный путь возвращения к Себе. Пошаговое сопровождение через теорию, практики и живые встречи в потоке.',
  },
  {
    id: "ya-tselitel",
    title: "Я-Целитель",
    text: 'Раскрытие своей внутренней силы исцеления. Не «лечить других», а позволить потоку Жизни проходить через себя — и тем самым исцелять пространство вокруг.',
  },
  {
    id: "potok-sila",
    title: "Поток-Сила",
    text: 'Энергетическое ядро эко-системы. Практика соединения с потоком, который есть Сила. Тело становится проводником, ум — наблюдателем, а сердце — источником.',
  },
  {
    id: "perevod-suti",
    title: "Перевод Сути",
    text: 'Финальная интеграция. Перевод внутреннего опыта на язык повседневной жизни. Здесь поток воплощается в действиях, отношениях и творчестве.',
  },
] as const;

function EcosystemPage() {
  const { open } = useBooking();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, []);

  return (
    <div style={{ backgroundColor: "#f5f4f2" }} className="min-h-screen py-12 sm:py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1
          className="font-display text-3xl sm:text-5xl text-center mb-10 sm:mb-14"
          style={{ color: "#593110" }}
        >
          Эко-система «Соединись с Потоком»
        </h1>

        {SECTIONS.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className="scroll-mt-24 mb-16 sm:mb-24"
          >
            <h2
              className="font-display text-2xl sm:text-4xl mb-5 sm:mb-7"
              style={{ color: "#593110" }}
            >
              {i + 1}. {s.title}
            </h2>
            <div className="mb-6">
              <VideoPlayer videoId="dQw4w9WgXcQ" title={s.title} />
            </div>
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: "#593110" }}
            >
              {s.text}
            </p>
          </section>
        ))}

        <div className="mt-8 flex justify-center">
          <CtaButton onClick={open} className="w-full sm:w-1/2 max-w-[360px]" />
        </div>
      </div>
    </div>
  );
}