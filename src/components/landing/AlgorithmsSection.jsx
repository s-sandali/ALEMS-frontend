import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight } from "lucide-react";
import { ALGORITHMS } from "../../data/landingData";
import ElectricBorder from "../ui/ElectricBorder";

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
            style={{ background: "#0C0C0C" }}
        >
            <div className="max-w-[1200px] mx-auto px-6">
                <div ref={titleRef} className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#D5FF40" }}>
                        Core Curriculum
                    </p>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                        Master Algorithms.{" "}
                        <span className="gradient-text">Gain Infinite Insight.</span>
                    </h2>
                    <p className="mt-4 max-w-xl mx-auto" style={{ color: "#A1A1A1" }}>
                        Master the fundamentals through interactive exploration and guided challenges.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ALGORITHMS.map((algo, i) => (
                        <div
                            key={algo.name}
                            ref={(el) => (cardsRef.current[i] = el)}
                        >
                            <ElectricBorder
                                color="#D5FF40"
                                speed={1}
                                chaos={0.12}
                                borderRadius={16}
                                className="cursor-pointer h-full"
                            >
                                <div
                                    className="p-6 h-full"
                                    style={{ background: "#151515", borderRadius: "inherit" }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                        style={{ background: "rgba(213,255,64,0.08)", border: "1px solid rgba(213,255,64,0.15)" }}
                                    >
                                        <algo.icon className="w-6 h-6" style={{ color: "#D5FF40" }} />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2">{algo.name}</h3>
                                    <p className="text-sm mb-4 leading-relaxed" style={{ color: "#A1A1A1" }}>{algo.desc}</p>

                                    <div className="flex items-center justify-between">
                                        <span
                                            className="font-mono text-sm font-bold"
                                            style={{ color: "#D5FF40" }}
                                        >
                                            {algo.complexity}
                                        </span>
                                        <span
                                            className="text-xs font-semibold px-3 py-1 rounded-full text-black"
                                            style={{ background: "#D5FF40" }}
                                        >
                                            {algo.tag}
                                        </span>
                                    </div>

                                    <button
                                        className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                                        style={{
                                            background: "rgba(213,255,64,0.08)",
                                            color: "#D5FF40",
                                            border: "1px solid rgba(213,255,64,0.2)",
                                        }}
                                    >
                                        Explore <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </ElectricBorder>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
