import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { BookOpen, Code2, LayoutDashboard, List, Menu, ShieldCheck, TrendingUp, X, Zap } from "lucide-react";
import { useRole } from "../../context/RoleContext";
import { useTheme } from "../../hooks/useTheme";
import ThemeToggle from "../ui/ThemeToggle";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Algorithms", icon: List, path: "/algorithms" },
  { label: "Quizzes", icon: BookOpen, path: "/quizzes" },
  { label: "Challenges", icon: Code2, path: "/coding-challenges" },
 
];

const adminNavItems = [
  { label: "Manage Quizzes", icon: BookOpen, path: "/admin/quizzes" },
  { label: "Manage Challenges", icon: Code2, path: "/admin/coding-questions" },
  { label: "Reports", icon: List, path: "/admin/reports" },
  { label: "Leaderboard", icon: TrendingUp, path: "/admin/leaderboard" },
];

function isActivePath(pathname, path) {
  if (path === "/dashboard") {
    return pathname === path;
  }

  if (path === "/algorithms") {
    return pathname === path || pathname.startsWith("/algorithms/");
  }

  if (path === "/quizzes") {
    return pathname === path
      || pathname.startsWith("/quiz/")
      || pathname.startsWith("/admin/quizzes");
  }

  if (path === "/coding-challenges") {
    return pathname === path
      || pathname.startsWith("/coding-challenges/")
      || pathname.startsWith("/admin/coding-questions");
  }

  if (path === "/admin/reports") {
    return pathname === path;
  }

  if (path === "/admin/leaderboard") {
    return pathname === path;
  }

  return pathname === path;
}

function getPrimaryLinkClasses(isActive) {
  return [
    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
    isActive
      ? "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.18)]"
      : "text-text-secondary hover:bg-white/[0.04]",
  ].join(" ");
}

function getAdminLinkClasses(isActive) {
  return [
    "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200",
    isActive
      ? "border-accent/30 bg-accent/10 text-accent shadow-[0_12px_30px_rgba(var(--primary-rgb),0.08)]"
      : "border-transparent text-text-secondary hover:border-accent/15 hover:bg-accent/[0.06] hover:text-accent",
  ].join(" ");
}

function getMobileLinkClasses(isActive) {
  return [
    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
    isActive
      ? "bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
      : "text-text-secondary hover:bg-white/[0.04]",
  ].join(" ");
}

export default function DashboardNav({ user }) {
  const location = useLocation();
  const role = useRole();
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const showXpBadge = typeof user?.xpTotal === "number";
  const isAdminRoute = location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  const isAdmin = role === "Admin";

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-2xl"
      style={{
        borderBottom: "1px solid color-mix(in srgb, var(--primary) 25%, var(--border))",
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-70" />

      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src="/BIGO.png"
            alt="BIGO Logo"
            className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
          />
          
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-3 md:flex">
          <div
            className="flex items-center gap-1 rounded-2xl p-1"
            style={{
              border: "1px solid var(--db-border)",
              background: "color-mix(in srgb, var(--surface) 82%, transparent)",
            }}
          >
            {navItems.map(({ label, path }) => {
              const isActive = isActivePath(location.pathname, path);

              return (
                <Link
                  key={path}
                  to={path}
                  className={getPrimaryLinkClasses(isActive)}
                >
                  {label}
                </Link>
              );
            })}
          </div>

        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle
            isDark={isDark}
            onToggle={toggleTheme}
            className="inline-flex items-center justify-center rounded-full p-2 transition-colors"
            style={{
              border: "1px solid var(--db-border2)",
              background: "var(--db-bg2)",
              color: "var(--db-text)",
            }}
          />
          

          {showXpBadge ? (
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold"
              style={{
                border: "1px solid color-mix(in srgb, var(--accent) 30%, var(--border))",
                background: "color-mix(in srgb, var(--surface) 78%, transparent)",
                color: "var(--db-text)",
              }}
            >
              <Zap className="h-4 w-4 text-accent" />
              {user.xpTotal} XP
            </div>
          ) : null}

          <div
            className="rounded-full p-1"
            style={{
              border: "1px solid var(--db-border2)",
              background: "var(--db-bg2)",
            }}
          >
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </div>
        </div>

        <button
          type="button"
          className="rounded-xl p-2.5 transition-colors md:hidden"
          style={{
            border: "1px solid var(--db-border2)",
            background: "var(--db-bg2)",
            color: "var(--db-text2)",
          }}
          onClick={() => setMenuOpen((previousValue) => !previousValue)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen ? (
        <div
          className="mx-4 mb-4 rounded-2xl p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
          style={{
            border: "1px solid var(--db-border2)",
            background: "color-mix(in srgb, var(--surface) 90%, transparent)",
          }}
        >
          <div>
            <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.32em]" style={{ color: "var(--db-text3)" }}>
              Navigate
            </p>
            <div className="space-y-2">
              {navItems.map(({ label, icon: Icon, path }) => {
                const isActive = isActivePath(location.pathname, path);

                return (
                  <Link
                    key={path}
                    to={path}
                    className={getMobileLinkClasses(isActive)}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>


          <div className="mt-4 flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--db-border2)" }}>
            <div className="flex flex-wrap items-center gap-2">
              {isAdminRoute ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin Mode
                </div>
              ) : null}

              {showXpBadge ? (
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold"
                  style={{
                    border: "1px solid color-mix(in srgb, var(--accent) 30%, var(--border))",
                    background: "var(--db-bg2)",
                    color: "var(--db-text)",
                  }}
                >
                  <Zap className="h-4 w-4 text-accent" />
                  {user.xpTotal} XP
                </div>
              ) : null}
            </div>

            <ThemeToggle
              isDark={isDark}
              onToggle={toggleTheme}
              className="inline-flex items-center justify-center rounded-full p-2"
              style={{
                border: "1px solid var(--db-border2)",
                background: "var(--db-bg2)",
                color: "var(--db-text)",
              }}
            />

            <div className="rounded-full p-1" style={{ border: "1px solid var(--db-border2)", background: "var(--db-bg2)" }}>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

