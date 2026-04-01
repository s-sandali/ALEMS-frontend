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

type MergeTreeNode = {
    id: string;
    left: number;
    right: number;
    depth: number;
    parentId: string | null;
    childIds: string[];
    isLeaf: boolean;
    xSlot: number;
    xPercent: number;
    yPercent: number;
};

const BAR_SLOT_WIDTH_PX = 56;

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

function rangeId(left: number, right: number) {
    return `${left}-${right}`;
}

function describeMergeSortLine(lineNumber?: number) {
    switch (lineNumber) {
        case 1:
            return "Start merge sort on the full array.";
        case 2:
            return "Call mergeSort on the current range.";
        case 3:
            return "Stop splitting when the range has one element.";
        case 4:
            return "Split the current range into left and right halves.";
        case 5:
            return "Recursively sort the left half.";
        case 6:
            return "Recursively sort the right half.";
        case 7:
            return "Start merging the two sorted halves.";
        case 8:
            return "Compare candidates from each half.";
        case 9:
            return "Place the chosen value into its target index.";
        case 10:
            return "Merge for this range is complete.";
        case 11:
            return "Return the sorted range to the caller.";
        case 12:
            return "Sorting is complete.";
        default:
            return "Following merge sort pseudocode.";
    }
}

function buildMergeTree(length: number) {
    if (length <= 0) {
        return {
            nodes: [] as MergeTreeNode[],
            nodeById: new Map<string, MergeTreeNode>(),
            maxDepth: 0,
        };
    }

    const nodeById = new Map<string, MergeTreeNode>();
    const nodes: MergeTreeNode[] = [];
    let leafCursor = 0;
    let maxDepth = 0;

    const createNode = (left: number, right: number, depth: number, parentId: string | null): string => {
        const id = rangeId(left, right);
        maxDepth = Math.max(maxDepth, depth);

        if (left === right) {
            const leafNode: MergeTreeNode = {
                id,
                left,
                right,
                depth,
                parentId,
                childIds: [],
                isLeaf: true,
                xSlot: leafCursor++,
                xPercent: 0,
                yPercent: 0,
            };
            nodes.push(leafNode);
            nodeById.set(id, leafNode);
            return id;
        }

        const mid = left + Math.floor((right - left) / 2);
        const leftChildId = createNode(left, mid, depth + 1, id);
        const rightChildId = createNode(mid + 1, right, depth + 1, id);
        const leftChild = nodeById.get(leftChildId)!;
        const rightChild = nodeById.get(rightChildId)!;

        const node: MergeTreeNode = {
            id,
            left,
            right,
            depth,
            parentId,
            childIds: [leftChildId, rightChildId],
            isLeaf: false,
            xSlot: (leftChild.xSlot + rightChild.xSlot) / 2,
            xPercent: 0,
            yPercent: 0,
        };

        nodes.push(node);
        nodeById.set(id, node);
        return id;
    };

    createNode(0, length - 1, 0, null);

    const totalLeafCount = Math.max(leafCursor, 1);
    const normalizedDepth = Math.max(maxDepth, 1);
    const horizontalPadding = 7;

    for (const node of nodes) {
        node.xPercent = totalLeafCount === 1
            ? 50
            : horizontalPadding + (node.xSlot / (totalLeafCount - 1)) * (100 - horizontalPadding * 2);
        node.yPercent = 9 + (node.depth / normalizedDepth) * 74;
    }

    nodes.sort((a, b) => a.depth - b.depth || a.left - b.left || a.right - b.right);

    return {
        nodes,
        nodeById,
        maxDepth,
    };
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
    const previousStep = safeIndex > 0 ? steps[safeIndex - 1] : null;
    const meta = currentStep?.mergeSort ?? null;
    const actionLabel = (currentStep?.actionLabel ?? "").trim().toLowerCase();
    const activeIndices = currentStep?.activeIndices ?? [];
    const arrayState = currentStep?.arrayState ?? [];
    const lineNumber = currentStep?.lineNumber;

    const isFinalStep = actionLabel === "complete";
    const isComparePase = actionLabel === "compare";
    const isMergeParse = actionLabel.startsWith("merge");
    const isMergePhase = actionLabel === "compare" || actionLabel === "place" || actionLabel.startsWith("merge") || actionLabel === "complete";

    const left  = meta?.left  ?? 0;
    const right = meta?.right ?? Math.max(arrayState.length - 1, 0);
    const mid   = meta?.mid ?? null;
    const depth = meta?.recursionDepth ?? 0;
    const mergeBuffer = meta?.mergeBuffer ?? null;

    const tree = useMemo(() => buildMergeTree(arrayState.length), [arrayState.length]);

    const mergeProgress = useMemo(() => {
        const splitRanges = new Set<string>();
        const placeCounts = new Map<string, number>();
        const mergedRanges = new Set<string>();

        for (let i = 0; i <= safeIndex; i++) {
            const step = steps[i];
            const stepMeta = step?.mergeSort;
            if (!stepMeta) continue;

            const id = rangeId(stepMeta.left, stepMeta.right);
            const normalizedAction = (step.actionLabel ?? "").trim().toLowerCase();

            if (normalizedAction === "split") {
                splitRanges.add(id);
            }

            if (normalizedAction === "place") {
                const nextCount = (placeCounts.get(id) ?? 0) + 1;
                placeCounts.set(id, nextCount);

                const segmentLength = stepMeta.right - stepMeta.left + 1;
                if (nextCount >= segmentLength) {
                    mergedRanges.add(id);
                }
            }
        }

        if (isFinalStep) {
            for (const node of tree.nodes) {
                mergedRanges.add(node.id);
            }
        }

        return { splitRanges, mergedRanges };
    }, [steps, safeIndex, isFinalStep, tree.nodes]);

    const activeRangeId = useMemo(() => {
        if (!meta) return null;
        return rangeId(meta.left, meta.right);
    }, [meta]);

    const activePath = useMemo(() => {
        const path = new Set<string>();
        if (!activeRangeId) return path;

        let cursor: string | null = activeRangeId;
        while (cursor) {
            path.add(cursor);
            cursor = tree.nodeById.get(cursor)?.parentId ?? null;
        }

        return path;
    }, [activeRangeId, tree.nodeById]);

    const visibleDepth = useMemo(() => {
        if (tree.nodes.length === 0) return 0;
        if (isMergePhase) return tree.maxDepth;
        if (actionLabel === "split") return Math.min(depth + 1, tree.maxDepth);
        if (actionLabel === "start") return 0;
        return tree.maxDepth;
    }, [tree.nodes.length, tree.maxDepth, isMergePhase, actionLabel, depth]);

    const suppressedNodes = useMemo(() => {
        const hidden = new Set<string>();
        if (!isMergePhase) return hidden;

        for (const node of tree.nodes) {
            let parentId = node.parentId;
            while (parentId) {
                if (mergeProgress.mergedRanges.has(parentId) && !activePath.has(node.id)) {
                    hidden.add(node.id);
                    break;
                }
                parentId = tree.nodeById.get(parentId)?.parentId ?? null;
            }
        }

        return hidden;
    }, [isMergePhase, tree.nodes, tree.nodeById, mergeProgress.mergedRanges, activePath]);

    const compareSwap = useMemo(() => {
        if (actionLabel !== "compare" || activeIndices.length < 2) {
            return null;
        }

        const [leftIndex, rightIndex] = [...activeIndices].sort((a, b) => a - b);
        if (leftIndex === rightIndex) {
            return null;
        }

        return {
            leftIndex,
            rightIndex,
            delta: (rightIndex - leftIndex) * BAR_SLOT_WIDTH_PX,
        };
    }, [actionLabel, activeIndices]);

    const placeSwap = useMemo(() => {
        if (actionLabel !== "place" || !previousStep || !meta || typeof meta.placeIndex !== "number") {
            return null;
        }

        const targetIndex = meta.placeIndex;
        const targetValue = arrayState[targetIndex];
        if (typeof targetValue !== "number") {
            return null;
        }

        const previousArray = previousStep.arrayState ?? [];
        const previousCandidates = (previousStep.activeIndices ?? []).filter(
            (index) => index !== targetIndex && previousArray[index] === targetValue,
        );

        const sourceIndex = previousCandidates[0];
        if (typeof sourceIndex !== "number" || sourceIndex === targetIndex) {
            return null;
        }

        return {
            sourceIndex,
            targetIndex,
            delta: (targetIndex - sourceIndex) * BAR_SLOT_WIDTH_PX,
        };
    }, [actionLabel, previousStep, meta, arrayState]);

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
                <span>
                    Line <span className="text-text-primary">{lineNumber ?? "--"}</span>: {describeMergeSortLine(lineNumber)}
                </span>
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
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-400/10 px-2.5 py-0.5 text-[11px] text-sky-100">
                    <span className="h-2 w-2 rounded-full bg-sky-300" />
                    Divide then merge collapse
                </span>
            </div>

            {/* ── Divide / Merge tree ───────────────────────────────────────── */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
                <div className="mb-3 text-xs text-text-secondary">
                    {isMergePhase
                        ? "Merge phase: lower levels collapse as ranges finish merging."
                        : "Divide phase: recursion expands level by level."}
                </div>

                <div className="relative overflow-hidden">
                    <div className="relative h-[300px] w-full">
                        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                            {tree.nodes.flatMap((node) => {
                                if (node.depth > visibleDepth || suppressedNodes.has(node.id)) return [];
                                const parentVisible = !suppressedNodes.has(node.id);
                                if (!parentVisible) return [];

                                return node.childIds
                                    .map((childId) => {
                                        const child = tree.nodeById.get(childId);
                                        if (!child) return null;
                                        if (child.depth > visibleDepth || suppressedNodes.has(child.id)) return null;

                                        const edgeKey = `${node.id}-${child.id}`;
                                        const edgeStrong = activePath.has(node.id) && activePath.has(child.id);

                                        return (
                                            <motion.line
                                                key={edgeKey}
                                                initial={false}
                                                animate={{
                                                    x1: `${node.xPercent}%`,
                                                    y1: `${node.yPercent}%`,
                                                    x2: `${child.xPercent}%`,
                                                    y2: `${child.yPercent}%`,
                                                    opacity: edgeStrong ? 0.95 : 0.42,
                                                }}
                                                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.34, ease: "easeInOut" }}
                                                stroke={edgeStrong ? "rgba(125,211,252,0.95)" : "rgba(255,255,255,0.35)"}
                                                strokeWidth={edgeStrong ? "1.8" : "1.2"}
                                                strokeLinecap="round"
                                            />
                                        );
                                    })
                                    .filter(Boolean);
                            })}
                        </svg>

                        <AnimatePresence initial={false}>
                            {tree.nodes.map((node) => {
                                if (node.depth > visibleDepth || suppressedNodes.has(node.id)) {
                                    return null;
                                }

                                const values = arrayState.slice(node.left, node.right + 1);
                                const segmentLength = Math.max(1, node.right - node.left + 1);
                                const totalLength = Math.max(1, arrayState.length);
                                const widthPercent = Math.min(88, Math.max(2.2, (segmentLength / totalLength) * 88));
                                const valueFontSize = Math.max(8, Math.min(16, 14 - Math.floor(totalLength / 10)));
                                const indexFontSize = Math.max(7, valueFontSize - 2);
                                const isActiveRange = activeRangeId === node.id;
                                const isMerged = mergeProgress.mergedRanges.has(node.id);
                                const isOnActivePath = activePath.has(node.id);

                                const nodeTone = isMerged
                                    ? "border-emerald-300/70 bg-emerald-400/20 text-emerald-100"
                                    : isActiveRange
                                        ? "border-sky-300/80 bg-sky-400/25 text-sky-50"
                                        : "border-blue-200/45 bg-blue-500/30 text-blue-50";

                                return (
                                    <motion.div
                                        key={node.id}
                                        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85, y: -8 }}
                                        animate={shouldReduceMotion ? {
                                            opacity: 1,
                                            scale: 1,
                                            y: 0,
                                        } : {
                                            opacity: isMergePhase && !isOnActivePath && !isMerged ? 0.58 : 1,
                                            scale: isActiveRange ? 1.08 : isMerged ? 1.04 : 1,
                                            y: 0,
                                        }}
                                        exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8, y: 10 }}
                                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" }}
                                        className="absolute -translate-x-1/2 -translate-y-1/2"
                                        style={{
                                            left: `${node.xPercent}%`,
                                            top: `${node.yPercent}%`,
                                            width: `${widthPercent}%`,
                                        }}
                                    >
                                        <div
                                            className="grid gap-1"
                                            style={{ gridTemplateColumns: `repeat(${segmentLength}, minmax(0, 1fr))` }}
                                        >
                                            {values.map((value, localIndex) => {
                                                const absoluteIndex = node.left + localIndex;

                                                return (
                                                    <div
                                                        key={`${node.id}-${absoluteIndex}`}
                                                        className={cn(
                                                            "rounded-md border px-1 py-1 text-center font-semibold shadow-[0_0_8px_rgba(59,130,246,0.18)]",
                                                            nodeTone,
                                                        )}
                                                        style={{ fontSize: `${valueFontSize}px`, lineHeight: 1.05 }}
                                                    >
                                                        <div className="truncate">{value}</div>
                                                        <div
                                                            className="mt-1 truncate font-medium opacity-85"
                                                            style={{ fontSize: `${indexFontSize}px` }}
                                                        >
                                                            {absoluteIndex}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">

                {/* Elements */}
                <div className="flex min-h-[140px] flex-nowrap items-end justify-center gap-2 overflow-x-auto rounded-xl px-2 pb-6 pt-12 sm:min-h-[160px] sm:gap-3">
                    <AnimatePresence initial={false}>
                        {(() => {
                            const valCounts = new Map<number, number>();
                            
                            return arrayState.map((value, index) => {
                                const count = valCounts.get(value) || 0;
                                valCounts.set(value, count + 1);
                                const uniqueKey = `ms-val-${value}-${count}`;

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

                                // Identify elements currently inside the merge buffer (hide them in the main array)
                                const isMerging = (isComparePase || isMergeParse) && mergeBuffer && mergeBuffer.length > 0;
                                const remainingInBuffer = mergeBuffer?.length || 0;
                                const totalMergeLength = right - left + 1;
                                const placedCount = totalMergeLength - remainingInBuffer;
                                const currentK = left + placedCount;
                                
                                const isLifted = isMerging && index >= currentK && index <= right;
                                
                                let finalBoxStyle = boxStyle;
                                if (isLifted) {
                                    finalBoxStyle = "border-dashed border-white/20 bg-transparent text-transparent shadow-none";
                                }

                                return (
                                    <motion.div
                                        key={uniqueKey}
                                        layout="position"
                                        style={marginStyle}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <motion.div
                                            animate={shouldReduceMotion ? {} : {
                                                x: compareSwap
                                                    ? (index === compareSwap.leftIndex
                                                        ? compareSwap.delta
                                                        : index === compareSwap.rightIndex
                                                            ? -compareSwap.delta
                                                            : 0)
                                                    : placeSwap
                                                        ? (index === placeSwap.sourceIndex
                                                            ? placeSwap.delta
                                                            : index === placeSwap.targetIndex
                                                                ? -placeSwap.delta
                                                                : 0)
                                                        : 0,
                                                y: isActive && !isLifted ? -24 : 0,
                                                scale: (isPlace && !isLifted) ? [1, 1.15, 1] : ((isActive && !isLifted) ? 1.08 : 1),
                                                opacity: isLifted ? 0.3 : 1
                                            }}
                                            transition={shouldReduceMotion ? { duration: 0 } : {
                                                x: { duration: 0.34, ease: "easeInOut" },
                                                y: { type: "spring", stiffness: 350, damping: 20 },
                                                scale: { duration: 0.35, ease: "easeInOut" },
                                            }}
                                            className={cn(
                                                "flex h-12 w-12 items-center justify-center rounded-lg border text-lg font-bold transition-[background-color,border-color,color] duration-300 sm:h-14 sm:w-14 sm:text-xl",
                                                finalBoxStyle,
                                            )}
                                            aria-label={`Index ${index}, value ${value}`}
                                        >
                                            {!isLifted && value}
                                        </motion.div>
                                        <span className="text-[10px] text-text-secondary">{index}</span>
                                    </motion.div>
                                );
                            });
                        })()}
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
