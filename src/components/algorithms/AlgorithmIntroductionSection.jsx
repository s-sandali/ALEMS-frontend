import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "../../lib/utils";
import { getAlgorithmIntroduction } from "../../lib/algorithmPresentation";

gsap.registerPlugin(ScrollTrigger);

export default function AlgorithmIntroductionSection({
    algorithmName,
    steps,
    currentStepIndex,
    onStepChange,
}) {
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const cardsRef = useRef([]);
    const introduction = useMemo(
        () => getAlgorithmIntroduction(algorithmName),
        [algorithmName],
    );

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                titleRef.current,
                { y: 24, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.7,
                    ease: "power2.out",
                    scrollTrigger: { trigger: titleRef.current, start: "top 85%" },
                },
            );

            cardsRef.current.forEach((card, index) => {
                if (!card) {
                    return;
                }

                gsap.fromTo(
                    card,
                    { y: 32, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.55,
                        delay: index * 0.08,
                        ease: "power2.out",
                        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
                    },
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const cardTargets = useMemo(
        () => introduction.steps.map((item, index) => {
            const matchedStepIndex = steps.findIndex(
                (step) => step.actionLabel?.toLowerCase() === item.matchAction,
            );

            return {
                ...item,
                targetIndex: matchedStepIndex >= 0 ? matchedStepIndex : Math.min(index, Math.max(steps.length - 1, 0)),
            };
        }),
        [introduction.steps, steps],
    );

    const activeCardIndex = useMemo(() => {
        const matchedCardIndex = cardTargets.findIndex((item) => item.targetIndex === currentStepIndex);
        return matchedCardIndex >= 0 ? matchedCardIndex : 0;
    }, [cardTargets, currentStepIndex]);

    return (
        <section
            ref={sectionRef}
            className="rounded-[2rem] border p-6 sm:p-8 lg:p-10"
            style={{ borderColor: "var(--db-border)", background: "var(--surface)" }}
        >
            <div ref={titleRef} className="max-w-4xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                    {introduction.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                    {introduction.title}
                </h2>

                <div className="mt-6 space-y-4 text-base leading-8 text-text-secondary">
                    {introduction.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {cardTargets.map((item, index) => {
                    const isActive = index === activeCardIndex;

                    return (
                        <button
                            key={item.num}
                            type="button"
                            ref={(element) => {
                                cardsRef.current[index] = element;
                            }}
                            onClick={() => onStepChange(item.targetIndex)}
                            className={cn(
                                "rounded-[1.5rem] border p-5 text-left transition-all duration-300",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                                isActive
                                    ? "border-accent bg-accent/8 shadow-[0_0_0_1px_rgba(var(--primary-rgb),0.1)]"
                                    : "hover:border-accent/30",
                            )}
                            style={!isActive ? { borderColor: "var(--db-border2)", background: "var(--surface)" } : undefined}
                        >
                            <div className={cn(
                                "text-4xl font-bold tracking-tight",
                                isActive ? "text-accent" : "text-accent/45",
                            )}>
                                {item.num}
                            </div>

                            <h3 className="mt-4 text-xl font-semibold text-text-primary">
                                {item.title}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-text-secondary">
                                {item.desc}
                            </p>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

