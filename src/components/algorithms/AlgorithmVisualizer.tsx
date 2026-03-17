import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";

import { cn } from "@/lib/utils";
import type { AlgorithmSimulationStep } from "@/lib/api";

type AlgorithmVisualizerProps = {
    steps: AlgorithmSimulationStep[];
    currentStepIndex: number;
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

function AlgorithmVisualizer({
    steps,
    currentStepIndex,
    className,
}: AlgorithmVisualizerProps) {
    const shouldReduceMotion = useReducedMotion();
    const nextBarIdRef = useRef(0);

    const safeIndex = steps.length === 0
        ? 0
        : Math.min(Math.max(currentStepIndex, 0), steps.length - 1);
    const currentStep = steps[safeIndex];
    const values = currentStep?.arrayState ?? [];
    const globalMax = useMemo(
        () => Math.max(...steps.flatMap((step) => step.arrayState), 1),
        [steps],
    );
    const activeIndices = useMemo(
        () => new Set(currentStep?.activeIndices ?? []),
        [currentStep],
    );
    const { badgeClassName, activeBarClassName, emphasisLabel } = getStepTone(currentStep);

    const createBar = (value: number): VisualBar => ({
        id: `visual-bar-${nextBarIdRef.current++}`,
        value,
    });

    const [visualBars, setVisualBars] = useState<VisualBar[]>(
        () => values.map((value) => createBar(value)),
    );

    useLayoutEffect(() => {
        if (!currentStep) {
            setVisualBars([]);
            return;
        }

        setVisualBars((previousBars) => {
            if (
                currentStepIndex === 0 ||
                previousBars.length === 0 ||
                previousBars.length !== currentStep.arrayState.length
            ) {
                return currentStep.arrayState.map((value) => createBar(value));
            }

            return reconcileBars(previousBars, currentStep.arrayState, createBar);
        });
    }, [currentStep, currentStepIndex]);

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
                    <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-[0.24em] text-text-secondary">
                            Algorithm Trace
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={currentStep?.actionLabel ?? "empty-action"}
                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={shouldReduceMotion ? {} : { opacity: 0, y: -6 }}
                                    transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                                    className={cn(
                                        "inline-flex rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-300",
                                        badgeClassName,
                                    )}
                                >
                                    {currentStep ? formatActionLabel(currentStep.actionLabel) : "Waiting for steps"}
                                </motion.span>
                            </AnimatePresence>
                            <span className="text-sm text-text-secondary">
                                Step {steps.length === 0 ? 0 : safeIndex + 1} of {steps.length}
                            </span>
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
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-bg/60 p-3 sm:p-4">
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                        <span className="text-text-secondary">Current transition</span>
                        <span className={cn("font-medium", currentStep ? "text-white" : "text-text-secondary")}>
                            {currentStep ? emphasisLabel : "No active step"}
                        </span>
                    </div>

                    <div className="flex min-h-64 items-end gap-2 overflow-x-auto rounded-xl px-1 pb-1 pt-6 sm:min-h-72 sm:gap-3">
                        {visualBars.length > 0 ? (
                            visualBars.map((bar, index) => {
                                const isActive = activeIndices.has(index);
                                const height = `${Math.max((bar.value / globalMax) * 100, 8)}%`;

                                return (
                                    <motion.div
                                        key={bar.id}
                                        layout
                                        transition={shouldReduceMotion ? reducedMotionTransition : layoutTransition}
                                        className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2 sm:min-w-12"
                                    >
                                        <motion.span
                                            animate={shouldReduceMotion ? {} : { y: isActive ? -2 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                "text-xs font-medium text-text-secondary transition-colors duration-300",
                                                isActive && "text-text-primary",
                                            )}
                                        >
                                            {bar.value}
                                        </motion.span>

                                        <div className="relative flex h-56 w-full items-end sm:h-60">
                                            <motion.div
                                                layout="position"
                                                animate={shouldReduceMotion ? { height } : {
                                                    height,
                                                    y: isActive ? -6 : 0,
                                                    scale: isActive ? 1.03 : 1,
                                                }}
                                                transition={shouldReduceMotion
                                                    ? reducedMotionTransition
                                                    : activeBarTransition}
                                                className={cn(
                                                    "w-full rounded-t-xl border border-white/10 bg-gradient-to-b from-white/20 to-white/5 transition-[background-color,box-shadow,border-color] duration-300",
                                                    isActive && activeBarClassName,
                                                    isActive && "border-transparent",
                                                )}
                                                aria-label={`Index ${index}, value ${bar.value}`}
                                                aria-current={isActive ? "true" : undefined}
                                            />
                                        </div>

                                        <motion.span
                                            animate={shouldReduceMotion ? {} : { y: isActive ? 2 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                "text-[11px] text-text-secondary transition-colors duration-300",
                                                isActive && "text-text-primary",
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
                    </div>
                </div>
            </div>
        </section>
    );
}

export default memo(AlgorithmVisualizer);
