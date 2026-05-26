import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/dashboard" });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => {
        if (session) navigate({ to: "/admin/dashboard" });
      },
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin/login` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
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
          Админ {mode === "signup" ? "регистрация" : "вход"}
        </h1>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          disabled={loading}
          className="w-full rounded-lg py-2 font-display"
          style={{ backgroundColor: "#593110", color: "#fff" }}
        >
          {loading ? "..." : mode === "signup" ? "Зарегистрироваться" : "Войти"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="w-full mt-3 text-xs opacity-70"
          style={{ color: "#593110" }}
        >
          {mode === "signup" ? "Уже есть аккаунт? Войти" : "Создать аккаунт"}
        </button>
      </form>
    </div>
  );
}