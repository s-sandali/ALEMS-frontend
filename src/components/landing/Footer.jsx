import { Github, ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer
            className="py-12 border-t"
            style={{ background: "#0a0f1e", borderColor: "rgba(59,130,246,0.1)" }}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    {/* Logo + tagline */}
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-white text-xs shadow">
                                A
                            </div>
                            <span className="font-bold text-lg text-white">
                                AL<span className="gradient-text">EMS</span>
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                            Algorithm Learning & Evaluation Management System
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
                        {[
                            { label: "Privacy", href: "#" },
                            { label: "Terms", href: "#" },
                            { label: "GitHub", href: "#", icon: <Github className="w-3.5 h-3.5" /> },
                            { label: "Swagger API Docs", href: "#", icon: <ExternalLink className="w-3.5 h-3.5" /> },
                        ].map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                            >
                                {link.icon}
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-6 text-center text-slate-500 text-sm"
                    style={{ borderColor: "rgba(59,130,246,0.08)" }}>
                    © 2026 ALEMS – Group 5, SE3022 · Built with React + Vite + GSAP
                </div>
            </div>
        </footer>
    );
}
