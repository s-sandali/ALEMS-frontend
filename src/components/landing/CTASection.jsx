import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight, Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
    const sectionRef = useRef(null);
    const contentRef = useRef(null);
    const blob1Ref = useRef(null);
    const blob2Ref = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                contentRef.current,
                { y: 50, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 1,
                    scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
                }
            );

            // Blob animations
            gsap.to(blob1Ref.current, {
                x: 40, y: -30, scale: 1.1,
                duration: 6, yoyo: true, repeat: -1, ease: "power1.inOut",
            });
            gsap.to(blob2Ref.current, {
                x: -40, y: 30, scale: 0.9,
                duration: 8, yoyo: true, repeat: -1, ease: "power1.inOut",
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="cta-bg py-32 relative overflow-hidden">
            {/* Animated neon blobs */}
            <div
                ref={blob1Ref}
                className="absolute top-10 left-1/4 w-80 h-80 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, #D5FF40, transparent 70%)" }}
            />
            <div
                ref={blob2Ref}
                className="absolute bottom-10 right-1/4 w-64 h-64 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, #D5FF40, transparent 70%)" }}
            />
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.05]"
                style={{ background: "radial-gradient(circle, #D5FF40, transparent 70%)" }}
            />

            <div ref={contentRef} className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
                <div className="inline-flex items-center gap-2 badge-chip mb-6">
                    <Star className="w-3 h-3" style={{ color: "#D5FF40", fill: "#D5FF40" }} />
                    Free for all university students
                </div>

                <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                    Ready to visualise algorithms{" "}
                    <span className="gradient-text">like never before?</span>
                </h2>

                <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: "#A1A1A1" }}>
                    Join students already learning smarter with ALEMS.
                </p>

                <button className="btn-primary group inline-flex items-center gap-3 px-8 py-4 text-lg font-bold rounded-2xl shadow-2xl">
                    Get Started — It's Free
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-8 flex justify-center gap-8 text-sm" style={{ color: "#A1A1A1" }}>
                    <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#D5FF40" }} />
                        No credit card required
                    </span>
                    <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#D5FF40" }} />
                        Instant access
                    </span>
                    <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#D5FF40" }} />
                        4 algorithms free
                    </span>
                </div>
            </div>
        </section>
    );
}
