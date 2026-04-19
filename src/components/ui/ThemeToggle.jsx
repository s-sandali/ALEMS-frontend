import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ isDark, onToggle, className = "" }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={className}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
