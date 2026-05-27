import { createFileRoute } from "@tanstack/react-router";
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
    <div
      style={{ background: "linear-gradient(to bottom, #f5f4f2 0%, #f5f4f2 40%, #E6D3CC 70%, #E6D3CC 100%)" }}
      className="min-h-screen py-12 sm:py-20 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-4xl">
        <h1
          className="font-display text-3xl sm:text-5xl text-center mb-10 sm:mb-14"
          style={{ color: "#593110" }}
        >
          Эко-система «Соединись с Потоком»
        </h1>

        <div className="flex justify-center mb-12 sm:mb-16">
          <img
            src={authorIllustration}
            alt="Соединись с Потоком"
            className="w-full max-w-md h-auto object-contain"
            loading="lazy"
          />
        </div>

        <section className="mb-16 sm:mb-24">
          <h2
            className="font-display text-3xl sm:text-5xl mb-8 sm:mb-10 text-center"
            style={{ color: "#593110" }}
          >
            От Автора
          </h2>
          <div
            className="space-y-5 text-base sm:text-lg leading-relaxed"
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
              Создавая энергетическую эко-систему «Соединись с Потоком»: Я вышла из больных отношений, посетила больше 30 стран, поняла, кто по на100ящему родной, а кто — пустышка, поняла, почему желания не приносили того самого тотального счастья. Я достала из себя список желаний моей души, мой список 100 из 100.
            </p>
            <p>
              Теперь мои запросы реализовываются сами, а я испытываю то самое тотальное наслаждение от каждого из них.
            </p>
            <p>
              Сегодня пространство Целительного Центра Мира окрылило более 100 Душ. Если ты желаешь вернуть себе своё тотальное, бесценное «ДА» — бронируй звонок и до встречи в Потоке.
            </p>
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <CtaButton onClick={open} className="w-full sm:w-1/2 max-w-[360px]" />
        </div>
      </div>
    </div>
  );
}