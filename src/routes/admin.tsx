import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Админ — Целительный Центр Мира" }, { name: "robots", content: "noindex" }] }),
  component: () => <Outlet />,
});