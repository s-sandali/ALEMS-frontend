import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FEATURES } from "../../data/landingData";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesSection() {
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const tilesRef = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                titleRef.current,
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.8,
                    scrollTrigger: { trigger: titleRef.current, start: "top 85%" },
                }
            );

            tilesRef.current.forEach((tile, i) => {
                if (!tile) return;
                gsap.fromTo(
                    tile,
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        delay: i * 0.1,
                        ease: "power3.out",
                        scrollTrigger: { trigger: tile, start: "top 90%" },
                    }
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="features"
            ref={sectionRef}
            className="py-24"
            style={{ background: "#0C0C0C" }}
        >
            <div className="max-w-[1200px] mx-auto px-6">
                <div ref={titleRef} className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#D5FF40" }}>
                        Platform Features
                    </p>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                        Everything you need to{" "}
                        <span className="gradient-text">master algorithms</span>
                    </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feat, i) => {
                        const IconComp = feat.Icon;
                        return (
                            <div
                                key={feat.title}
                                ref={(el) => (tilesRef.current[i] = el)}
                                className="feature-card glass rounded-2xl p-6"
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: "rgba(213,255,64,0.08)", border: "1px solid rgba(213,255,64,0.15)" }}
                                >
                                    <IconComp className="w-6 h-6" style={{ color: "#D5FF40" }} />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: "#A1A1A1" }}>{feat.desc}</p>
                                <div
                                    className="mt-4 h-0.5 w-0 rounded-full transition-all duration-500"
                                    style={{ background: "linear-gradient(90deg, #D5FF40, transparent)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.width = "100%")}
                                    onMouseLeave={(e) => (e.currentTarget.style.width = "0")}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
