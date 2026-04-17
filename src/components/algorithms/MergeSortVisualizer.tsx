import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { AlgorithmSimulationStep } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type MergeSortVisualizerProps = {
    steps: AlgorithmSimulationStep[];
    currentStepIndex: number;
    mode?: "auto" | "practice";
    practiceArray?: number[];
    selectedIndices?: number[];
    suggestedIndices?: number[];
    isInteractionDisabled?: boolean;
    practiceCompleted?: boolean;
    onBarClick?: (index: number) => void;
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

type MergeArrayIdentityItem = {
    id: string;
    value: number;
    index: number;
};

const ARRAY_BOX_SIZE_PX = 48;
const ARRAY_BOX_GAP_PX = 12;
const BAR_SLOT_WIDTH_PX = ARRAY_BOX_SIZE_PX + ARRAY_BOX_GAP_PX;
const CENTER_SPLIT_GAP_PX = 18;
const TREE_CANVAS_HEIGHT_PX = 500;
const TREE_NODE_HEIGHT_PX = ARRAY_BOX_SIZE_PX;
const TREE_EDGE_CLEARANCE_PX = 8;
const TREE_NODE_ANCHOR_OFFSET_Y = (TREE_NODE_HEIGHT_PX / 2) + TREE_EDGE_CLEARANCE_PX;
const TREE_LEVEL_GAP_UNITS = 90;
const TREE_TOP_OFFSET_UNITS = 48;
const ARRAY_ROW_Y_PX = 410;

const COMPARE_COLOR  = "bg-yellow-400 text-yellow-950 border-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.5)]";
const PLACE_COLOR    = "bg-emerald-400 text-emerald-950 border-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.5)]";
const SORTED_COLOR   = "bg-emerald-500 text-emerald-950 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.22)]";
const DEFAULT_COLOR  = "bg-white/[0.08] text-text-primary/80 border-white/10";

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

function roundToThree(value: number) {
    return Math.round(value * 1000) / 1000;
}

function reconcileMergeArrayIdentityItems(
    previousItems: MergeArrayIdentityItem[],
    nextValues: number[],
    createId: () => string,
) {
    const availableByValue = new Map<number, MergeArrayIdentityItem[]>();

    previousItems.forEach((item) => {
        const queue = availableByValue.get(item.value) ?? [];
        queue.push(item);
        availableByValue.set(item.value, queue);
    });

    return nextValues.map((value, index) => {
        const queue = availableByValue.get(value);
        const reused = queue?.shift();

        return {
            id: reused?.id ?? createId(),
            value,
            index,
        };
    });
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
    let maxDepth = 0;

    const createNode = (
        left: number,
        right: number,
        depth: number,
        parentId: string | null,
        intervalStart: number,
        intervalEnd: number,
    ): string => {
        const id = rangeId(left, right);
        maxDepth = Math.max(maxDepth, depth);
        const intervalMid = (intervalStart + intervalEnd) / 2;

        if (left === right) {
            const leafNode: MergeTreeNode = {
                id,
                left,
                right,
                depth,
                parentId,
                childIds: [],
                isLeaf: true,
                xSlot: left,
                xPercent: intervalMid * 100,
                yPercent: 0,
            };
            nodes.push(leafNode);
            nodeById.set(id, leafNode);
            return id;
        }

        const mid = left + Math.floor((right - left) / 2);
        const leftChildId = createNode(left, mid, depth + 1, id, intervalStart, intervalMid);
        const rightChildId = createNode(mid + 1, right, depth + 1, id, intervalMid, intervalEnd);
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
            xPercent: intervalMid * 100,
            yPercent: 0,
        };

        nodes.push(node);
        nodeById.set(id, node);
        return id;
    };

    createNode(0, length - 1, 0, null, 0, 1);

    const normalizedDepth = Math.max(maxDepth, 1);

    for (const node of nodes) {
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
    mode = "auto",
    practiceArray = [],
    selectedIndices = [],
    suggestedIndices = [],
    isInteractionDisabled = false,
    practiceCompleted = false,
    onBarClick,
    className,
}: MergeSortVisualizerProps) {
    const shouldReduceMotion = useReducedMotion();
    const visualizerRootRef = useRef<HTMLDivElement | null>(null);
    const [visualizerWidth, setVisualizerWidth] = useState(0);
    const isPracticeMode = mode === "practice";

    const safeIndex = steps.length === 0
        ? 0
        : Math.min(Math.max(currentStepIndex, 0), steps.length - 1);

    const currentStep = steps[safeIndex];
    const previousStep = safeIndex > 0 ? steps[safeIndex - 1] : null;
    const meta = currentStep?.mergeSort ?? null;
    const actionLabel = (currentStep?.actionLabel ?? "").trim().toLowerCase();
    const stepActiveIndices = currentStep?.activeIndices ?? [];
    const stepArrayState = currentStep?.arrayState ?? [];
    const activeIndices = isPracticeMode ? selectedIndices : stepActiveIndices;
    const arrayState = isPracticeMode ? practiceArray : stepArrayState;
    const lineNumber = currentStep?.lineNumber;
    const suggestedIndexSet = useMemo(() => new Set(suggestedIndices), [suggestedIndices]);
    const isInteractiveSwap = isPracticeMode
        && !isInteractionDisabled
        && !practiceCompleted
        && typeof onBarClick === "function";
    const practiceIdentitySeedRef = useRef(0);

    const createPracticeIdentity = () => `merge-practice-${practiceIdentitySeedRef.current++}`;

    const [practiceIdentityItems, setPracticeIdentityItems] = useState<MergeArrayIdentityItem[]>(() => {
        return practiceArray.map((value, index) => ({
            id: createPracticeIdentity(),
            value,
            index,
        }));
    });

    useEffect(() => {
        if (!isPracticeMode) {
            return;
        }

        setPracticeIdentityItems((previousItems) => {
            const createId = () => createPracticeIdentity();

            if (previousItems.length === 0) {
                return practiceArray.map((value, index) => ({
                    id: createId(),
                    value,
                    index,
                }));
            }

            return reconcileMergeArrayIdentityItems(previousItems, practiceArray, createId);
        });
    }, [practiceArray, isPracticeMode]);

    const practiceIdentityByIndex = useMemo(() => {
        return new Map(practiceIdentityItems.map((item) => [item.index, item.id]));
    }, [practiceIdentityItems]);

    const isFinalStep = isPracticeMode ? practiceCompleted : actionLabel === "complete";
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

    const suppressedNodes = useMemo(() => new Set<string>(), []);

    const compareSwap = useMemo(() => {
        if (isPracticeMode) {
            return null;
        }

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
    }, [actionLabel, activeIndices, isPracticeMode]);

    const placeSwap = useMemo(() => {
        if (isPracticeMode) {
            return null;
        }

        if (actionLabel !== "place" || !previousStep || !meta || typeof meta.placeIndex !== "number") {
            return null;
        }

        const targetIndex = meta.placeIndex;
        const previousAction = (previousStep.actionLabel ?? "").trim().toLowerCase();
        const previousCandidates = previousStep.activeIndices ?? [];
        if (previousAction !== "compare" || previousCandidates.length < 2) {
            return null;
        }

        const previousArray = previousStep.arrayState ?? [];
        const [leftCandidate, rightCandidate] = [...previousCandidates].sort((a, b) => a - b);
        const leftValue = previousArray[leftCandidate];
        const rightValue = previousArray[rightCandidate];
        if (typeof leftValue !== "number" || typeof rightValue !== "number") {
            return null;
        }

        // Mirror merge engine selection: when equal, left side wins.
        const sourceIndex = leftValue <= rightValue ? leftCandidate : rightCandidate;
        if (typeof sourceIndex !== "number" || sourceIndex === targetIndex) {
            return null;
        }

        return {
            sourceIndex,
            targetIndex,
            delta: (targetIndex - sourceIndex) * BAR_SLOT_WIDTH_PX,
        };
    }, [actionLabel, previousStep, meta, isPracticeMode]);

    const arrayIdentityAtStep = useMemo(() => {
        if (isPracticeMode) {
            return practiceIdentityItems;
        }

        if (steps.length === 0) {
            return arrayState.map((value, index) => ({
                id: `merge-array-initial-${index}`,
                value,
                index,
            }));
        }

        let idSeed = 0;
        const createId = () => `merge-array-${idSeed++}`;
        let previousResolved: MergeArrayIdentityItem[] = [];
        let resolvedAtCurrent: MergeArrayIdentityItem[] = [];

        for (let stepIndex = 0; stepIndex <= safeIndex; stepIndex += 1) {
            const stepValues = steps[stepIndex]?.arrayState ?? [];
            const resolved = reconcileMergeArrayIdentityItems(previousResolved, stepValues, createId);

            if (stepIndex === safeIndex) {
                resolvedAtCurrent = resolved;
            }

            previousResolved = resolved;
        }

        return resolvedAtCurrent;
    }, [steps, safeIndex, arrayState, isPracticeMode, practiceIdentityItems]);

    useLayoutEffect(() => {
        const root = visualizerRootRef.current;
        if (!root) return;

        const updateWidth = () => {
            const rect = root.getBoundingClientRect();
            setVisualizerWidth(rect.width);
        };

        updateWidth();

        if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", updateWidth);
            return () => window.removeEventListener("resize", updateWidth);
        }

        const observer = new ResizeObserver(updateWidth);
        observer.observe(root);
        return () => observer.disconnect();
    }, []);

    const treeLayout = useMemo(() => {
        const layoutById = new Map<string, { centerX: number; width: number; centerY: number }>();
        const totalLength = Math.max(1, arrayState.length);
        const viewportWidth = Math.max(1, visualizerWidth);
        const centerX = viewportWidth / 2;
        const slotWidth = BAR_SLOT_WIDTH_PX;
        const totalWidth = totalLength * slotWidth;
        const startX = centerX - (totalWidth / 2);
        const baseCellWidth = ARRAY_BOX_SIZE_PX;
        const nodeInternalGap = ARRAY_BOX_GAP_PX;
        const nodesByDepth = new Map<number, MergeTreeNode[]>();

        for (const node of tree.nodes) {
            const group = nodesByDepth.get(node.depth) ?? [];
            group.push(node);
            nodesByDepth.set(node.depth, group);
        }

        for (const group of nodesByDepth.values()) {
            group.sort((a, b) => a.left - b.left || a.right - b.right);
        }

        for (const node of tree.nodes) {
            const segmentLength = Math.max(1, node.right - node.left + 1);
            const widthByValues = segmentLength * baseCellWidth + Math.max(0, segmentLength - 1) * nodeInternalGap;
            const rangeCenterIndex = (node.left + node.right + 1) / 2;
            const centerXByRange = startX + (rangeCenterIndex * slotWidth);
            const splitOffset = segmentLength === totalLength
                ? 0
                : centerXByRange < centerX
                    ? -(CENTER_SPLIT_GAP_PX / 2)
                    : centerXByRange > centerX
                        ? (CENTER_SPLIT_GAP_PX / 2)
                        : 0;
            const widthByRange = segmentLength * slotWidth - nodeInternalGap;
            const width = Math.max(baseCellWidth, Math.min(widthByValues, widthByRange));
            const centerY = TREE_TOP_OFFSET_UNITS + (node.depth * TREE_LEVEL_GAP_UNITS);

            layoutById.set(node.id, {
                centerX: roundToThree(centerXByRange + splitOffset),
                width: roundToThree(width),
                centerY: roundToThree(centerY),
            });
        }

        return {
            layoutById,
            nodeInternalGap,
        };
    }, [tree.nodes, arrayState.length, visualizerWidth]);

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

            {/* ── Divide / Merge tree ───────────────────────────────────────── */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3 pb-2 sm:p-4 sm:pb-3">
                <div className="mb-3 text-xs text-text-secondary">
                    {isMergePhase
                        ? "Merge phase: merge decisions animate while all groups remain visible."
                        : "Divide phase: recursion expands level by level."}
                </div>

                <div className="relative overflow-hidden">
                    <div className="relative h-[500px] w-full" ref={visualizerRootRef}>
                        <svg
                            className="absolute inset-0 h-full w-full"
                            viewBox={`0 0 ${Math.max(1, visualizerWidth)} ${TREE_CANVAS_HEIGHT_PX}`}
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <marker
                                    id="merge-arrow-strong"
                                    markerWidth="8"
                                    markerHeight="8"
                                    refX="7"
                                    refY="4"
                                    orient="auto"
                                    markerUnits="strokeWidth"
                                >
                                    <path d="M0,0 L8,4 L0,8 Z" fill="rgba(125,211,252,0.95)" />
                                </marker>
                                <marker
                                    id="merge-arrow-normal"
                                    markerWidth="8"
                                    markerHeight="8"
                                    refX="7"
                                    refY="4"
                                    orient="auto"
                                    markerUnits="strokeWidth"
                                >
                                    <path d="M0,0 L8,4 L0,8 Z" fill="rgba(255,255,255,0.35)" />
                                </marker>
                            </defs>
                            <line
                                x1={Math.max(1, visualizerWidth) / 2}
                                y1={0}
                                x2={Math.max(1, visualizerWidth) / 2}
                                y2={TREE_CANVAS_HEIGHT_PX}
                                stroke="rgba(125,211,252,0.26)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                            {tree.nodes.flatMap((node) => {
                                if (node.depth > visibleDepth || suppressedNodes.has(node.id)) return [];
                                const parentVisible = !suppressedNodes.has(node.id);
                                if (!parentVisible) return [];
                                const nodeLayout = treeLayout.layoutById.get(node.id);
                                if (!nodeLayout) return [];

                                return node.childIds
                                    .map((childId) => {
                                        const child = tree.nodeById.get(childId);
                                        if (!child) return null;
                                        if (child.depth > visibleDepth || suppressedNodes.has(child.id)) return null;
                                        const childLayout = treeLayout.layoutById.get(child.id);
                                        if (!childLayout) return null;

                                        const edgeKey = `${node.id}-${child.id}`;
                                        const edgeStrong = activePath.has(node.id) && activePath.has(child.id);

                                        return (
                                            <motion.line
                                                key={edgeKey}
                                                initial={false}
                                                animate={{
                                                    x1: nodeLayout.centerX,
                                                    y1: nodeLayout.centerY + TREE_NODE_ANCHOR_OFFSET_Y,
                                                    x2: childLayout.centerX,
                                                    y2: childLayout.centerY - TREE_NODE_ANCHOR_OFFSET_Y,
                                                    opacity: edgeStrong ? 0.95 : 0.42,
                                                }}
                                                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.34, ease: "easeInOut" }}
                                                stroke={edgeStrong ? "rgba(125,211,252,0.95)" : "rgba(255,255,255,0.35)"}
                                                strokeWidth={edgeStrong ? "2.2" : "1.6"}
                                                strokeLinecap="round"
                                                markerEnd={edgeStrong ? "url(#merge-arrow-strong)" : "url(#merge-arrow-normal)"}
                                            />
                                        );
                                    })
                                    .filter(Boolean);
                            })}
                        </svg>

                        <div className="absolute left-0 right-0" style={{ top: `${ARRAY_ROW_Y_PX - 24}px` }}>
                            <div className="h-px w-full bg-white/10" />
                        </div>

                        <AnimatePresence initial={false}>
                            {tree.nodes.map((node) => {
                                if (node.depth > visibleDepth || suppressedNodes.has(node.id)) {
                                    return null;
                                }

                                const nodeLayout = treeLayout.layoutById.get(node.id);
                                if (!nodeLayout) {
                                    return null;
                                }

                                const segmentLength = Math.max(1, node.right - node.left + 1);
                                const isActiveRange = activeRangeId === node.id;
                                const isMerged = mergeProgress.mergedRanges.has(node.id);
                                const isOnActivePath = activePath.has(node.id);

                                const orderedIndices = Array.from({ length: segmentLength }, (_, localIndex) => node.left + localIndex);
                                if (isActiveRange && compareSwap) {
                                    const leftPos = orderedIndices.indexOf(compareSwap.leftIndex);
                                    const rightPos = orderedIndices.indexOf(compareSwap.rightIndex);
                                    if (leftPos >= 0 && rightPos >= 0) {
                                        [orderedIndices[leftPos], orderedIndices[rightPos]] = [orderedIndices[rightPos], orderedIndices[leftPos]];
                                    }
                                } else if (isActiveRange && placeSwap) {
                                    const sourcePos = orderedIndices.indexOf(placeSwap.sourceIndex);
                                    const targetPos = orderedIndices.indexOf(placeSwap.targetIndex);
                                    if (sourcePos >= 0 && targetPos >= 0) {
                                        [orderedIndices[sourcePos], orderedIndices[targetPos]] = [orderedIndices[targetPos], orderedIndices[sourcePos]];
                                    }
                                }

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
                                        className="absolute"
                                        style={{
                                            left: `${nodeLayout.centerX - (nodeLayout.width / 2)}px`,
                                            top: `${nodeLayout.centerY - (TREE_NODE_HEIGHT_PX / 2)}px`,
                                            width: `${nodeLayout.width}px`,
                                            height: `${TREE_NODE_HEIGHT_PX}px`,
                                        }}
                                    >
                                        <motion.div
                                            layout
                                            className="grid h-full"
                                            style={{
                                                gap: `${treeLayout.nodeInternalGap}px`,
                                                gridTemplateColumns: `repeat(${segmentLength}, ${ARRAY_BOX_SIZE_PX}px)`,
                                            }}
                                        >
                                            {orderedIndices.map((absoluteIndex) => {
                                                const value = arrayState[absoluteIndex];
                                                const isGraphActive = activeIndices.includes(absoluteIndex);
                                                const isSuggested = suggestedIndexSet.has(absoluteIndex);
                                                const isGraphPlaced = actionLabel === "place" && meta?.placeIndex === absoluteIndex;
                                                const graphIdentityKey = isPracticeMode
                                                    ? (practiceIdentityByIndex.get(absoluteIndex) ?? `merge-practice-fallback-${absoluteIndex}`)
                                                    : `${absoluteIndex}`;

                                                return (
                                                    <motion.div
                                                        layout
                                                        key={`${node.id}-${graphIdentityKey}`}
                                                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.32, ease: "easeInOut" }}
                                                        animate={shouldReduceMotion ? {} : {
                                                            y: isGraphActive ? -4 : 0,
                                                            scale: isGraphPlaced ? [1, 1.08, 1] : isGraphActive ? 1.04 : 1,
                                                        }}
                                                        className={cn(
                                                            "relative flex h-[48px] w-[48px] items-center justify-center rounded-xl border p-0 text-center shadow-[0_0_8px_rgba(59,130,246,0.18)]",
                                                            nodeTone,
                                                            isGraphActive && "border-yellow-300/85 bg-yellow-300/15",
                                                            isGraphPlaced && "border-emerald-300/85 bg-emerald-300/20",
                                                            isPracticeMode && isSuggested && !isGraphActive && "ring-2 ring-cyan-300/80 ring-offset-1 ring-offset-transparent",
                                                            isPracticeMode && isGraphActive && "ring-2 ring-fuchsia-300/85 ring-offset-1 ring-offset-transparent",
                                                            isInteractiveSwap && "cursor-pointer",
                                                        )}
                                                        onClick={isInteractiveSwap ? () => onBarClick?.(absoluteIndex) : undefined}
                                                    >
                                                        <span className="text-[20px] font-semibold leading-none">
                                                            {value}
                                                        </span>
                                                        <span className="absolute bottom-1 right-1 text-[10px] font-medium leading-none opacity-60">
                                                            {absoluteIndex}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })}
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        <AnimatePresence initial={false}>
                            {(() => {
                                const slotWidth = BAR_SLOT_WIDTH_PX;
                                const totalWidth = arrayIdentityAtStep.length * slotWidth;
                                const centerX = Math.max(1, visualizerWidth) / 2;
                                const startX = centerX - (totalWidth / 2);
                                const slotInset = (slotWidth - ARRAY_BOX_SIZE_PX) / 2;

                                return arrayIdentityAtStep.map((item) => {
                                    const { id: uniqueKey, value, index } = item;

                                    const boxStyle = getBoxStyle(
                                        index,
                                        actionLabel,
                                        activeIndices,
                                        isFinalStep,
                                    );
                                    const isActive = activeIndices.includes(index);
                                    const isSuggested = suggestedIndexSet.has(index);
                                    const isPlace  = actionLabel === "place" && meta?.placeIndex === index;

                                    const isMerging = (isComparePase || isMergeParse) && mergeBuffer && mergeBuffer.length > 0;
                                    const remainingInBuffer = mergeBuffer?.length || 0;
                                    const totalMergeLength = right - left + 1;
                                    const placedCount = totalMergeLength - remainingInBuffer;
                                    const currentK = left + placedCount;
                                    const isLifted = isMerging && index >= currentK && index <= right;

                                    let finalBoxStyle = boxStyle;
                                    if (isLifted) {
                                        finalBoxStyle = "border-dashed border-white/25 bg-white/[0.04] text-text-primary/70";
                                    }

                                    const itemCenter = startX + (index * slotWidth) + (slotWidth / 2);
                                    const splitOffset = itemCenter < centerX
                                        ? -(CENTER_SPLIT_GAP_PX / 2)
                                        : itemCenter > centerX
                                            ? (CENTER_SPLIT_GAP_PX / 2)
                                            : 0;
                                    const itemX = startX + (index * slotWidth) + slotInset + splitOffset;

                                    return (
                                        <motion.div
                                            key={uniqueKey}
                                            layout="position"
                                            className="absolute flex flex-col items-center gap-2"
                                            style={{
                                                left: `${itemX}px`,
                                                top: `${ARRAY_ROW_Y_PX}px`,
                                            }}
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
                                                    opacity: isLifted ? 0.72 : 1,
                                                }}
                                                transition={shouldReduceMotion ? { duration: 0 } : {
                                                    x: { duration: 0.34, ease: "easeInOut" },
                                                    y: { type: "spring", stiffness: 350, damping: 20 },
                                                    scale: { duration: 0.35, ease: "easeInOut" },
                                                }}
                                                className={cn(
                                                    "relative flex items-center justify-center rounded-xl border p-0 transition-[background-color,border-color,color] duration-300",
                                                    finalBoxStyle,
                                                    isPracticeMode && isSuggested && !isActive && "ring-2 ring-cyan-300/80 ring-offset-1 ring-offset-transparent",
                                                    isPracticeMode && isActive && "ring-2 ring-fuchsia-300/85 ring-offset-1 ring-offset-transparent",
                                                    isInteractiveSwap && "cursor-pointer",
                                                )}
                                                style={{
                                                    width: `${ARRAY_BOX_SIZE_PX}px`,
                                                    height: `${ARRAY_BOX_SIZE_PX}px`,
                                                }}
                                                aria-label={`Index ${index}, value ${value}`}
                                                onClick={isInteractiveSwap ? () => onBarClick?.(index) : undefined}
                                            >
                                                <>
                                                    <span className="text-[20px] font-semibold leading-none">{value}</span>
                                                    <span className="absolute bottom-1 right-1 text-[10px] font-medium leading-none opacity-60">
                                                        {index}
                                                    </span>
                                                </>
                                            </motion.div>
                                        </motion.div>
                                    );
                                });
                            })()}
                        </AnimatePresence>
                    </div>
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
