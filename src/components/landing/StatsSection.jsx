import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STATS } from "../../data/landingData";

gsap.registerPlugin(ScrollTrigger);

export default function StatsSection() {
    const sectionRef = useRef(null);
    const counterRefs = useRef([]);
    const triggered = useRef(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: "top 75%",
                onEnter: () => {
                    if (triggered.current) return;
                    triggered.current = true;

                    STATS.forEach((stat, i) => {
                        const el = counterRefs.current[i];
                        if (!el) return;
                        const obj = { val: 0 };
                        gsap.to(obj, {
                            val: stat.value,
                            duration: 2,
                            ease: "power2.out",
                            delay: i * 0.15,
                            onUpdate: () => {
                                el.textContent = Math.floor(obj.val) + stat.suffix;
                            },
                        });
                    });
                },
            });

            gsap.fromTo(
                sectionRef.current.querySelectorAll(".stat-card"),
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1, stagger: 0.12, duration: 0.7,
                    scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-20"
            style={{ background: "linear-gradient(135deg, #0a0f1e, #1e1b4b, #0a0f1e)" }}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {STATS.map((stat, i) => {
                        const IconComp = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="stat-card glass rounded-2xl p-6 flex flex-col items-center text-center"
                            >
                                <IconComp className="w-8 h-8 text-blue-400 mb-3 opacity-80" />
                                <div
                                    ref={(el) => (counterRefs.current[i] = el)}
                                    className="counter-num gradient-text"
                                >
                                    0{stat.suffix}
                                </div>
                                <p className="text-slate-400 text-sm mt-2">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
