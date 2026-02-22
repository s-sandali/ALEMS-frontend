import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronRight, Play } from "lucide-react";
import SortingBars from "./SortingBars";

export default function HeroSection() {
    const sectionRef = useRef(null);
    const headlineRef = useRef(null);
    const subRef = useRef(null);
    const ctaRef = useRef(null);
    const badgesRef = useRef(null);
    const visualRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                headlineRef.current,
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 }
            )
                .fromTo(
                    subRef.current,
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8 },
                    "-=0.6"
                )
                .fromTo(
                    ctaRef.current,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.7 },
                    "-=0.5"
                )
                .fromTo(
                    badgesRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6 },
                    "-=0.3"
                )
                .fromTo(
                    visualRef.current,
                    { x: 60, opacity: 0, scale: 0.95 },
                    { x: 0, opacity: 1, scale: 1, duration: 1 },
                    "-=1.2"
                );

            // Floating animation for visual
            gsap.to(visualRef.current, {
                y: -12,
                duration: 3,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut",
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
            style={{ background: "#0C0C0C" }}
        >
            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(213,255,64,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(213,255,64,0.3) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Neon glow blobs */}
            <div className="neon-glow-bg absolute top-20 left-1/4" />
            <div className="neon-glow-bg absolute bottom-20 right-1/4" style={{ animationDelay: "3s", opacity: 0.07 }} />

            <div className="max-w-[1200px] mx-auto px-6 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left content */}
                    <div>


                        <h1 ref={headlineRef} className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
                            <span className="text-white">Learn Algorithms.</span>
                            <br />
                            <span className="gradient-text">Visually.</span>{" "}
                            <span className="text-white">Playfully.</span>
                        </h1>

                        <p
                            ref={subRef}
                            className="text-lg leading-relaxed mb-8 max-w-xl"
                            style={{ color: "#A1A1A1" }}
                        >
                            Step-by-step visualisations, gamified quizzes, and real-time
                            feedback — built for CS students who want to{" "}
                            <span className="text-white font-medium">truly understand algorithms.</span>
                        </p>

                        <div ref={ctaRef} className="flex flex-wrap gap-4">
                            <button className="btn-primary group flex items-center gap-2 px-6 py-3.5 text-sm font-semibold">
                                Start Learning Free
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="btn-secondary flex items-center gap-2 px-6 py-3.5 text-sm font-semibold">
                                <Play className="w-4 h-4" style={{ color: "#D5FF40" }} />
                                Watch Demo
                            </button>
                        </div>

                        {/* Badge chips */}
                        <div ref={badgesRef} className="flex flex-wrap gap-2 mt-8">
                            {["XP System", "Step Animations", "Auto-Graded Quizzes", "CI/CD Deployed"].map(
                                (chip) => (
                                    <span key={chip} className="badge-chip">
                                        {chip}
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    {/* Right visual */}
                    <div ref={visualRef} className="flex justify-center lg:justify-end">
                        <SortingBars />
                    </div>
                </div>
            </div>
        </section>
    );
}
