import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/panel-login")({
  head: () => ({ meta: [{ title: "Вход" }] }),
  component: PanelLogin,
});

const LOGIN = "Лядык Ирина";
const PASSWORD = "IamGod111";

function PanelLogin() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (login.trim() === LOGIN && password === PASSWORD) {
      try {
        sessionStorage.setItem("panel-auth", "1");
      } catch {}
      navigate({ to: "/panel" });
    } else {
      setErr("Неверный логин или пароль");
    }
  }

  return (
    <div
      style={{ backgroundColor: "#f5f4f2" }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-2xl p-6 shadow border"
        style={{ borderColor: "#e0d6cf" }}
      >
        <h1 className="font-display text-2xl mb-4" style={{ color: "#593110" }}>
          Вход
        </h1>
        <input
          required
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 mb-3"
          style={{ borderColor: "#e0d6cf", color: "#593110" }}
        />
        <input
          type="password"
          required
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 mb-3"
          style={{ borderColor: "#e0d6cf", color: "#593110" }}
        />
        {err && <p className="text-sm text-red-700 mb-2">{err}</p>}
        <button
          type="submit"
          className="w-full rounded-lg py-2 font-display"
          style={{ backgroundColor: "#593110", color: "#fff" }}
        >
          Войти
        </button>
      </form>
    </div>
  );
}