import { memo } from "react";

import { cn } from "@/lib/utils";
import type { AlgorithmSimulationStep } from "@/lib/api";

type AlgorithmVisualizerProps = {
    steps: AlgorithmSimulationStep[];
    currentStepIndex: number;
    className?: string;
};

function getStepTone(step: AlgorithmSimulationStep | undefined) {
    const action = step?.actionLabel.trim().toLowerCase() ?? "";

    if (action.includes("swap")) {
        return {
            badgeClassName: "border-red-400/30 bg-red-400/10 text-red-200",
            activeBarClassName: "from-red-400 to-red-500 shadow-[0_0_18px_rgba(248,113,113,0.35)]",
        };
    }

    return {
        badgeClassName: "border-accent/20 bg-accent/10 text-accent",
        activeBarClassName: "from-accent to-accent/70 shadow-[0_0_18px_rgba(213,255,64,0.3)]",
    };
}

function formatActionLabel(actionLabel: string) {
    return actionLabel
        .split(/[_\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function AlgorithmVisualizer({
    steps,
    currentStepIndex,
    className,
}: AlgorithmVisualizerProps) {
    const safeIndex = steps.length === 0
        ? 0
        : Math.min(Math.max(currentStepIndex, 0), steps.length - 1);
    const currentStep = steps[safeIndex];
    const values = currentStep?.arrayState ?? [];
    const globalMax = Math.max(...steps.flatMap((step) => step.arrayState), 1);
    const activeIndices = new Set(currentStep?.activeIndices ?? []);
    const { badgeClassName, activeBarClassName } = getStepTone(currentStep);

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
                            <span className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-300",
                                badgeClassName,
                            )}>
                                {currentStep ? formatActionLabel(currentStep.actionLabel) : "Waiting for steps"}
                            </span>
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
                    <div className="flex min-h-64 items-end gap-2 overflow-x-auto rounded-xl px-1 pb-1 pt-6 sm:min-h-72 sm:gap-3">
                        {values.length > 0 ? (
                            values.map((value, index) => {
                                const isActive = activeIndices.has(index);
                                const height = `${Math.max((value / globalMax) * 100, 8)}%`;

                                return (
                                    <div
                                        key={index}
                                        className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2 sm:min-w-12"
                                    >
                                        <span
                                            className={cn(
                                                "text-xs font-medium text-text-secondary transition-colors duration-300",
                                                isActive && "text-text-primary",
                                            )}
                                        >
                                            {value}
                                        </span>

                                        <div className="relative flex h-56 w-full items-end sm:h-60">
                                            <div
                                                className={cn(
                                                    "w-full rounded-t-xl border border-white/10 bg-gradient-to-b from-white/20 to-white/5 transition-[height,transform,background-color,box-shadow] duration-500 ease-out",
                                                    isActive && activeBarClassName,
                                                    isActive && "border-transparent -translate-y-1",
                                                )}
                                                style={{ height }}
                                                aria-label={`Index ${index}, value ${value}`}
                                                aria-current={isActive ? "true" : undefined}
                                            />
                                        </div>

                                        <span
                                            className={cn(
                                                "text-[11px] text-text-secondary transition-colors duration-300",
                                                isActive && "text-text-primary",
                                            )}
                                        >
                                            {index}
                                        </span>
                                    </div>
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
