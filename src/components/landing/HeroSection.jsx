import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import SortingBars from "./SortingBars";
import { HoleBackground } from "@/components/animate-ui/components/backgrounds/hole";

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
            {/* Animated hole background */}
            <HoleBackground
                className="absolute inset-0 opacity-[0.65]"
                strokeColor="#3a4a10"
                particleRGBColor={[213, 255, 64]}
            />

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
                            className="text-lg leading-relaxed mb-10 max-w-xl"
                            style={{ color: "#f8f5f5ff" }}
                        >
                            Step-by-step visualisations, gamified quizzes, and real-time
                            feedback built for CS students who want to truly understand algorithms.
                        </p>
                        <div ref={ctaRef} className="flex flex-wrap gap-4">
                            <Link to="/register" className="btn-primary group flex items-center gap-2 px-6 py-3.5 text-sm font-semibold">
                                Get started right now!
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
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
