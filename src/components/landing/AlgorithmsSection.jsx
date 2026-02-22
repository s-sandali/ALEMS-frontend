import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight } from "lucide-react";
import { ALGORITHMS } from "../../data/landingData";

gsap.registerPlugin(ScrollTrigger);

export default function AlgorithmsSection() {
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const cardsRef = useRef([]);

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

            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                gsap.fromTo(
                    card,
                    { y: 60, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.7,
                        delay: i * 0.15,
                        ease: "power3.out",
                        scrollTrigger: { trigger: card, start: "top 88%" },
                    }
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="algorithms"
            ref={sectionRef}
            className="py-24 relative"
            style={{ background: "#0d1b2a" }}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div ref={titleRef} className="text-center mb-16">
                    <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">
                        Core Curriculum
                    </p>
                    <h2 className="text-4xl lg:text-5xl font-black text-white">
                        4 Algorithms.{" "}
                        <span className="gradient-text-blue-cyan">Infinite Insight.</span>
                    </h2>
                    <p className="text-slate-400 mt-4 max-w-xl mx-auto">
                        Master the fundamentals through interactive exploration and guided challenges.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ALGORITHMS.map((algo, i) => (
                        <div
                            key={algo.name}
                            ref={(el) => (cardsRef.current[i] = el)}
                            className="algo-card glass rounded-2xl p-6 cursor-pointer"
                            style={{ borderColor: `${algo.accentColor}33` }}
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                                style={{ background: `${algo.accentColor}15`, border: `1px solid ${algo.accentColor}33` }}
                            >
                                {algo.icon}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{algo.name}</h3>
                            <p className="text-slate-400 text-sm mb-4 leading-relaxed">{algo.desc}</p>

                            <div className="flex items-center justify-between">
                                <span
                                    className="font-mono text-sm font-bold"
                                    style={{ color: algo.accentColor }}
                                >
                                    {algo.complexity}
                                </span>
                                <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${algo.tagColor} text-white`}
                                >
                                    {algo.tag}
                                </span>
                            </div>

                            <button
                                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                                style={{
                                    background: `${algo.accentColor}18`,
                                    color: algo.accentColor,
                                    border: `1px solid ${algo.accentColor}30`,
                                }}
                            >
                                Explore <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
