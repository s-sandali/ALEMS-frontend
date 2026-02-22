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
            style={{ background: "#0a0f1e" }}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div ref={titleRef} className="text-center mb-16">
                    <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">
                        Student Dashboard
                    </p>
                    <h2 className="text-4xl lg:text-5xl font-black text-white">
                        Your progress,{" "}
                        <span className="gradient-text">visualised</span>
                    </h2>
                    <p className="text-slate-400 mt-4 max-w-xl mx-auto">
                        Track your XP, badges, and quiz performance across all algorithms in real time.
                    </p>
                </div>

                <div ref={cardRef} className="max-w-3xl mx-auto">
                    <div className="glass glow-blue rounded-3xl p-8">
                        {/* Profile row */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                                JD
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Jane Developer</h3>
                                <p className="text-slate-400 text-sm">CS Year 3 · Rank #12 on Leaderboard</p>
                            </div>
                            <div className="ml-auto text-right">
                                <div className="text-blue-400 font-bold text-lg">2,840 XP</div>
                                <div className="text-slate-500 text-xs">Level 14</div>
                            </div>
                        </div>

                        {/* XP Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">XP Progress to Level 15</span>
                                <span className="text-blue-400 font-semibold">2840 / 3500 XP</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                <div ref={xpBarRef} className="xp-bar-fill" style={{ width: "0%" }} />
                            </div>
                        </div>

                        {/* Quiz scores */}
                        <div className="mb-8">
                            <h4 className="text-slate-300 font-semibold mb-4">Recent Quiz Scores</h4>
                            <div className="space-y-3">
                                {QUIZ_SCORES.map((qs) => (
                                    <div key={qs.algo}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400">{qs.algo}</span>
                                            <span className="font-semibold" style={{ color: qs.color }}>{qs.score}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
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
                            <h4 className="text-slate-300 font-semibold mb-4">Badges</h4>
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
                                                background: badge.awarded ? `${badge.color}18` : "rgba(255,255,255,0.03)",
                                                border: `1px solid ${badge.awarded ? badge.color + "40" : "rgba(255,255,255,0.08)"}`,
                                            }}
                                            title={badge.label}
                                        >
                                            <BadgeIcon
                                                className="w-6 h-6"
                                                style={{ color: badge.awarded ? badge.color : "#6b7280" }}
                                            />
                                            <span className="text-xs text-center leading-tight" style={{ color: badge.awarded ? badge.color : "#6b7280" }}>
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
