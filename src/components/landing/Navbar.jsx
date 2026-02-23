import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "../../data/landingData";

export default function Navbar() {
    const navRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

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
                <a href="#" className="flex items-center gap-2 group">
                    <img
                        src="/BIGO.png"
                        alt="BIGO Logo"
                        className="h-16 w-auto group-hover:scale-110 transition-transform"
                    />
                </a>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                            className="text-text-secondary text-sm font-medium transition-colors duration-200"
                            style={{ color: "#A1A1A1" }}
                            onMouseEnter={(e) => (e.target.style.color = "#D5FF40")}
                            onMouseLeave={(e) => (e.target.style.color = "#A1A1A1")}
                        >
                            {link}
                        </a>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <button className="btn-secondary px-4 py-2 text-sm">
                        Sign In
                    </button>
                    <button className="btn-primary px-5 py-2 text-sm">
                        Get Started
                    </button>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden text-text-secondary hover:text-white"
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
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                            className="block py-1 text-sm"
                            style={{ color: "#A1A1A1" }}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link}
                        </a>
                    ))}
                    <div className="flex gap-2 pt-2">
                        <button className="btn-secondary flex-1 py-2 text-sm">Sign In</button>
                        <button className="btn-primary flex-1 py-2 text-sm">
                            Get Started
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
