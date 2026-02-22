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
            style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a0f1e 100%)" }}
        >
            {/* Background grid */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Background blobs */}
            <div
                className="blob absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
            />
            <div
                className="blob absolute bottom-20 right-1/4 w-80 h-80 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", animationDelay: "3s" }}
            />

            <div className="max-w-7xl mx-auto px-6 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left content */}
                    <div>
                        {/* Top label */}
                        <div className="inline-flex items-center gap-2 badge-chip mb-6">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Now live — Group 5, SE3022
                        </div>

                        <h1 ref={headlineRef} className="text-5xl lg:text-6xl font-black leading-[1.1] mb-6">
                            <span className="text-white">Learn Algorithms.</span>
                            <br />
                            <span className="gradient-text">Visually.</span>{" "}
                            <span className="text-white">Playfully.</span>
                        </h1>

                        <p
                            ref={subRef}
                            className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl"
                        >
                            Step-by-step visualisations, gamified quizzes, and real-time
                            feedback — built for CS students who want to{" "}
                            <span className="text-slate-200 font-medium">truly understand algorithms.</span>
                        </p>

                        <div ref={ctaRef} className="flex flex-wrap gap-4">
                            <button className="group flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">
                                Start Learning Free
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3.5 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:border-blue-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5">
                                <Play className="w-4 h-4 text-blue-400" />
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
