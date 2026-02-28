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
                            <img
                                src="/BIGO.png"
                                alt="BIGO Logo"
                                className="h-12 w-auto"
                            />
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


            </div>
        </footer>
    );
}
