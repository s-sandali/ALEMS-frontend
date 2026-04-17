import { Github, ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer
            className="py-12 border-t"
            style={{ background: "var(--bg)", borderColor: "rgba(var(--primary-rgb),0.08)" }}
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
                        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                            Algorithm Learning & Evaluation Management System
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {[
                            { label: "Privacy", href: "#" },
                            { label: "Terms", href: "#" },

                        ].map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="flex items-center gap-1.5 transition-colors"
                                style={{ color: "var(--text-secondary)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
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

