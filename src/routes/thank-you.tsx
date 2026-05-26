import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Спасибо — Целительный Центр Мира" },
      { name: "description", content: "Ваше бронирование подтверждено." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  return (
    <div
      style={{ backgroundColor: "#f5f4f2" }}
      className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6"
    >
      <div className="max-w-2xl text-center">
        <h1
          className="font-display text-3xl sm:text-5xl mb-6"
          style={{ color: "#593110" }}
        >
          Благодарю Вас
        </h1>
        <p
          className="text-base sm:text-lg leading-relaxed mb-4"
          style={{ color: "#593110" }}
        >
          Ваша консультация успешно забронирована. Ссылка на подключение к
          Google Meet и подробная инструкция отправлены на ваш email.
        </p>
        <p
          className="text-base sm:text-lg leading-relaxed mb-10"
          style={{ color: "#593110" }}
        >
          До встречи в Потоке.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-display"
          style={{ backgroundColor: "#593110", color: "#fff" }}
        >
          На главную
        </Link>
      </div>
    </div>
  );
}