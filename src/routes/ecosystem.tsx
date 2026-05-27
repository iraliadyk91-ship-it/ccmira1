import { createFileRoute } from "@tanstack/react-router";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CtaButton } from "@/components/CtaButton";
import { useBooking } from "@/hooks/use-booking";
import { useEffect } from "react";
import authorIllustration from "@/assets/author-illustration.png";

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
    type: "image" as const,
  },
  {
    id: "soedinis-s-potokom",
    title: 'Эко-система «Соединись с Потоком»',
    text: 'Авторская энергетическая Эко-Система — целостный путь возвращения к Себе. Пошаговое сопровождение через теорию, практики и живые встречи в потоке.',
    type: "video" as const,
  },
  {
    id: "ya-tselitel",
    title: "Я-Целитель",
    text: 'Раскрытие своей внутренней силы исцеления. Не «лечить других», а позволить потоку Жизни проходить через себя — и тем самым исцелять пространство вокруг.',
    type: "video" as const,
  },
  {
    id: "potok-sila",
    title: "Поток-Сила",
    text: 'Энергетическое ядро эко-системы. Практика соединения с потоком, который есть Сила. Тело становится проводником, ум — наблюдателем, а сердце — источником.',
    type: "video" as const,
  },
  {
    id: "perevod-suti",
    title: "Перевод Сути",
    text: 'Финальная интеграция. Перевод внутреннего опыта на язык повседневной жизни. Здесь поток воплощается в действиях, отношениях и творчестве.',
    type: "video" as const,
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
              {s.type === "image" ? (
                <div className="flex justify-center">
                  <img
                    src={authorIllustration}
                    alt={s.title}
                    className="w-full max-w-md h-auto object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <VideoPlayer videoId="dQw4w9WgXcQ" title={s.title} />
              )}
            </div>
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: "#593110" }}
            >
              {s.text}
            </p>
          </section>
        ))}

        <section className="mb-16 sm:mb-24">
          <h2
            className="font-display text-2xl sm:text-4xl mb-6 sm:mb-8 text-center"
            style={{ color: "#593110" }}
          >
            От Автора
          </h2>
          <div className="grid gap-8 sm:gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-start">
            <div className="flex justify-center md:justify-start">
              <img
                src={authorIllustration}
                alt="От Автора"
                className="w-full max-w-sm h-auto object-contain md:sticky md:top-24"
                loading="lazy"
              />
            </div>
            <div
              className="space-y-4 text-base sm:text-lg leading-relaxed"
              style={{ color: "#593110" }}
            >
              <p>
                До того как Энергетическая Эко-Система «Соединись с Потоком» была создана, Я перепробовала всё: психологические техники, расклады на картах, астрологические прогнозы, медитации, расстановки, арт-практики, световые сессии и выравнивания, регрессы, технику аяваска и многое другое… Результат был, но всегда краткосрочный. К тому же, я становилась зависимой от экспертов, тратила горы денег и, самое главное, свой ресурс на желания, реализация которых не давала того самого тотального удовлетворения.
              </p>
              <p>
                Создавая «Соединись с Потоком», моя безграничность начала открываться сама. Мой Ум перестал диктовать свои условия — я стала слышать свою Душу. Когда финальная практика была завершена, мое Тело стало ощущаться Домом. На100ящим Домом.
              </p>
              <p>
                Я познакомилась со Своей Тьмой, да так, что влюбилась в саму Себя. Я захотела танцевать с Собой, целовать, обнимать саму Себя, Мне захотелось подарить Себе МИР. И постепенно, шаг за шагом, Мир начал заполнять каждую клеточку внутри меня… и мои реакции и действия стали автоматически верными. Теперь Я сначала делаю и лишь после замечаю, как же красиво все получилось.
              </p>
              <p>
                И самое главное — теперь Я четко знаю и ощущаю, чего по на100ящему желаю, а чего точно нет и почему именно так.
              </p>
              <p>
                Создавая Энергетическую Эко-Систему «Соединись с Потоком»: Я вышла из больных отношений, посетила больше 30 стран, поняла, кто по на100ящему родной, а кто — пустышка, поняла, почему желания не приносили того самого тотального счастья. Я достала из себя список желаний моей души, мой список 100 из 100.
              </p>
              <p>
                Теперь мои запросы реализовываются сами, а я испытываю то самое тотальное наслаждение от каждого из них.
              </p>
              <p>
                Сегодня пространство Целительного Центра Мира окрылило более 100 Душ. Если ты готова вернуть себе своё тотальное, бесценное «ДА» — бронируй звонок и до встречи в Потоке.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <CtaButton onClick={open} className="w-full sm:w-1/2 max-w-[360px]" />
        </div>
      </div>
    </div>
  );
}