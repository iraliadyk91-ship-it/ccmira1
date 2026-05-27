import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { AnimatedLogo } from "./AnimatedLogo";

const NAV_ITEMS = [
  { to: "/", label: "Главная страница" },
  { to: "/ecosystem", label: 'Эко-система "Соединись с Потоком"' },
  { to: "/testimonials", label: "Отзывы" },
  { to: "/blog", label: "Блог" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 border-b border-[#e0d6cf]"
        style={{ backgroundColor: "#f5f4f2" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-3 group"
            onClick={() => setOpen(false)}
          >
            <AnimatedLogo size={40} />
            <span
              className="font-display text-base sm:text-lg leading-tight"
              style={{ color: "#593110" }}
            >
              Целительный Центр Мира
            </span>
          </Link>
          <button
            onClick={() => setOpen(true)}
            aria-label="Открыть меню"
            className="p-2 rounded-md transition-colors hover:bg-[#e6d3cc]"
            style={{ color: "#593110" }}
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: "#f5f4f2" }}
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-b border-[#e0d6cf]">
            <Link
              to="/"
              className="flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <AnimatedLogo size={40} />
              <span
                className="font-display text-base sm:text-lg"
                style={{ color: "#593110" }}
              >
                Целительный Центр Мира
              </span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрыть меню"
              className="p-2 rounded-md transition-colors hover:bg-[#e6d3cc]"
              style={{ color: "#593110" }}
            >
              <X size={32} />
            </button>
          </div>
          <nav className="flex flex-col items-start gap-6 sm:gap-8 px-4 sm:px-6 pt-8 pb-10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="font-display text-2xl sm:text-4xl text-left transition-colors duration-200"
                style={{ color: "#593110" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e6d3cc")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#593110")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}