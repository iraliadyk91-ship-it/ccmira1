import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getPostBySlug } from "@/lib/blog.functions";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: "Запись — Целительный Центр Мира" },
    ],
  }),
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const fetchPost = useServerFn(getPostBySlug);
  const { data, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost({ data: { slug } }),
  });

  return (
    <div
      style={{ backgroundColor: "#f5f4f2" }}
      className="min-h-screen py-12 sm:py-20 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-3xl">
        <Link
          to="/blog"
          className="inline-block mb-6 text-sm opacity-80 hover:opacity-100"
          style={{ color: "#593110" }}
        >
          ← Все записи
        </Link>

        {isLoading && <p style={{ color: "#593110" }}>Загрузка…</p>}

        {!isLoading && !data?.post && (
          <p style={{ color: "#593110" }}>Запись не найдена.</p>
        )}

        {data?.post && (
          <article>
            <h1
              className="font-display text-3xl sm:text-5xl mb-4"
              style={{ color: "#593110" }}
            >
              {data.post.title}
            </h1>
            <p
              className="text-sm opacity-60 mb-8"
              style={{ color: "#593110" }}
            >
              {new Date(data.post.publish_date).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {data.post.preview_image && (
              <img
                src={data.post.preview_image}
                alt={data.post.title}
                className="w-full rounded-2xl mb-8"
              />
            )}
            <div
              className="prose prose-lg max-w-none whitespace-pre-wrap text-base sm:text-lg leading-relaxed"
              style={{ color: "#593110" }}
            >
              {data.post.content}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}