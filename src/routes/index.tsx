import { createFileRoute } from "@tanstack/react-router";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CtaButton } from "@/components/CtaButton";
import { useBooking } from "@/hooks/use-booking";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { open } = useBooking();
  return (
    <section style={{ backgroundColor: "#f5f4f2" }} className="min-h-screen py-12 sm:py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl sm:text-5xl text-center mb-8 sm:mb-12" style={{ color: "#593110" }}>
          Целительный Центр Мира
        </h1>
        <VideoPlayer videoId="dQw4w9WgXcQ" title="Приветствие" />
        <div className="mt-8 flex justify-center">
          <CtaButton onClick={open} className="w-1/2 sm:w-1/3 max-w-[300px]" />
        </div>
      </div>
    </section>
  );
}
