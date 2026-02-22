import { Github, ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer
            className="py-12 border-t"
            style={{ background: "#0C0C0C", borderColor: "rgba(213,255,64,0.08)" }}
        >
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    {/* Logo + tagline */}
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-black text-xs shadow"
                                style={{ background: "#D5FF40" }}
                            >
                                A
                            </div>
                            <span className="font-bold text-lg text-white">
                                AL<span className="gradient-text">EMS</span>
                            </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: "#A1A1A1" }}>
                            Algorithm Learning & Evaluation Management System
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: "#A1A1A1" }}>
                        {[
                            { label: "Privacy", href: "#" },
                            { label: "Terms", href: "#" },
                            { label: "GitHub", href: "#", icon: <Github className="w-3.5 h-3.5" /> },
                            { label: "Swagger API Docs", href: "#", icon: <ExternalLink className="w-3.5 h-3.5" /> },
                        ].map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="flex items-center gap-1.5 transition-colors"
                                style={{ color: "#A1A1A1" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#D5FF40")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#A1A1A1")}
                            >
                                {link.icon}
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-6 text-center text-sm"
                    style={{ borderColor: "rgba(213,255,64,0.06)", color: "#A1A1A1" }}>
                    © 2026 ALEMS – Group 5, SE3022 · Built with React + Vite + GSAP
                </div>
            </div>
        </footer>
    );
}
