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

// ── Colour palette ─────────────────────────────────────────────────────────────

const DEPTH_COLORS = [
    { bar: "from-violet-400 to-violet-500",  border: "border-violet-400/60",  text: "text-violet-100",  badge: "bg-violet-400/20 border-violet-400/40",  label: "Left (depth 0)"  },
    { bar: "from-sky-400 to-sky-500",         border: "border-sky-400/60",      text: "text-sky-100",      badge: "bg-sky-400/20 border-sky-400/40",          label: "Left (depth 1)"  },
    { bar: "from-teal-400 to-teal-500",       border: "border-teal-400/60",     text: "text-teal-100",     badge: "bg-teal-400/20 border-teal-400/40",         label: "Left (depth 2)"  },
    { bar: "from-amber-400 to-amber-500",     border: "border-amber-400/60",    text: "text-amber-100",    badge: "bg-amber-400/20 border-amber-400/40",        label: "Left (depth 3)"  },
];

const COMPARE_COLOR  = "from-yellow-300 to-yellow-400 border-yellow-300/70 shadow-[0_0_18px_rgba(250,204,21,0.35)]";
const PLACE_COLOR    = "from-emerald-400 to-emerald-500 border-emerald-400/70 shadow-[0_0_18px_rgba(52,211,153,0.35)]";
const ACTIVE_COLOR   = "from-sky-400 to-sky-500 border-sky-400/70 shadow-[0_0_14px_rgba(56,189,248,0.3)]";
const SORTED_COLOR   = "from-emerald-400/90 to-emerald-500 border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.22)]";
const DEFAULT_COLOR  = "from-white/20 to-white/5 border-white/10";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getBarColor(
    index: number,
    actionLabel: string,
    activeIndices: number[],
    left: number,
    right: number,
    mid: number | null | undefined,
    isFinalStep: boolean,
) {
    if (isFinalStep) {
        return SORTED_COLOR;
    }

    const action = actionLabel.trim().toLowerCase();
    const isActive = activeIndices.includes(index);

    if (action === "compare" && isActive) {
        return COMPARE_COLOR;
    }

    if (action === "place" && isActive) {
        return PLACE_COLOR;
    }

    if (isActive) {
        return ACTIVE_COLOR;
    }

    // Shade left / right halves differently during merge
    if (action === "merge_start" || action === "compare" || action === "place" || action === "merge_complete") {
        if (typeof mid === "number") {
            if (index >= left && index <= mid) {
                return "from-sky-400/40 to-sky-500/20 border-sky-400/40";
            }
            if (index > mid && index <= right) {
                return "from-rose-400/40 to-rose-500/20 border-rose-400/40";
            }
        }
        if (index >= left && index <= right) {
            return "from-violet-400/35 to-violet-500/15 border-violet-400/35";
        }
    }

    // Highlight the active sub-array range for split / recursive steps
    if (index >= left && index <= right) {
        return "from-white/15 to-white/5 border-white/20";
    }

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

// ── Recursion depth legend ─────────────────────────────────────────────────────

function DepthBadge({ depth, label }: { depth: number; label: string }) {
    const palette = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px]",
                palette.badge,
                palette.text,
            )}
        >
            <span className={cn("h-2 w-2 rounded-full bg-gradient-to-b", palette.bar)} />
            {label}
        </span>
    );
}

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

    const globalMax = useMemo(
        () => Math.max(...steps.flatMap((s) => s.arrayState), 1),
        [steps],
    );

    const depthPalette = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];

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
                <div className="flex flex-wrap gap-2">
                    <span>Depth: <span className={cn("font-semibold", depthPalette.text)}>{depth}</span></span>
                    {typeof mid === "number" ? (
                        <span>Mid: <span className="font-semibold text-text-primary">{mid}</span></span>
                    ) : null}
                    <span>Range: <span className="font-semibold text-text-primary">[{left}..{right}]</span></span>
                </div>
            </div>

            {/* ── Legend ────────────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2">
                <DepthBadge depth={0} label="Left half" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-400/15 px-2.5 py-0.5 text-[11px] text-rose-100">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-b from-rose-400 to-rose-500" />
                    Right half
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-2.5 py-0.5 text-[11px] text-yellow-100">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-400" />
                    Comparing
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-0.5 text-[11px] text-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500" />
                    Placed / Sorted
                </span>
            </div>

            {/* ── Bar chart ─────────────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
                {/* Sub-array bracket */}
                {!isFinalStep && arrayState.length > 0 ? (
                    <div
                        className="relative mb-2 h-4"
                        aria-hidden
                    >
                        {/* Full range bracket */}
                        <div
                            className={cn(
                                "absolute top-1 h-2 rounded-full opacity-40",
                                `bg-gradient-to-r ${depthPalette.bar}`,
                            )}
                            style={{
                                left: `${(left / arrayState.length) * 100}%`,
                                width: `${((right - left + 1) / arrayState.length) * 100}%`,
                            }}
                        />
                        {/* Left / right divider */}
                        {typeof mid === "number" && (isMergeParse || actionLabel === "split") ? (
                            <>
                                <div
                                    className="absolute top-0 h-4 w-px bg-white/40"
                                    style={{ left: `${((mid + 1) / arrayState.length) * 100}%` }}
                                />
                            </>
                        ) : null}
                    </div>
                ) : null}

                {/* Bars */}
                <div className="flex min-h-48 items-end gap-1.5 overflow-x-auto rounded-xl px-1 pb-1 pt-4 sm:gap-2 sm:min-h-56">
                    <AnimatePresence initial={false}>
                        {arrayState.map((value, index) => {
                            const barColor = getBarColor(
                                index,
                                actionLabel,
                                activeIndices,
                                left,
                                right,
                                mid,
                                isFinalStep,
                            );
                            const height = `${Math.max((value / globalMax) * 100, 8)}%`;
                            const isActive = activeIndices.includes(index);
                            const isPlace  = actionLabel === "place" && meta?.placeIndex === index;

                            return (
                                <motion.div
                                    key={`ms-bar-${index}`}
                                    layout
                                    className="flex min-w-9 flex-1 flex-col items-center justify-end gap-1.5"
                                >
                                    <motion.span
                                        animate={shouldReduceMotion ? {} : { y: isActive ? -2 : 0 }}
                                        transition={{ duration: 0.18 }}
                                        className="text-xs font-medium text-text-secondary"
                                    >
                                        {value}
                                    </motion.span>

                                    <div className="relative flex h-48 w-full items-end sm:h-52">
                                        <motion.div
                                            layout="position"
                                            animate={shouldReduceMotion ? { height } : {
                                                height,
                                                y: isActive ? -5 : 0,
                                                scale: isPlace ? [1, 1.12, 1] : (isActive ? 1.04 : 1),
                                            }}
                                            transition={shouldReduceMotion ? { duration: 0 } : {
                                                height: { duration: 0.3, ease: "easeInOut" },
                                                y:      { duration: 0.2, ease: "easeOut"  },
                                                scale:  { duration: 0.4, ease: "easeInOut" },
                                            }}
                                            className={cn(
                                                "w-full rounded-t-xl border bg-gradient-to-b transition-[background-color,box-shadow,border-color] duration-300",
                                                barColor,
                                            )}
                                            aria-label={`Index ${index}, value ${value}`}
                                        />
                                    </div>

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

            {/* ── Recursion call stack breadcrumb ────────────────────────────── */}
            {currentStep?.recursion?.stack && currentStep.recursion.stack.length > 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <p className="mb-2 text-xs text-text-secondary">Call stack (deepest first)</p>
                    <div className="flex flex-col gap-1">
                        {[...currentStep.recursion.stack].reverse().map((frame) => {
                            const isCurrentFrame = frame.id === currentStep.recursion?.currentFrameId;
                            const palette = DEPTH_COLORS[Math.min(frame.depth, DEPTH_COLORS.length - 1)];
                            return (
                                <motion.div
                                    key={frame.id}
                                    layout
                                    initial={false}
                                    className={cn(
                                        "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors duration-200",
                                        isCurrentFrame
                                            ? `${palette.badge} ${palette.text}`
                                            : "border-white/10 bg-white/[0.02] text-text-secondary",
                                    )}
                                    style={{ marginLeft: `${frame.depth * 12}px` }}
                                >
                                    <span className={cn("h-1.5 w-1.5 rounded-full bg-gradient-to-b", palette.bar)} />
                                    <span className="font-mono">
                                        {frame.functionName}([{frame.leftIndex}..{frame.rightIndex}])
                                    </span>
                                    {isCurrentFrame ? (
                                        <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px]">active</span>
                                    ) : null}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default memo(MergeSortVisualizer);
