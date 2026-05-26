import { Phone } from "lucide-react";

interface CtaButtonProps {
  onClick: () => void;
  className?: string;
}

export function CtaButton({ onClick, className = "" }: CtaButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onClick}
      className={`group inline-flex items-center justify-center gap-3 sm:gap-4 rounded-lg font-display transition-all duration-200 active:scale-[0.98] hover:opacity-90 px-4 py-3 mx-auto ${className}`}
      style={{
        backgroundColor: "#c8704d",
        color: "#ffffff",
        height: 56,
        borderRadius: 8,
      }}
      onMouseDown={(e) => (e.currentTarget.style.backgroundColor = "#a05a3e")}
      onMouseUp={(e) => (e.currentTarget.style.backgroundColor = "#c8704d")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c8704d")}
    >
      <Phone className="shrink-0" size={22} />
      <span className="flex flex-col items-start leading-tight text-left">
        <span className="text-base sm:text-lg font-semibold break-words">
          Забронировать Звонок
        </span>
        <span className="text-[10px] sm:text-xs opacity-90 break-words">
          Бесплатная консультация в Google Meet
        </span>
      </span>
    </button>
  );
}