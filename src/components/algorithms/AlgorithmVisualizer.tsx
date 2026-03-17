import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";

import { cn } from "@/lib/utils";
import type { AlgorithmSimulationStep } from "@/lib/api";

type LearningMode = "auto" | "practice";
type PracticeFeedbackTone = "correct" | "incorrect" | null;

type AlgorithmVisualizerProps = {
    steps: AlgorithmSimulationStep[];
    currentStepIndex: number;
    mode?: LearningMode;
    practiceArray?: number[];
    selectedIndices?: number[];
    suggestedIndices?: number[];
    feedbackIndices?: number[];
    feedbackTone?: PracticeFeedbackTone;
    feedbackVersion?: number;
    hintMessage?: string;
    practiceCompleted?: boolean;
    isInteractionDisabled?: boolean;
    onBarClick?: (index: number) => void;
    className?: string;
};

type VisualBar = {
    id: string;
    value: number;
};

const layoutTransition = {
    type: "spring" as const,
    stiffness: 360,
    damping: 30,
    mass: 0.9,
};

const reducedMotionTransition: Transition = { duration: 0 };

const activeBarTransition: Transition = {
    layout: layoutTransition,
    height: { duration: 0.32, ease: "easeInOut" },
    y: { duration: 0.22, ease: "easeOut" },
    scale: { duration: 0.22, ease: "easeOut" },
};

function getStepTone(step: AlgorithmSimulationStep | undefined) {
    const action = step?.actionLabel.trim().toLowerCase() ?? "";

    if (action.includes("sorted") || action.includes("complete")) {
        return {
            badgeClassName: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
            activeBarClassName: "from-emerald-400 to-emerald-500 shadow-[0_0_18px_rgba(52,211,153,0.3)]",
            emphasisLabel: "Sorted",
        };
    }

    if (action.includes("swap")) {
        return {
            badgeClassName: "border-red-400/30 bg-red-400/10 text-red-200",
            activeBarClassName: "from-red-400 to-red-500 shadow-[0_0_18px_rgba(248,113,113,0.35)]",
            emphasisLabel: "Swapped",
        };
    }

    return {
        badgeClassName: "border-accent/20 bg-accent/10 text-accent",
        activeBarClassName: "from-accent to-accent/70 shadow-[0_0_18px_rgba(213,255,64,0.3)]",
        emphasisLabel: "Comparing",
    };
}

function getPracticeTone(feedbackTone: PracticeFeedbackTone, practiceCompleted: boolean) {
    if (practiceCompleted) {
        return {
            badgeClassName: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
            activeBarClassName: "from-emerald-400 to-emerald-500 shadow-[0_0_18px_rgba(52,211,153,0.3)]",
            emphasisLabel: "Practice complete",
            actionLabel: "complete",
        };
    }

    if (feedbackTone === "incorrect") {
        return {
            badgeClassName: "border-red-400/30 bg-red-400/10 text-red-200",
            activeBarClassName: "from-red-400 to-red-500 shadow-[0_0_18px_rgba(248,113,113,0.35)]",
            emphasisLabel: "Try again",
            actionLabel: "incorrect step",
        };
    }

    if (feedbackTone === "correct") {
        return {
            badgeClassName: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
            activeBarClassName: "from-emerald-400 to-emerald-500 shadow-[0_0_18px_rgba(52,211,153,0.3)]",
            emphasisLabel: "Correct move",
            actionLabel: "validated swap",
        };
    }

    return {
        badgeClassName: "border-sky-400/30 bg-sky-400/10 text-sky-100",
        activeBarClassName: "from-sky-400 to-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.28)]",
        emphasisLabel: "Your turn",
        actionLabel: "practice mode",
    };
}

function formatActionLabel(actionLabel: string) {
    return actionLabel
        .split(/[_\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function reconcileBars(previousBars: VisualBar[], nextValues: number[], createBar: (value: number) => VisualBar) {
    const availableBars = new Map<number, VisualBar[]>();

    previousBars.forEach((bar) => {
        const queue = availableBars.get(bar.value) ?? [];
        queue.push(bar);
        availableBars.set(bar.value, queue);
    });

    return nextValues.map((value) => {
        const queue = availableBars.get(value);
        const reusedBar = queue?.shift();

        return reusedBar ?? createBar(value);
    });
}

function getSortedIndices(step: AlgorithmSimulationStep | undefined, totalValues: number) {
    const action = step?.actionLabel.trim().toLowerCase() ?? "";

    if (action.includes("complete")) {
        return new Set(Array.from({ length: totalValues }, (_, index) => index));
    }

    if (action.includes("sorted")) {
        return new Set(step?.activeIndices ?? []);
    }

    return new Set<number>();
}

function AlgorithmVisualizer({
    steps,
    currentStepIndex,
    mode = "auto",
    practiceArray = [],
    selectedIndices = [],
    suggestedIndices = [],
    feedbackIndices = [],
    feedbackTone = null,
    feedbackVersion = 0,
    hintMessage = "",
    practiceCompleted = false,
    isInteractionDisabled = false,
    onBarClick,
    className,
}: AlgorithmVisualizerProps) {
    const shouldReduceMotion = useReducedMotion();
    const nextBarIdRef = useRef(0);

    const safeIndex = steps.length === 0
        ? 0
        : Math.min(Math.max(currentStepIndex, 0), steps.length - 1);
    const currentStep = steps[safeIndex];
    const isPracticeMode = mode === "practice";
    const values = isPracticeMode
        ? practiceArray
        : (currentStep?.arrayState ?? []);
    const globalMax = useMemo(() => {
        const sourceValues = isPracticeMode
            ? values
            : steps.flatMap((step) => step.arrayState);

        return Math.max(...sourceValues, 1);
    }, [isPracticeMode, steps, values]);

    const selectedIndexSet = useMemo(
        () => new Set(selectedIndices),
        [selectedIndices],
    );
    const suggestedIndexSet = useMemo(
        () => new Set(suggestedIndices),
        [suggestedIndices],
    );
    const feedbackIndexSet = useMemo(
        () => new Set(feedbackIndices),
        [feedbackIndices],
    );
    const activeIndices = useMemo(
        () => (isPracticeMode ? selectedIndexSet : new Set(currentStep?.activeIndices ?? [])),
        [currentStep, isPracticeMode, selectedIndexSet],
    );
    const sortedIndices = useMemo(
        () => (isPracticeMode
            ? (practiceCompleted ? new Set(Array.from({ length: values.length }, (_, index) => index)) : new Set<number>())
            : getSortedIndices(currentStep, values.length)),
        [currentStep, isPracticeMode, practiceCompleted, values.length],
    );

    const practiceTone = getPracticeTone(feedbackTone, practiceCompleted);
    const stepTone = getStepTone(currentStep);
    const tone = isPracticeMode ? practiceTone : stepTone;
    const displayActionLabel = isPracticeMode
        ? practiceTone.actionLabel
        : (currentStep?.actionLabel ?? "Waiting for steps");

    const createBar = (value: number): VisualBar => ({
        id: `visual-bar-${nextBarIdRef.current++}`,
        value,
    });

    const [visualBars, setVisualBars] = useState<VisualBar[]>(
        () => values.map((value) => createBar(value)),
    );

    useLayoutEffect(() => {
        if (values.length === 0) {
            setVisualBars([]);
            return;
        }

        setVisualBars((previousBars) => {
            if (
                previousBars.length === 0 ||
                previousBars.length !== values.length ||
                (!isPracticeMode && currentStepIndex === 0)
            ) {
                return values.map((value) => createBar(value));
            }

            return reconcileBars(previousBars, values, createBar);
        });
    }, [currentStepIndex, isPracticeMode, values]);

    return (
        <section
            className={cn(
                "glass overflow-hidden rounded-3xl border border-white/10 p-4 sm:p-6",
                className,
            )}
            aria-label="Algorithm step visualizer"
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-4">
                        <p className="text-s font-semibold uppercase tracking-[0.28em] text-accent">
                            04- Visualization
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={displayActionLabel}
                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={shouldReduceMotion ? {} : { opacity: 0, y: -6 }}
                                    transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                                    className={cn(
                                        "inline-flex rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-300",
                                        tone.badgeClassName,
                                    )}
                                >
                                    {formatActionLabel(displayActionLabel)}
                                </motion.span>
                            </AnimatePresence>
                            <span className="text-sm text-text-secondary">
                                Step {steps.length === 0 ? 0 : safeIndex + 1} of {steps.length}
                            </span>
                            {isPracticeMode ? (
                                <span className="text-sm text-sky-100/80">
                                    Click two bars to validate a swap
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-accent to-accent/70" />
                            Comparing
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-red-400 to-red-500" />
                            Swapped
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500" />
                            Sorted
                        </span>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-bg/60 p-3 sm:p-4">
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                        <span className="text-text-secondary">Current transition</span>
                        <span className={cn("font-medium", values.length > 0 ? "text-white" : "text-text-secondary")}>
                            {values.length > 0 ? tone.emphasisLabel : "No active step"}
                        </span>
                    </div>

                    {isPracticeMode && hintMessage ? (
                        <div className="mb-4 rounded-2xl border border-sky-400/10 bg-sky-400/5 px-4 py-3 text-sm text-sky-50">
                            {hintMessage}
                        </div>
                    ) : null}

                    <motion.div
                        key={`bars-${mode}-${feedbackTone ?? "idle"}-${feedbackVersion}`}
                        initial={shouldReduceMotion
                            ? false
                            : (feedbackTone === "incorrect"
                                ? { x: 0 }
                                : (feedbackTone === "correct" ? { scale: 0.995 } : false))}
                        animate={shouldReduceMotion
                            ? {}
                            : (feedbackTone === "incorrect"
                                ? { x: [0, -10, 10, -7, 7, 0] }
                                : (feedbackTone === "correct"
                                    ? { scale: [1, 1.015, 1] }
                                    : { x: 0, scale: 1 }))}
                        transition={{ duration: 0.38, ease: "easeOut" }}
                        className="flex min-h-64 items-end gap-2 overflow-x-auto rounded-xl px-1 pb-1 pt-6 sm:min-h-72 sm:gap-3"
                    >
                        {visualBars.length > 0 ? (
                            visualBars.map((bar, index) => {
                                const isActive = activeIndices.has(index);
                                const isSorted = sortedIndices.has(index);
                                const isSelected = selectedIndexSet.has(index);
                                const isSuggested = suggestedIndexSet.has(index);
                                const isFeedbackTarget = feedbackIndexSet.has(index);
                                const height = `${Math.max((bar.value / globalMax) * 100, 8)}%`;
                                const isInteractive = isPracticeMode && typeof onBarClick === "function";

                                return (
                                    <motion.div
                                        key={bar.id}
                                        layout
                                        transition={shouldReduceMotion ? reducedMotionTransition : layoutTransition}
                                        className={cn(
                                            "flex min-w-10 flex-1 flex-col items-center justify-end gap-2 sm:min-w-12",
                                            isInteractive && "cursor-pointer",
                                            isInteractionDisabled && "cursor-not-allowed opacity-70",
                                        )}
                                        onClick={() => {
                                            if (isInteractive && !isInteractionDisabled) {
                                                onBarClick(index);
                                            }
                                        }}
                                        onKeyDown={(event) => {
                                            if (!isInteractive || isInteractionDisabled) {
                                                return;
                                            }

                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                onBarClick(index);
                                            }
                                        }}
                                        role={isInteractive ? "button" : undefined}
                                        tabIndex={isInteractive && !isInteractionDisabled ? 0 : undefined}
                                        aria-disabled={isInteractive ? isInteractionDisabled : undefined}
                                        aria-pressed={isInteractive ? isSelected : undefined}
                                    >
                                        <motion.span
                                            animate={shouldReduceMotion ? {} : { y: isActive || isSelected ? -2 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                "text-xs font-medium text-text-secondary transition-colors duration-300",
                                                isSorted && "text-emerald-200",
                                                isSelected && "text-sky-50",
                                                isFeedbackTarget && feedbackTone === "correct" && "text-emerald-100",
                                                isFeedbackTarget && feedbackTone === "incorrect" && "text-red-100",
                                                isActive && !isPracticeMode && "text-text-primary",
                                            )}
                                        >
                                            {bar.value}
                                        </motion.span>

                                        <div className="relative flex h-56 w-full items-end sm:h-60">
                                            <motion.div
                                                layout="position"
                                                animate={shouldReduceMotion ? { height } : {
                                                    height,
                                                    y: isActive || isSelected ? -6 : 0,
                                                    scale: isActive || isSelected ? 1.03 : 1,
                                                }}
                                                transition={shouldReduceMotion
                                                    ? reducedMotionTransition
                                                    : activeBarTransition}
                                                className={cn(
                                                    "w-full rounded-t-xl border border-white/10 bg-gradient-to-b from-white/20 to-white/5 transition-[background-color,box-shadow,border-color] duration-300",
                                                    isSorted && "border-emerald-400/40 from-emerald-400/90 to-emerald-500 shadow-[0_0_18px_rgba(52,211,153,0.22)]",
                                                    !isPracticeMode && isActive && tone.activeBarClassName,
                                                    !isPracticeMode && isActive && "border-transparent",
                                                    isSuggested && isPracticeMode && "border-accent/50 from-accent/80 to-accent/50 shadow-[0_0_18px_rgba(213,255,64,0.25)]",
                                                    isSelected && isPracticeMode && "border-sky-300/50 from-sky-400/90 to-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.26)]",
                                                    isFeedbackTarget && feedbackTone === "correct" && "border-emerald-400/50 from-emerald-400/90 to-emerald-500 shadow-[0_0_18px_rgba(52,211,153,0.26)]",
                                                    isFeedbackTarget && feedbackTone === "incorrect" && "border-red-400/50 from-red-400/90 to-red-500 shadow-[0_0_18px_rgba(248,113,113,0.3)]",
                                                )}
                                                aria-label={`Index ${index}, value ${bar.value}`}
                                                aria-current={isActive || isSelected ? "true" : undefined}
                                            />
                                        </div>

                                        <motion.span
                                            animate={shouldReduceMotion ? {} : { y: isActive || isSelected ? 2 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                "text-[11px] text-text-secondary transition-colors duration-300",
                                                isSorted && "text-emerald-200",
                                                isSelected && "text-sky-50",
                                                isFeedbackTarget && feedbackTone === "correct" && "text-emerald-100",
                                                isFeedbackTarget && feedbackTone === "incorrect" && "text-red-100",
                                                isActive && !isPracticeMode && "text-text-primary",
                                            )}
                                        >
                                            {index}
                                        </motion.span>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="flex w-full items-center justify-center rounded-xl border border-dashed border-white/10 px-4 py-12 text-sm text-text-secondary">
                                No backend simulation steps available yet.
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default memo(AlgorithmVisualizer);
