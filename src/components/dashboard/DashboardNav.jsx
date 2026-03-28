import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { BookOpen, LayoutDashboard, List, Menu, X, Zap } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Algorithms", icon: List, path: "/algorithms" },
  { label: "Quizzes", icon: BookOpen, path: "/quizzes" },
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

  return pathname === path;
}

export default function DashboardNav({ user }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const showXpBadge = typeof user?.xpTotal === "number";
  const showAdminBadge = location.pathname.startsWith("/admin/");

  function getLinkClasses(isActive) {
    return [
      "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200",
      isActive
        ? "border-accent/30 bg-accent/10 text-accent shadow-[0_0_0_1px_rgba(213,255,64,0.05)]"
        : "border-transparent text-text-secondary hover:border-white/10 hover:bg-white/[0.03] hover:text-white",
    ].join(" ");
  }

  return (
    <nav className="sticky top-0 z-50 nav-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/BIGO.png"
            alt="BIGO Logo"
            className="h-16 w-auto transition-transform group-hover:scale-110"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map(({ label, path }) => {
            const isActive = isActivePath(location.pathname, path);

            return (
              <Link
                key={path}
                to={path}
                className={getLinkClasses(isActive)}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {showAdminBadge ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
              Admin Panel
            </div>
          ) : null}
          {showXpBadge ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
              <Zap className="h-4 w-4" />
              {user.xpTotal} XP
            </div>
          ) : null}
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
        </div>

        <button
          type="button"
          className="text-text-secondary transition-colors hover:text-white md:hidden"
          onClick={() => setMenuOpen((previousValue) => !previousValue)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="glass mx-4 mb-4 rounded-xl p-4 md:hidden">
          <div className="space-y-3">
            {navItems.map(({ label, icon: Icon, path }) => {
              const isActive = isActivePath(location.pathname, path);

              return (
                <Link
                  key={path}
                  to={path}
                  className={getLinkClasses(isActive)}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {showAdminBadge ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                  Admin Panel
                </div>
              ) : null}
              {showXpBadge ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                  <Zap className="h-4 w-4" />
                  {user.xpTotal} XP
                </div>
              ) : null}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      ) : null}
    </nav>
  );
}
