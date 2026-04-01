import { memo, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { AlgorithmSimulationStep } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type MergeSortVisualizerProps = {
    steps: AlgorithmSimulationStep[];
    currentStepIndex: number;
    className?: string;
};

const COMPARE_COLOR  = "bg-yellow-400 text-yellow-950 border-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.5)]";
const PLACE_COLOR    = "bg-emerald-400 text-emerald-950 border-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.5)]";
const SORTED_COLOR   = "bg-emerald-500 text-emerald-950 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.22)]";
const DEFAULT_COLOR  = "bg-white/[0.08] text-white/80 border-white/10";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getBoxStyle(
    index: number,
    actionLabel: string,
    activeIndices: number[],
    isFinalStep: boolean,
) {
    if (isFinalStep) return SORTED_COLOR;

    const action = actionLabel.trim().toLowerCase();
    const isActive = activeIndices.includes(index);

    if (action === "compare" && isActive) return COMPARE_COLOR;
    if (action === "place" && isActive) return PLACE_COLOR;

    return DEFAULT_COLOR;
}

function formatLabel(label: string) {
    return label
        .split(/[_\s]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

// ── Main merge buffer row ──────────────────────────────────────────────────────

function MergeBufferRow({
    buffer,
    shouldReduceMotion,
}: {
    buffer: number[];
    shouldReduceMotion: boolean | null;
}) {
    if (buffer.length === 0) return null;

    return (
        <div className="mt-4">
            <p className="mb-2 text-xs text-text-secondary">Merge buffer (remaining)</p>
            <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout" initial={false}>
                    {buffer.map((value, idx) => (
                        <motion.div
                            key={`buf-${idx}-${value}`}
                            layout
                            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.6, y: -6 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/50 bg-violet-400/15 text-sm font-semibold text-violet-100 shadow-[0_0_10px_rgba(167,139,250,0.18)]"
                        >
                            {value}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Removed DepthBadge component inline as it is overly distracting

// ── Main component ──────────────────────────────────────────────────────────────

function MergeSortVisualizer({
    steps,
    currentStepIndex,
    className,
}: MergeSortVisualizerProps) {
    const shouldReduceMotion = useReducedMotion();

    const safeIndex = steps.length === 0
        ? 0
        : Math.min(Math.max(currentStepIndex, 0), steps.length - 1);

    const currentStep = steps[safeIndex];
    const meta = currentStep?.mergeSort ?? null;
    const actionLabel = (currentStep?.actionLabel ?? "").trim().toLowerCase();
    const activeIndices = currentStep?.activeIndices ?? [];
    const arrayState = currentStep?.arrayState ?? [];

    const isFinalStep = actionLabel === "complete";
    const isComparePase = actionLabel === "compare";
    const isMergeParse = actionLabel.startsWith("merge");

    const left  = meta?.left  ?? 0;
    const right = meta?.right ?? Math.max(arrayState.length - 1, 0);
    const mid   = meta?.mid ?? null;
    const depth = meta?.recursionDepth ?? 0;
    const mergeBuffer = meta?.mergeBuffer ?? null;

    // Phase label for the info strip
    const phaseText = useMemo(() => {
        switch (actionLabel) {
            case "start":         return "Initialising";
            case "recursive_call": return `Calling mergeSort([${left}..${right}], depth ${depth})`;
            case "base_case":     return `Base case — single element at [${left}]`;
            case "split":         return `Split → left [${left}..${mid}], right [${(mid ?? left) + 1}..${right}]`;
            case "sort_left_start":    return `Sorting left half [${left}..${right}]`;
            case "sort_left_complete": return `Left half [${left}..${right}] sorted`;
            case "sort_right_start":   return `Sorting right half [${left}..${right}]`;
            case "sort_right_complete":return `Right half [${left}..${right}] sorted`;
            case "merge_start":   return `Merging [${left}..${mid}] and [${(mid ?? left) + 1}..${right}]`;
            case "compare":       return `Comparing index ${activeIndices[0] ?? "?"} vs ${activeIndices[1] ?? "?"}`;
            case "place":         return `Placing value at index ${meta?.placeIndex ?? "?"}`;
            case "merge_complete":return `Merged [${left}..${right}] ✓`;
            case "return":        return `Returning sorted [${left}..${right}]`;
            case "complete":      return "Sort complete — array fully sorted";
            default:              return formatLabel(actionLabel);
        }
    }, [actionLabel, left, right, mid, depth, activeIndices, meta]);

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {/* ── Phase info strip ───────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-text-secondary">
                <span className="font-medium text-text-primary">{phaseText}</span>
            </div>

            {/* ── Legend ────────────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-2.5 py-0.5 text-[11px] text-yellow-100">
                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    Comparing
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-0.5 text-[11px] text-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Placed / Sorted
                </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">

                {/* Elements */}
                <div className="flex min-h-[140px] flex-wrap items-end justify-center gap-2 rounded-xl px-2 pb-6 pt-12 sm:min-h-[160px] sm:gap-3">
                    <AnimatePresence initial={false}>
                        {arrayState.map((value, index) => {
                            const boxStyle = getBoxStyle(
                                index,
                                actionLabel,
                                activeIndices,
                                isFinalStep,
                            );
                            const isActive = activeIndices.includes(index);
                            const isPlace  = actionLabel === "place" && meta?.placeIndex === index;

                            // Calculate physical separation based on merges (simulate physical splitting)
                            let marginStyle = {};
                            if (typeof mid === "number" && index === mid && (isMergeParse || actionLabel === "split" || actionLabel === "compare")) {
                                marginStyle = { marginRight: "1rem" };
                            }

                            return (
                                <motion.div
                                    key={`ms-box-${index}`}
                                    layout="position"
                                    style={marginStyle}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <motion.div
                                        animate={shouldReduceMotion ? {} : {
                                            y: isActive ? -24 : 0,
                                            scale: isPlace ? [1, 1.15, 1] : (isActive ? 1.08 : 1),
                                        }}
                                        transition={shouldReduceMotion ? { duration: 0 } : {
                                            y: { type: "spring", stiffness: 350, damping: 20 },
                                            scale: { duration: 0.35, ease: "easeInOut" },
                                        }}
                                        className={cn(
                                            "flex h-12 w-12 items-center justify-center rounded-lg border text-lg font-bold transition-[background-color,border-color,color] duration-300 sm:h-14 sm:w-14 sm:text-xl",
                                            boxStyle,
                                        )}
                                        aria-label={`Index ${index}, value ${value}`}
                                    >
                                        {value}
                                    </motion.div>
                                    <span className="text-[10px] text-text-secondary">{index}</span>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Merge buffer */}
                {mergeBuffer && mergeBuffer.length > 0 && (isComparePase || isMergeParse) ? (
                    <MergeBufferRow
                        buffer={mergeBuffer}
                        shouldReduceMotion={shouldReduceMotion}
                    />
                ) : null}
            </div>

            {/* Removed recursion call stack as the visual is meant to be simple */}
        </div>
    );
}

export default memo(MergeSortVisualizer);
