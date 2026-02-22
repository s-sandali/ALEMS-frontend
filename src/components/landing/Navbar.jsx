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
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-white text-sm shadow-lg group-hover:scale-110 transition-transform">
                        A
                    </div>
                    <span className="font-bold text-xl text-white">
                        AL<span className="gradient-text">EMS</span>
                    </span>
                </a>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                            className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 hover:text-blue-400"
                        >
                            {link}
                        </a>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        Sign In
                    </button>
                    <button className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25">
                        Get Started
                    </button>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden text-slate-400 hover:text-white"
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
                            className="block text-slate-300 hover:text-white py-1 text-sm"
                            onClick={() => setMenuOpen(false)}
                        >
                            {link}
                        </a>
                    ))}
                    <div className="flex gap-2 pt-2">
                        <button className="flex-1 py-2 text-sm text-slate-300 border border-slate-600 rounded-lg">Sign In</button>
                        <button className="flex-1 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-lg">
                            Get Started
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
