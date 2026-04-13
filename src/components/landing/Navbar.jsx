import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { NAV_LINKS } from "../../data/landingData";
import {
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/clerk-react";
import { useTheme } from "../../hooks/useTheme";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
    const navRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        const onScroll = () => {
            if (navRef.current) {
                if (window.scrollY > 50) {
                    navRef.current.classList.add("nav-blur");
                } else {
                    navRef.current.classList.remove("nav-blur");
                }
            }
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            ref={navRef}
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        >
            <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <img
                        src="/BIGO.png"
                        alt="BIGO Logo"
                        className="h-16 w-auto group-hover:scale-110 transition-transform"
                    />
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) =>
                        link === "Dashboard" ? (
                            <Link
                                key={link}
                                to="/dashboard"
                                className="text-text-secondary text-sm font-medium transition-colors duration-200"
                                style={{ color: "var(--text-secondary)" }}
                                onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
                                onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
                            >
                                {link}
                            </Link>
                        ) : (
                            <a
                                key={link}
                                href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                                className="text-text-secondary text-sm font-medium transition-colors duration-200"
                                style={{ color: "var(--text-secondary)" }}
                                onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
                                onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
                            >
                                {link}
                            </a>
                        )
                    )}
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-3">
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
                    <SignedOut>
                        <Link to="/login" className="btn-secondary px-4 py-2 text-sm">
                            Sign In
                        </Link>
                        <Link to="/register" className="btn-primary px-5 py-2 text-sm">
                            Get Started
                        </Link>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "w-9 h-9",
                                },
                            }}
                        />
                    </SignedIn>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden"
                    style={{ color: "var(--text-secondary)" }}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <div className="w-6 space-y-1.5">
                        <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                        <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                    </div>
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden glass mx-4 mb-4 rounded-xl p-4 space-y-3">
                    {NAV_LINKS.map((link) =>
                        link === "Dashboard" ? (
                            <Link
                                key={link}
                                to="/dashboard"
                                className="block py-1 text-sm"
                                style={{ color: "var(--text-secondary)" }}
                                onClick={() => setMenuOpen(false)}
                            >
                                {link}
                            </Link>
                        ) : (
                            <a
                                key={link}
                                href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                                className="block py-1 text-sm"
                                style={{ color: "var(--text-secondary)" }}
                                onClick={() => setMenuOpen(false)}
                            >
                                {link}
                            </a>
                        )
                    )}
                    <div className="flex gap-2 pt-2">
                        <ThemeToggle
                            isDark={isDark}
                            onToggle={toggleTheme}
                            className="inline-flex items-center justify-center rounded-lg px-3"
                            style={{
                                border: "1px solid var(--db-border2)",
                                background: "var(--db-bg2)",
                                color: "var(--db-text)",
                            }}
                        />
                        <SignedOut>
                            <Link to="/login" className="btn-secondary flex-1 py-2 text-sm text-center" onClick={() => setMenuOpen(false)}>
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary flex-1 py-2 text-sm text-center" onClick={() => setMenuOpen(false)}>
                                Get Started
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>
                </div>
            )}
        </nav>
    );
}
