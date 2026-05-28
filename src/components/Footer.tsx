import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <Link
      to="/panel-login"
      aria-label="."
      style={{ backgroundColor: "#f5f4f2", color: "#CACDD0" }}
      className="fixed bottom-2 right-3 z-40 text-xs px-2 py-1 rounded select-none focus:outline-none"
    >
      ✓
    </Link>
  );
}