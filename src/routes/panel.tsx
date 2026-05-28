import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/panel")({
  head: () => ({ meta: [{ title: "Админ Панель" }] }),
  component: PanelPage,
});

function PanelPage() {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const auth = (() => {
      try {
        return sessionStorage.getItem("panel-auth") === "1";
      } catch {
        return false;
      }
    })();
    if (!auth) navigate({ to: "/panel-login" });
    else setOk(true);
  }, [navigate]);

  if (!ok) return null;

  return (
    <div
      style={{ backgroundColor: "#f5f4f2" }}
      className="min-h-screen px-6 py-12"
    >
      <div className="mx-auto max-w-5xl">
        <h1
          className="font-display text-3xl sm:text-5xl"
          style={{ color: "#593110" }}
        >
          Админ Панель
        </h1>
      </div>
    </div>
  );
}