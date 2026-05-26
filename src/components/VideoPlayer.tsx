import { useState } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  hideControls?: boolean;
}

export function VideoPlayer({ videoId, title = "Видео", hideControls = false }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    ...(hideControls ? { controls: "0", disablekb: "1", fs: "0" } : {}),
  });

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-lg"
      style={{ aspectRatio: "16/9", backgroundColor: "#000" }}
    >
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={!hideControls}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex items-center justify-center"
          aria-label="Воспроизвести видео"
          style={{
            backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />
          <span
            className="relative flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: "#c8704d" }}
          >
            <Play size={36} className="ml-1 text-white" fill="white" />
          </span>
        </button>
      )}
    </div>
  );
}