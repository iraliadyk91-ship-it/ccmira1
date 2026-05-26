import { createFileRoute } from "@tanstack/react-router";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CtaButton } from "@/components/CtaButton";
import { useBooking } from "@/hooks/use-booking";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Отзывы — Целительный Центр Мира" },
      {
        name: "description",
        content:
          "Живые отзывы тех, кто прошёл путь Эко-системы «Соединись с Потоком».",
      },
      { property: "og:title", content: "Отзывы — Целительный Центр Мира" },
      {
        property: "og:description",
        content:
          "Живые отзывы тех, кто прошёл путь Эко-системы «Соединись с Потоком».",
      },
    ],
  }),
  component: TestimonialsPage,
});

const TESTIMONIALS = [
  { id: "dQw4w9WgXcQ", name: "Отзыв 1" },
  { id: "dQw4w9WgXcQ", name: "Отзыв 2" },
  { id: "dQw4w9WgXcQ", name: "Отзыв 3" },
  { id: "dQw4w9WgXcQ", name: "Отзыв 4" },
  { id: "dQw4w9WgXcQ", name: "Отзыв 5" },
];

function TestimonialsPage() {
  const { open } = useBooking();
  return (
    <div
      style={{ backgroundColor: "#f5f4f2" }}
      className="min-h-screen py-12 sm:py-20 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-4xl">
        <h1
          className="font-display text-3xl sm:text-5xl text-center mb-10 sm:mb-14"
          style={{ color: "#593110" }}
        >
          Отзывы
        </h1>
        <div className="space-y-10 sm:space-y-14">
          {TESTIMONIALS.map((t, i) => (
            <div key={i}>
              <h2
                className="font-display text-xl sm:text-2xl mb-4"
                style={{ color: "#593110" }}
              >
                {t.name}
              </h2>
              <VideoPlayer videoId={t.id} title={t.name} />
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <CtaButton onClick={open} className="w-full sm:w-1/2 max-w-[360px]" />
        </div>
      </div>
    </div>
  );
}