import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer
      style={{ backgroundColor: "#f5f4f2" }}
      className="w-full px-8 sm:px-12 py-4 flex justify-end"
    >
      <Link
        to="/panel-login"
        aria-label="."
        style={{ backgroundColor: "#f5f4f2", color: "#CACDD0" }}
        className="text-xs px-2 py-1 rounded select-none focus:outline-none"
      >
        ✓
      </Link>
    </footer>
  );
}