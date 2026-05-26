import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listPublishedPosts } from "@/lib/blog.functions";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Блог — Целительный Центр Мира" },
      {
        name: "description",
        content:
          "Статьи и размышления о потоке, целительстве и пути возвращения к себе.",
      },
      { property: "og:title", content: "Блог — Целительный Центр Мира" },
      {
        property: "og:description",
        content:
          "Статьи и размышления о потоке, целительстве и пути возвращения к себе.",
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const fetchPosts = useServerFn(listPublishedPosts);
  const { data, isLoading } = useQuery({
    queryKey: ["published-posts"],
    queryFn: () => fetchPosts(),
  });

  return (
    <div
      style={{ backgroundColor: "#f5f4f2" }}
      className="min-h-screen py-12 sm:py-20 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-5xl">
        <h1
          className="font-display text-3xl sm:text-5xl text-center mb-10 sm:mb-14"
          style={{ color: "#593110" }}
        >
          Блог
        </h1>

        {isLoading && (
          <p className="text-center" style={{ color: "#593110" }}>
            Загрузка…
          </p>
        )}

        {!isLoading && (!data?.posts || data.posts.length === 0) && (
          <p className="text-center opacity-70" style={{ color: "#593110" }}>
            Записи скоро появятся.
          </p>
        )}

        <div className="grid gap-8 sm:gap-10 sm:grid-cols-2">
          {(data?.posts ?? []).map((p) => (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group block rounded-2xl overflow-hidden bg-white border transition-all hover:shadow-lg"
              style={{ borderColor: "#e0d6cf" }}
            >
              {p.preview_image && (
                <div
                  className="w-full aspect-[16/9] bg-center bg-cover"
                  style={{ backgroundImage: `url(${p.preview_image})` }}
                />
              )}
              <div className="p-5">
                <h2
                  className="font-display text-xl sm:text-2xl mb-2"
                  style={{ color: "#593110" }}
                >
                  {p.title}
                </h2>
                {p.short_description && (
                  <p
                    className="text-sm sm:text-base opacity-80"
                    style={{ color: "#593110" }}
                  >
                    {p.short_description}
                  </p>
                )}
                <p
                  className="mt-3 text-xs opacity-60"
                  style={{ color: "#593110" }}
                >
                  {new Date(p.publish_date).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}