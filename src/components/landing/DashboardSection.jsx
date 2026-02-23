import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BADGES, QUIZ_SCORES } from "../../data/landingData";

gsap.registerPlugin(ScrollTrigger);

export default function DashboardSection() {
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const cardRef = useRef(null);
    const xpBarRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                titleRef.current,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, scrollTrigger: { trigger: titleRef.current, start: "top 85%" } }
            );

            gsap.fromTo(
                cardRef.current,
                { y: 60, opacity: 0, scale: 0.97 },
                {
                    y: 0, opacity: 1, scale: 1, duration: 1,
                    scrollTrigger: { trigger: cardRef.current, start: "top 80%" },
                }
            );

            // XP bar fill
            ScrollTrigger.create({
                trigger: xpBarRef.current,
                start: "top 80%",
                onEnter: () => {
                    gsap.to(xpBarRef.current, { width: "72%", duration: 1.5, ease: "power2.out" });
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-24"
            style={{ background: "#0C0C0C" }}
        >
            <div className="max-w-[1200px] mx-auto px-6">
                <div ref={titleRef} className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#D5FF40" }}>
                        Student Dashboard
                    </p>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                        Your progress,{" "}
                        <span className="gradient-text">visualised</span>
                    </h2>
                    <p className="mt-4 max-w-xl mx-auto" style={{ color: "#A1A1A1" }}>
                        Track your XP, badges, and quiz performance across all algorithms in real time.
                    </p>
                </div>

                <div ref={cardRef} className="max-w-3xl mx-auto">
                    <div className="glass glow-accent rounded-3xl p-8">
                        {/* Profile row */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-black font-bold text-xl shadow-lg"
                                style={{ background: "#D5FF40" }}
                            >
                                JD
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Jane Developer</h3>
                                <p className="text-sm" style={{ color: "#A1A1A1" }}>CS Year 3 · Rank #12 on Leaderboard</p>
                            </div>
                            <div className="ml-auto text-right">
                                <div className="font-bold text-lg" style={{ color: "#D5FF40" }}>2,840 XP</div>
                                <div className="text-xs" style={{ color: "#A1A1A1" }}>Level 14</div>
                            </div>
                        </div>

                        {/* XP Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm mb-2">
                                <span style={{ color: "#A1A1A1" }}>XP Progress to Level 15</span>
                                <span className="font-semibold" style={{ color: "#D5FF40" }}>2840 / 3500 XP</span>
                            </div>
                            <div className="h-3 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
                                <div ref={xpBarRef} className="xp-bar-fill" style={{ width: "0%" }} />
                            </div>
                        </div>

                        {/* Quiz scores */}
                        <div className="mb-8">
                            <h4 className="font-semibold mb-4 text-white">Recent Quiz Scores</h4>
                            <div className="space-y-3">
                                {QUIZ_SCORES.map((qs) => (
                                    <div key={qs.algo}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span style={{ color: "#A1A1A1" }}>{qs.algo}</span>
                                            <span className="font-semibold" style={{ color: qs.color }}>{qs.score}%</span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${qs.score}%`, background: qs.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Badges */}
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Badges</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {BADGES.map((badge) => {
                                    const BadgeIcon = badge.icon;
                                    return (
                                        <div
                                            key={badge.label}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${badge.awarded
                                                ? "badge-awarded"
                                                : "opacity-40 grayscale"
                                                }`}
                                            style={{
                                                background: badge.awarded ? "rgba(213,255,64,0.08)" : "rgba(255,255,255,0.02)",
                                                border: `1px solid ${badge.awarded ? "rgba(213,255,64,0.25)" : "rgba(255,255,255,0.06)"}`,
                                            }}
                                            title={badge.label}
                                        >
                                            <BadgeIcon
                                                className="w-6 h-6"
                                                style={{ color: badge.awarded ? "#D5FF40" : "#4a4a4a" }}
                                            />
                                            <span className="text-xs text-center leading-tight" style={{ color: badge.awarded ? "#D5FF40" : "#4a4a4a" }}>
                                                {badge.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
