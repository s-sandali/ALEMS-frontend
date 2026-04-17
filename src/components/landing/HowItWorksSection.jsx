import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STEPS } from "../../data/landingData";

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorksSection() {
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const stepsRef = useRef([]);
    const lineRef = useRef(null);

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

            stepsRef.current.forEach((step, i) => {
                if (!step) return;
                gsap.fromTo(
                    step,
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.7,
                        delay: i * 0.2,
                        ease: "power3.out",
                        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
                    }
                );
            });

            if (lineRef.current) {
                gsap.fromTo(
                    lineRef.current,
                    { scaleX: 0 },
                    {
                        scaleX: 1,
                        duration: 1.2,
                        ease: "power2.out",
                        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="how-it-works"
            ref={sectionRef}
            className="py-24"
            style={{ background: "var(--bg)" }}
        >
            <div className="max-w-[1200px] mx-auto px-6">
                <div ref={titleRef} className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>
                        How It Works
                    </p>
                    <h2 className="text-4xl lg:text-5xl font-bold text-text-primary tracking-tight">
                        From confused to{" "}
                        <span className="gradient-text">confident in 3 steps</span>
                    </h2>
                </div>

                <div className="relative grid md:grid-cols-3 gap-8">
                    {/* Connecting line (desktop) */}
                    <div className="hidden md:block absolute top-10 left-[17%] right-[17%] h-0.5 z-0">
                        <div
                            ref={lineRef}
                            style={{
                                height: "2px",
                                background: "linear-gradient(90deg, var(--primary), #a8e600, var(--primary))",
                                transformOrigin: "left",
                                scaleX: 0,
                            }}
                        />
                    </div>

                    {STEPS.map((step, i) => (
                        <div
                            key={step.num}
                            ref={(el) => (stepsRef.current[i] = el)}
                            className="relative flex flex-col items-center text-center z-10"
                        >
                            {/* Number circle */}
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center mb-6 font-bold text-2xl text-black relative"
                                style={{
                                    background: "rgba(var(--primary-rgb),0.15)",
                                    border: "2px solid rgba(var(--primary-rgb),0.4)",
                                    boxShadow: "0 0 24px rgba(var(--primary-rgb),0.2)",
                                    color: "var(--primary)",
                                }}
                            >
                                {step.num}
                            </div>

                            <div className="glass rounded-2xl p-6 w-full">
                                <h3 className="text-xl font-semibold text-text-primary mb-3">{step.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

