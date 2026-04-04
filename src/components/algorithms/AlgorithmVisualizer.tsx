import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AlgorithmSimulationStep } from "@/lib/api";
import MergeSortVisualizer from "./MergeSortVisualizer";

type LearningMode = "auto" | "practice";
type PracticeFeedbackTone = "correct" | "incorrect" | null;
type SearchDecision = "left" | "right" | "found";

type AlgorithmVisualizerProps = {
    steps: AlgorithmSimulationStep[];
    currentStepIndex: number;
    mode?: LearningMode;
    algorithmType?: "sort" | "search";
    searchTargetValue?: number | null;
    practiceArray?: number[];
    selectedIndices?: number[];
    suggestedIndices?: number[];
    feedbackIndices?: number[];
    discardedIndices?: number[];
    feedbackTone?: PracticeFeedbackTone;
    feedbackVersion?: number;
    recentPracticeAction?: string | null;
    hintMessage?: string;
    practiceCompleted?: boolean;
    isInteractionDisabled?: boolean;
    selectionPracticeCandidateIndex?: number | null;
    selectionPracticeConfirmedMinIndex?: number | null;
    selectionPracticeSwapAnchorIndex?: number | null;
    canSelectionPracticeGoRight?: boolean;
    canSelectionPracticeSelectMin?: boolean;
    onSelectionPracticeGoRight?: () => void;
    onSelectionPracticeSelectMin?: () => void;
    onBarClick?: (index: number) => void;
    onSearchDecision?: (decision: SearchDecision) => void;
    className?: string;
};

type VisualBar = {
    id: string;
    value: number;
};

type HeapNodeState = "normal" | "active" | "comparing" | "swapping" | "removing";

type HeapVisualNode = {
    id: string;
    index: number;
    value: number;
    x: number;
    y: number;
    state: HeapNodeState;
    incomingToRoot: boolean;
};

type HeapIdentityNode = {
    id: string;
    index: number;
    value: number;
};

type HeapVisualEdge = {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

const HEAP_NODE_RADIUS_PX = 22;
const FALLING_NODE_RADIUS_PX = 20;

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

const actionLabelAliases: Record<string, string> = {
    pivotplaced: "Pivot Placed",
    partition_complete: "Pivot Placed",
};

function getStepTone(step: AlgorithmSimulationStep | undefined) {
    const action = (step?.search?.state ?? step?.actionLabel ?? "").trim().toLowerCase();

    if (action.includes("compare")) {
        return {
            badgeClassName: "border-yellow-300/35 bg-yellow-300/10 text-yellow-100",
            activeBarClassName: "from-yellow-300 to-yellow-400 shadow-[0_0_18px_rgba(250,204,21,0.3)]",
            emphasisLabel: "Comparing",
        };
    }

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

    if (action === "not_found" || action.includes("not_found") || action.includes("not found")) {
        return {
            badgeClassName: "border-red-400/30 bg-red-400/10 text-red-200",
            activeBarClassName: "from-red-400 to-red-500 shadow-[0_0_18px_rgba(248,113,113,0.35)]",
            emphasisLabel: "Not Found",
        };
    }

    if (action === "found" || action.includes("found")) {
        return {
            badgeClassName: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
            activeBarClassName: "from-emerald-400 to-emerald-500 shadow-[0_0_18px_rgba(52,211,153,0.3)]",
            emphasisLabel: "Found",
        };
    }

    if (action.includes("discard")) {
        return {
            badgeClassName: "border-slate-400/30 bg-slate-400/10 text-slate-300",
            activeBarClassName: "from-slate-400 to-slate-500 shadow-[0_0_6px_rgba(148,163,184,0.2)]",
            emphasisLabel: "Discarded",
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
    const normalizedLabel = actionLabel.trim().toLowerCase();
    if (actionLabelAliases[normalizedLabel]) {
        return actionLabelAliases[normalizedLabel];
    }

    return actionLabel
        .split(/[_\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function getQuickSortRange(step: AlgorithmSimulationStep | undefined) {
    const maybeRange = step?.quickSort?.range;
    if (!Array.isArray(maybeRange) || maybeRange.length < 2) {
        return null;
    }

    const low = Number(maybeRange[0]);
    const high = Number(maybeRange[1]);
    if (!Number.isFinite(low) || !Number.isFinite(high)) {
        return null;
    }

    return {
        low: Math.min(low, high),
        high: Math.max(low, high),
    };
}

function isQuickSortPivotPlacedAction(actionLabel: string | undefined) {
    const normalized = (actionLabel ?? "").trim().toLowerCase();
    return normalized === "pivotplaced" || normalized === "partition_complete";
}

function getSearchActiveIndices(step: AlgorithmSimulationStep | undefined) {
    if (!step?.search) {
        return step?.activeIndices ?? [];
    }

    if (typeof step.search.midpointIndex === "number") {
        return [step.search.midpointIndex];
    }

    return step.activeIndices ?? [];
}

function getSearchState(step: AlgorithmSimulationStep | undefined) {
    return (step?.search?.state ?? step?.actionLabel ?? "").trim().toLowerCase();
}

function getQuickSortPracticeAction(step: AlgorithmSimulationStep | undefined) {
    const action = (step?.quickSort?.type ?? step?.actionLabel ?? "").trim().toLowerCase();

    if (action === "pivot_swap" || action === "swap") {
        return "swap";
    }

    if (action === "compare") {
        return "compare";
    }

    return action;
}

function getInsertionSortPracticeAction(step: AlgorithmSimulationStep | undefined) {
    const action = (step?.insertionSort?.type ?? step?.actionLabel ?? "").trim().toLowerCase();

    if (action === "compare" || action === "shift" || action === "insert") {
        return action;
    }

    if (action === "complete" || action === "early_exit") {
        return "complete";
    }

    return "compare";
}

function getSafeStepIndex(index: number | null | undefined, totalValues: number) {
    if (typeof index !== "number") {
        return null;
    }

    if (index < 0 || index >= totalValues) {
        return null;
    }

    return index;
}

function getSearchWindow(step: AlgorithmSimulationStep | undefined, totalValues: number) {
    if (totalValues <= 0) {
        return { low: 0, high: -1, midpoint: null };
    }

    const low = typeof step?.search?.lowIndex === "number" ? step.search.lowIndex : 0;
    const high = typeof step?.search?.highIndex === "number" ? step.search.highIndex : totalValues - 1;
    const midpoint = typeof step?.search?.midpointIndex === "number"
        ? step.search.midpointIndex
        : Math.floor((low + high) / 2);

    return { low, high, midpoint };
}

function getSearchTargetValue(steps: AlgorithmSimulationStep[]) {
    const foundStep = steps.find((step) => {
        const state = getSearchState(step);
        return state === "found" || state === "target_found";
    });

    if (!foundStep) {
        return null;
    }

    const midpointIndex = typeof foundStep.search?.midpointIndex === "number"
        ? foundStep.search.midpointIndex
        : foundStep.activeIndices?.[0];
    if (typeof midpointIndex !== "number") {
        return null;
    }

    return foundStep.arrayState?.[midpointIndex] ?? null;
}

function reconcileBars(
    previousBars: VisualBar[],
    nextValues: number[],
    createBar: (value: number) => VisualBar,
    preferredSwapIndices?: [number, number] | null,
) {
    if (
        preferredSwapIndices
        && previousBars.length === nextValues.length
    ) {
        const [leftIndex, rightIndex] = preferredSwapIndices;
        const isValidSwap = Number.isInteger(leftIndex)
            && Number.isInteger(rightIndex)
            && leftIndex >= 0
            && rightIndex >= 0
            && leftIndex < previousBars.length
            && rightIndex < previousBars.length
            && leftIndex !== rightIndex;

        if (isValidSwap) {
            const swappedBars = previousBars.slice();
            [swappedBars[leftIndex], swappedBars[rightIndex]] = [swappedBars[rightIndex], swappedBars[leftIndex]];

            return swappedBars.map((bar, index) => ({
                ...bar,
                value: nextValues[index],
            }));
        }
    }

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

function formatHeapComparison(step: AlgorithmSimulationStep | undefined) {
    const compared = step?.heap?.comparedIndices;
    if (!compared || compared.length < 2) {
        return "--";
    }

    return `${compared[0]} vs ${compared[1]}`;
}

function getHeapNodePosition(index: number) {
    const level = Math.floor(Math.log2(index + 1));
    const nodesBeforeLevel = (2 ** level) - 1;
    const indexInLevel = index - nodesBeforeLevel;
    const slotsInLevel = 2 ** level;
    const horizontalPadding = 8;
    const usableWidth = 100 - (horizontalPadding * 2);

    return {
        x: horizontalPadding + (((indexInLevel + 0.5) / slotsInLevel) * usableWidth),
        y: 12 + level * 17,
    };
}

function reconcileHeapIdentityNodes(previousNodes: HeapIdentityNode[], nextValues: number[], createId: () => string) {
    const availableByValue = new Map<number, HeapIdentityNode[]>();

    previousNodes.forEach((node) => {
        const queue = availableByValue.get(node.value) ?? [];
        queue.push(node);
        availableByValue.set(node.value, queue);
    });

    return nextValues.map((value, index) => {
        const queue = availableByValue.get(value);
        const reused = queue?.shift();

        return {
            id: reused?.id ?? createId(),
            index,
            value,
        };
    });
}

function buildHeapVisualNodes(
    step: AlgorithmSimulationStep | undefined,
    currentValues: number[],
    idsByIndex: Map<number, string>,
    incomingRootNodeId: string | null,
    isPracticeMode: boolean,
): HeapVisualNode[] {
    if (!step?.heap || currentValues.length === 0) {
        return [];
    }

    const values = currentValues;
    const boundaryEnd = Math.min(Math.max(step.heap.heapBoundaryEnd ?? -1, -1), values.length - 1);
    const comparedIndices = step.heap.comparedIndices ?? [];
    const comparedMaxIndex = comparedIndices.length > 0 ? Math.max(...comparedIndices) : -1;
    const effectiveBoundaryEnd = isPracticeMode
        ? Math.min(Math.max(boundaryEnd, comparedMaxIndex), values.length - 1)
        : boundaryEnd;
    const action = (step.actionLabel ?? "").trim().toLowerCase();
    const compared = new Set(comparedIndices);

    const nodes: HeapVisualNode[] = [];
    for (let index = 0; index <= effectiveBoundaryEnd; index += 1) {
        const pos = getHeapNodePosition(index);
        let state: HeapNodeState = "normal";
        const nodeId = idsByIndex.get(index) ?? `heap-fallback-${index}-${values[index]}`;

        if (isPracticeMode) {
            nodes.push({
                id: nodeId,
                index,
                value: values[index],
                x: pos.x,
                y: pos.y,
                state: "normal",
                incomingToRoot: false,
            });
            continue;
        }

        if (compared.has(index)) {
            state = action.includes("swap") ? "swapping" : "comparing";
        } else if (index === 0 && !action.includes("complete")) {
            // Keep root emphasis only when not explicitly in compare/swap state.
            state = "active";
        }

        if (index === 0 && action.includes("swap") && !compared.has(index)) {
            // Extraction root action keeps a clear removed/root emphasis.
            state = "removing";
        } else if (index === 0 && action.includes("extract") && !compared.has(index)) {
            state = "active";
        }

        if (compared.has(index) && action.includes("compare")) {
            // Ensure a single consistent compare color for all compare operations.
            state = "comparing";
        }

        nodes.push({
            id: nodeId,
            index,
            value: values[index],
            x: pos.x,
            y: pos.y,
            state,
            incomingToRoot: incomingRootNodeId === nodeId,
        });
    }

    return nodes;
}

function buildHeapVisualEdges(nodes: HeapVisualNode[]): HeapVisualEdge[] {
    const byIndex = new Map(nodes.map((node) => [node.index, node]));
    const edges: HeapVisualEdge[] = [];

    nodes.forEach((node) => {
        const left = byIndex.get((2 * node.index) + 1);
        const right = byIndex.get((2 * node.index) + 2);

        if (left) {
            edges.push({
                id: `${node.id}->${left.id}`,
                x1: node.x,
                y1: node.y,
                x2: left.x,
                y2: left.y,
            });
        }

        if (right) {
            edges.push({
                id: `${node.id}->${right.id}`,
                x1: node.x,
                y1: node.y,
                x2: right.x,
                y2: right.y,
            });
        }
    });

    return edges;
}

function getNodeClassName(state: HeapNodeState) {
    if (state === "comparing") {
        return "border-yellow-300/70 bg-yellow-300/20 text-yellow-50";
    }

    if (state === "swapping") {
        return "border-red-300/70 bg-red-400/20 text-red-50";
    }

    if (state === "removing") {
        return "border-emerald-300/70 bg-emerald-400/25 text-emerald-50 shadow-[0_0_20px_rgba(52,211,153,0.3)]";
    }

    if (state === "active") {
        return "border-accent/70 bg-accent/20 text-accent";
    }

    return "border-white/15 bg-white/[0.04] text-white";
}

function getNodeAnimate(state: HeapNodeState, shouldReduceMotion: boolean) {
    if (shouldReduceMotion) {
        return {};
    }

    if (state === "active") {
        return { scale: [1, 1.06, 1] };
    }

    if (state === "comparing") {
        return { scale: [1, 1.04, 1] };
    }

    if (state === "swapping") {
        return { scale: [1, 1.08, 1] };
    }

    if (state === "removing") {
        return { scale: [1, 1.08, 1] };
    }

    return { scale: 1 };
}

function buildTrajectoryPath(startX: number, startY: number, endX: number, endY: number) {
    const deltaX = endX - startX;
    const direction = deltaX >= 0 ? 1 : -1;
    const horizontalSpan = Math.abs(deltaX);

    // Keep control point between start/end to avoid overshooting far right/left.
    const controlX = startX + (deltaX * 0.58) - (direction * Math.min(3.5, horizontalSpan * 0.06));
    const controlY = ((startY + endY) / 2) - Math.min(11, 5 + horizontalSpan * 0.06);

    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
}

function AlgorithmVisualizer({
    steps,
    currentStepIndex,
    mode = "auto",
    algorithmType = "sort",
    searchTargetValue = null,
    practiceArray = [],
    selectedIndices = [],
    suggestedIndices = [],
    feedbackIndices = [],
    discardedIndices = [],
    feedbackTone = null,
    feedbackVersion = 0,
    recentPracticeAction = null,
    hintMessage = "",
    practiceCompleted = false,
    isInteractionDisabled = false,
    selectionPracticeCandidateIndex = null,
    selectionPracticeConfirmedMinIndex = null,
    selectionPracticeSwapAnchorIndex = null,
    canSelectionPracticeGoRight = false,
    canSelectionPracticeSelectMin = false,
    onSelectionPracticeGoRight,
    onSelectionPracticeSelectMin,
    onBarClick,
    onSearchDecision,
    className,
}: AlgorithmVisualizerProps) {
    const shouldReduceMotion = useReducedMotion();
    const nextBarIdRef = useRef(0);
    const heapStageRef = useRef<HTMLDivElement | null>(null);
    const heapArrayCellRefs = useRef<Array<HTMLDivElement | null>>([]);

    const safeIndex = steps.length === 0
        ? 0
        : Math.min(Math.max(currentStepIndex, 0), steps.length - 1);
    const currentStep = steps[safeIndex];
    const searchState = getSearchState(currentStep);
    const isSearchMidpoint = searchState === "midpoint_pick";
    const isSearchFound = searchState === "found" || searchState === "target_found";
    const isSearchNotFound = searchState === "not_found" || searchState === "target_not_found";
    const isPracticeMode = mode === "practice";
    const values = useMemo(
        () => (isPracticeMode ? practiceArray : (currentStep?.arrayState ?? [])),
        [isPracticeMode, practiceArray, currentStep],
    );
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
    const discardedIndexSet = useMemo(
        () => new Set(discardedIndices),
        [discardedIndices],
    );
    const activeIndices = useMemo(
        () => (isPracticeMode
            ? selectedIndexSet
            : new Set(getSearchActiveIndices(currentStep))),
        [currentStep, isPracticeMode, selectedIndexSet],
    );
    const sortedIndices = useMemo(
        () => (isPracticeMode
            ? (practiceCompleted ? new Set(Array.from({ length: values.length }, (_, index) => index)) : new Set<number>())
            : getSortedIndices(currentStep, values.length)),
        [currentStep, isPracticeMode, practiceCompleted, values.length],
    );
    const insertionSortMeta = currentStep?.insertionSort ?? null;
    const hasInsertionSortMetadata = Boolean(insertionSortMeta);
    const insertionKeyIndex = useMemo(
        () => getSafeStepIndex(insertionSortMeta?.currentIndex, values.length),
        [insertionSortMeta?.currentIndex, values.length],
    );
    const insertionCompareIndex = useMemo(
        () => getSafeStepIndex(insertionSortMeta?.compareIndex, values.length),
        [insertionSortMeta?.compareIndex, values.length],
    );
    const insertionSortedBoundary = useMemo(
        () => getSafeStepIndex(insertionSortMeta?.sortedBoundary, values.length),
        [insertionSortMeta?.sortedBoundary, values.length],
    );
    const insertionPositionIndex = useMemo(
        () => getSafeStepIndex(insertionSortMeta?.insertPosition, values.length),
        [insertionSortMeta?.insertPosition, values.length],
    );

    const practiceTone = getPracticeTone(feedbackTone, practiceCompleted);
    const stepTone = getStepTone(currentStep);
    const tone = isPracticeMode ? practiceTone : stepTone;
    const displayActionLabel = isPracticeMode
        ? practiceTone.actionLabel
        : (currentStep?.search?.state ?? currentStep?.actionLabel ?? "Waiting for steps");
    const heapStepMeta = currentStep?.heap ?? null;
    const quickSortMeta = currentStep?.quickSort ?? null;
    const selectionSortMeta = currentStep?.selectionSort ?? null;
    const mergeSortMeta = currentStep?.mergeSort ?? null;
    const isInsertionSortStep = hasInsertionSortMetadata && algorithmType === "sort";
    const isSelectionSortStep = Boolean(selectionSortMeta) && algorithmType === "sort";
    const isMergeSortStep = Boolean(mergeSortMeta);
    const quickSortRange = useMemo(
        () => getQuickSortRange(currentStep),
        [currentStep],
    );
    const normalizedActionLabel = (currentStep?.actionLabel ?? "").trim().toLowerCase();
    const isQuickSortPivotPlaced = isQuickSortPivotPlacedAction(currentStep?.actionLabel);
    const isQuickSortCompareOrSwap = normalizedActionLabel.includes("compare") || normalizedActionLabel.includes("swap");
    const quickSortPivotIndex = isQuickSortPivotPlaced && typeof quickSortMeta?.pivotIndex === "number"
        ? quickSortMeta.pivotIndex
        : null;
    const hasQuickSortMetadata = Boolean(quickSortMeta) || isQuickSortPivotPlaced;
    const heapComparison = useMemo(
        () => formatHeapComparison(currentStep),
        [currentStep],
    );
    const quickSortPracticeAction = useMemo(
        () => getQuickSortPracticeAction(currentStep),
        [currentStep],
    );
    const insertionSortPracticeAction = useMemo(
        () => getInsertionSortPracticeAction(currentStep),
        [currentStep],
    );
    const selectionCurrentIndex = typeof selectionSortMeta?.currentIndex === "number"
        ? selectionSortMeta.currentIndex
        : null;
    const selectionMinIndex = typeof selectionSortMeta?.minIndex === "number"
        ? selectionSortMeta.minIndex
        : null;
    const selectionCandidateIndex = typeof selectionSortMeta?.candidateIndex === "number"
        ? selectionSortMeta.candidateIndex
        : null;
    const selectionSwapFromIndex = typeof selectionSortMeta?.swapFrom === "number"
        ? selectionSortMeta.swapFrom
        : currentStep?.activeIndices?.[0] ?? null;
    const selectionSwapToIndex = typeof selectionSortMeta?.swapTo === "number"
        ? selectionSortMeta.swapTo
        : currentStep?.activeIndices?.[1] ?? null;
    const isQuickSortStep = hasQuickSortMetadata && algorithmType === "sort";
    const isHeapStep = Boolean(currentStep?.heap) && algorithmType === "sort";
    const heapIdentityData = useMemo(() => {
        if (!isHeapStep || steps.length === 0) {
            return {
                idsByIndex: new Map<number, string>(),
                incomingRootNodeId: null as string | null,
            };
        }

        let nextId = 0;
        const createId = () => `heap-entity-${nextId++}`;

        let previousResolvedNodes: HeapIdentityNode[] = [];
        let resolvedBeforeCurrent: HeapIdentityNode[] = [];
        let resolvedAtCurrent: HeapIdentityNode[] = [];

        for (let stepIndex = 0; stepIndex <= safeIndex && stepIndex < steps.length; stepIndex += 1) {
            const step = steps[stepIndex];
            if (!step?.heap || !Array.isArray(step.arrayState)) {
                continue;
            }

            const boundaryEnd = Math.min(
                Math.max(step.heap.heapBoundaryEnd ?? -1, -1),
                step.arrayState.length - 1,
            );
            const inHeapValues = isPracticeMode
                ? step.arrayState
                : (boundaryEnd >= 0
                    ? step.arrayState.slice(0, boundaryEnd + 1)
                    : []);

            const resolvedNodes = reconcileHeapIdentityNodes(previousResolvedNodes, inHeapValues, createId);

            if (stepIndex === safeIndex) {
                resolvedBeforeCurrent = previousResolvedNodes;
                resolvedAtCurrent = resolvedNodes;
            }

            previousResolvedNodes = resolvedNodes;
        }

        const idsByIndex = new Map<number, string>(
            resolvedAtCurrent.map((node) => [node.index, node.id]),
        );
        const previousIndexById = new Map<string, number>(
            resolvedBeforeCurrent.map((node) => [node.id, node.index]),
        );

        let incomingRootNodeId: string | null = null;
        const rootNode = resolvedAtCurrent.find((node) => node.index === 0);
        if (rootNode) {
            const previousIndex = previousIndexById.get(rootNode.id);
            if (typeof previousIndex === "number" && previousIndex > 0) {
                incomingRootNodeId = rootNode.id;
            }
        }

        return {
            idsByIndex,
            incomingRootNodeId,
        };
    }, [isHeapStep, isPracticeMode, safeIndex, steps]);
    const heapNodes = useMemo(
        () => buildHeapVisualNodes(currentStep, values, heapIdentityData.idsByIndex, heapIdentityData.incomingRootNodeId, isPracticeMode),
        [currentStep, heapIdentityData.idsByIndex, heapIdentityData.incomingRootNodeId, isPracticeMode, values],
    );
    const heapNodeByIndex = useMemo(
        () => new Map(heapNodes.map((node) => [node.index, node])),
        [heapNodes],
    );
    const heapEdges = useMemo(
        () => buildHeapVisualEdges(heapNodes),
        [heapNodes],
    );
    const heapBoundaryEnd = useMemo(
        () => (isHeapStep
            ? Math.min(Math.max(currentStep?.heap?.heapBoundaryEnd ?? -1, -1), Math.max(values.length - 1, -1))
            : -1),
        [currentStep, isHeapStep, values.length],
    );
    const fallbackSortedStart = heapBoundaryEnd + 1;
    const explicitSortedIndex = currentStep?.heap?.sortedTargetIndex;
    const sortedStartIndex = typeof explicitSortedIndex === "number"
        ? Math.min(Math.max(explicitSortedIndex, 0), Math.max(values.length - 1, 0))
        : fallbackSortedStart;
    const normalizedHeapAction = (currentStep?.actionLabel ?? "").trim().toLowerCase();
    const isHeapComplete = isHeapStep && (normalizedHeapAction === "complete" || currentStep?.heap?.phase === "complete");
    const displayedHeapArrayValues = useMemo(
        () => {
            if (!isHeapStep) {
                return [] as Array<number | null>;
            }

            if (values.length === 0) {
                return [] as Array<number | null>;
            }

            if (isHeapComplete) {
                return values.map((value) => value);
            }

            if (sortedStartIndex < 0 || sortedStartIndex >= values.length) {
                return values.map(() => null);
            }

            return values.map((value, index) => (index >= sortedStartIndex ? value : null));
        },
        [isHeapComplete, isHeapStep, sortedStartIndex, values],
    );
    const showFallingNode = Boolean(
        isHeapStep
        && !isPracticeMode
        && (currentStep?.heap?.parentChildComparison === "root_end_swap")
        && (currentStep?.actionLabel ?? "").trim().toLowerCase().includes("swap")
        && sortedStartIndex >= 0
        && sortedStartIndex < values.length,
    );
    const fallingValue = showFallingNode
        ? (typeof currentStep?.heap?.extractedValue === "number"
            ? currentStep.heap.extractedValue
            : values[sortedStartIndex])
        : null;
    const rootNodeX = heapNodes.find((node) => node.index === 0)?.x ?? 50;
    const rootNodeY = heapNodes.find((node) => node.index === 0)?.y ?? 10;
    const explicitFromIndex = currentStep?.heap?.extractedFromIndex;
    const fallingFromNode = typeof explicitFromIndex === "number"
        ? heapNodeByIndex.get(Math.min(Math.max(explicitFromIndex, 0), values.length - 1))
        : null;
    const fallingFromX = fallingFromNode?.x ?? rootNodeX;
    const fallingFromY = fallingFromNode?.y ?? rootNodeY;
    const [measuredLandingTarget, setMeasuredLandingTarget] = useState<{ x: number; y: number } | null>(null);
    const fallbackFallingTargetX = values.length > 0
        ? 6 + (((sortedStartIndex + 0.5) / values.length) * 88)
        : 50;
    const fallbackFallingTargetY = 87;
    const fallingTargetX = measuredLandingTarget?.x ?? fallbackFallingTargetX;
    const fallingTargetY = measuredLandingTarget?.y ?? fallbackFallingTargetY;
    const fallingTrajectoryPath = useMemo(
        () => buildTrajectoryPath(fallingFromX, fallingFromY, fallingTargetX, fallingTargetY),
        [fallingFromX, fallingFromY, fallingTargetX, fallingTargetY],
    );

    useLayoutEffect(() => {
        if (!isHeapStep || !showFallingNode) {
            setMeasuredLandingTarget(null);
            return;
        }

        const stage = heapStageRef.current;
        const targetCell = heapArrayCellRefs.current[sortedStartIndex] ?? null;

        if (!stage || !targetCell) {
            setMeasuredLandingTarget(null);
            return;
        }

        const stageRect = stage.getBoundingClientRect();
        const targetRect = targetCell.getBoundingClientRect();

        if (stageRect.width <= 0 || stageRect.height <= 0) {
            setMeasuredLandingTarget(null);
            return;
        }

        const x = ((targetRect.left + (targetRect.width / 2) - stageRect.left) / stageRect.width) * 100;
        const y = ((targetRect.top + (targetRect.height / 2) - stageRect.top) / stageRect.height) * 100;

        setMeasuredLandingTarget({ x, y });
    }, [isHeapStep, showFallingNode, sortedStartIndex, safeIndex]);
    const searchTarget = useMemo(
        () => (typeof searchTargetValue === "number" ? searchTargetValue : getSearchTargetValue(steps)),
        [searchTargetValue, steps],
    );
    const searchWindow = useMemo(
        () => getSearchWindow(currentStep, values.length),
        [currentStep, values.length],
    );
    const midpointValue = useMemo(() => {
        if (typeof searchWindow.midpoint !== "number") {
            return null;
        }

        return values[searchWindow.midpoint] ?? null;
    }, [searchWindow.midpoint, values]);
    const isTargetAtMidpoint = typeof searchTarget === "number"
        && typeof midpointValue === "number"
        && searchTarget === midpointValue;
    const densityLevel = useMemo(() => {
        if (values.length >= 32) {
            return "ultra";
        }

        if (values.length >= 24) {
            return "dense";
        }

        if (values.length >= 16) {
            return "compact";
        }

        return "normal";
    }, [values.length]);
    const barMinWidthPx = useMemo(() => {
        if (densityLevel === "ultra") {
            return 18;
        }

        if (densityLevel === "dense") {
            return 24;
        }

        if (densityLevel === "compact") {
            return 30;
        }

        return 40;
    }, [densityLevel]);
    const barGapPx = useMemo(() => {
        if (densityLevel === "ultra") {
            return 4;
        }

        if (densityLevel === "dense") {
            return 6;
        }

        return 8;
    }, [densityLevel]);
    const selectionTileSizePx = useMemo(() => {
        if (densityLevel === "ultra") {
            return 36;
        }

        if (densityLevel === "dense") {
            return 44;
        }

        if (densityLevel === "compact") {
            return 52;
        }

        return 64;
    }, [densityLevel]);
    const selectionTileFontPx = useMemo(() => {
        if (densityLevel === "ultra") {
            return 14;
        }

        if (densityLevel === "dense") {
            return 16;
        }

        if (densityLevel === "compact") {
            return 18;
        }

        return 22;
    }, [densityLevel]);
    const selectionGapPx = useMemo(() => {
        if (densityLevel === "ultra") {
            return 6;
        }

        if (densityLevel === "dense") {
            return 8;
        }

        return 12;
    }, [densityLevel]);
    const searchTileSizePx = useMemo(() => {
        if (densityLevel === "ultra") {
            return 42;
        }

        if (densityLevel === "dense") {
            return 48;
        }

        if (densityLevel === "compact") {
            return 52;
        }

        return 56;
    }, [densityLevel]);
    const searchTileFontPx = useMemo(() => {
        if (densityLevel === "ultra") {
            return 14;
        }

        if (densityLevel === "dense") {
            return 16;
        }

        return 18;
    }, [densityLevel]);
    const showSearchDecisionControls = algorithmType === "search"
        && isPracticeMode
        && typeof onSearchDecision === "function";
    const isHeapPracticeInteractive = isHeapStep
        && isPracticeMode
        && typeof onBarClick === "function";
    const showSelectionPracticeControls = isPracticeMode
        && isSelectionSortStep
        && typeof onSelectionPracticeGoRight === "function"
        && typeof onSelectionPracticeSelectMin === "function";

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

        const shouldApplySwapIdentity = isPracticeMode
            && feedbackTone === "correct"
            && recentPracticeAction === "swap"
            && feedbackIndices.length === 2;
        const swapIndices = shouldApplySwapIdentity
            ? [feedbackIndices[0], feedbackIndices[1]] as [number, number]
            : null;

        setVisualBars((previousBars) => {
            if (
                previousBars.length === 0 ||
                previousBars.length !== values.length ||
                (!isPracticeMode && currentStepIndex === 0)
            ) {
                return values.map((value) => createBar(value));
            }

            return reconcileBars(previousBars, values, createBar, swapIndices);
        });
    }, [currentStepIndex, feedbackIndices, feedbackTone, isPracticeMode, recentPracticeAction, values]);

    return (
        <section
            className={cn(
                "glass overflow-hidden rounded-3xl border border-white/10 p-4 sm:p-6",
                className,
            )}
            data-feedback-version={feedbackVersion}
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
                                    {(() => {
                                        if (algorithmType === "search") {
                                            return "Use Go Left, Go Right, or Found to decide the next move";
                                        }

                                        if (isQuickSortStep) {
                                            if (quickSortPracticeAction === "compare") {
                                                return "Use the bottom array strip to validate the next comparison";
                                            }

                                            if (quickSortPracticeAction === "swap") {
                                                return "Use the bottom array strip to validate the next swap";
                                            }

                                            return "Use the bottom array strip to follow the next quick sort action";
                                        }

                                        if (isInsertionSortStep) {
                                            if (insertionSortPracticeAction === "insert") {
                                                return "Select one bar to validate the insertion position";
                                            }

                                            if (insertionSortPracticeAction === "shift") {
                                                return "Select source and destination bars to validate the shift";
                                            }

                                            return "Select two bars to validate the comparison";
                                        }

                                        if (isHeapStep) {
                                            return "Click two heap nodes to validate a swap";
                                        }

                                        if (isMergeSortStep || isSelectionSortStep) {
                                            return "Go Right to scan the minimum, Select Min to lock it, then click the swap partner index";
                                        }

                                        return "Click two bars to validate a swap";
                                    })()}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                        {algorithmType === "search" ? (
                            <>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-400" />
                                    Comparing
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-slate-400 to-slate-500" />
                                    Discarded
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500" />
                                    Found
                                </span>
                            </>
                        ) : isInsertionSortStep ? (
                            <>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-400" />
                                    Key / Compare
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-red-300 to-red-500" />
                                    Shift
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-sky-300 to-sky-500" />
                                    Insert Position
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-emerald-300 to-emerald-500" />
                                    Sorted Prefix
                                </span>
                            </>
                        ) : isHeapStep ? (
                            <>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-blue-400 to-blue-500" />
                                    Heap Node
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-400" />
                                    Comparing
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-red-400 to-red-500" />
                                    Swapping
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500" />
                                    Extracted / Falling
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500" />
                                    Sorted Array
                                </span>
                            </>
                        ) : isSelectionSortStep ? (
                            <>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-slate-300 to-slate-500" />
                                    Unsorted
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-sky-300 to-sky-500" />
                                    Current Min
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-red-300 to-red-500" />
                                    Candidate
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-emerald-300 to-emerald-500" />
                                    Sorted Zone
                                </span>
                            </>
                        ) : isMergeSortStep ? (
                            <>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-blue-400 to-blue-500" />
                                    Merge Group
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-sky-300 to-sky-400" />
                                    Active Group
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-400" />
                                    Comparing
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500" />
                                    Placed / Sorted
                                </span>
                                {isPracticeMode ? (
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                        <span className="h-2.5 w-2.5 rounded-sm border border-sky-200/80 bg-sky-400/20 ring-2 ring-cyan-300/80" />
                                        Suggested Step
                                    </span>
                                ) : null}
                                {isPracticeMode ? (
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                        <span className="h-2.5 w-2.5 rounded-sm border border-sky-200/80 bg-sky-400/20 ring-2 ring-fuchsia-300/85" />
                                        Selected
                                    </span>
                                ) : null}
                            </>
                        ) : (
                            <>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-400" />
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
                            </>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-bg/60 p-3 sm:p-4">
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                        <span className="text-text-secondary">Current transition</span>
                        <span className={cn("font-medium", values.length > 0 ? "text-white" : "text-text-secondary")}>
                            {values.length > 0 ? tone.emphasisLabel : "No active step"}
                        </span>
                    </div>

                    {heapStepMeta ? (
                        <div className="mb-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-text-secondary sm:grid-cols-2 lg:grid-cols-4">
                            <span>
                                Phase: <span className="text-text-primary">{formatActionLabel(heapStepMeta.phase || "--")}</span>
                            </span>
                            <span>
                                Heap Boundary: <span className="text-text-primary">0 to {heapStepMeta.heapBoundaryEnd}</span>
                            </span>
                            <span>
                                Heap Index: <span className="text-text-primary">{heapStepMeta.heapIndex ?? "--"}</span>
                            </span>
                            <span>
                                Parent/Child: <span className="text-text-primary">{heapComparison}</span>
                            </span>
                        </div>
                    ) : hasQuickSortMetadata ? (
                        <div className="mb-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-text-secondary sm:grid-cols-2 lg:grid-cols-4">
                            <span>
                                Partition Range: <span className="text-text-primary">{quickSortRange ? `${quickSortRange.low}..${quickSortRange.high}` : "--"}</span>
                            </span>
                            <span>
                                Pivot: <span className="text-text-primary">{isQuickSortCompareOrSwap && typeof quickSortMeta?.pivot === "number" ? quickSortMeta.pivot : "--"}</span>
                            </span>
                            <span>
                                Pivot Final Index: <span className="text-text-primary">{isQuickSortPivotPlaced ? (quickSortPivotIndex ?? "--") : "--"}</span>
                            </span>
                            <span>
                                Quick Sort Step: <span className="text-text-primary">{formatActionLabel(currentStep?.actionLabel ?? "--")}</span>
                            </span>
                        </div>
                    ) : selectionSortMeta ? (
                        <div className="mb-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-text-secondary sm:grid-cols-2 lg:grid-cols-4">
                            <span>
                                Phase: <span className="text-text-primary">{formatActionLabel(selectionSortMeta.type ?? currentStep?.actionLabel ?? "--")}</span>
                            </span>
                            <span>
                                Current i: <span className="text-text-primary">{selectionCurrentIndex ?? "--"}</span>
                            </span>
                            <span>
                                Current min: <span className="text-text-primary">{selectionMinIndex ?? "--"}</span>
                            </span>
                            <span>
                                Candidate j: <span className="text-text-primary">{selectionCandidateIndex ?? "--"}</span>
                            </span>
                        </div>
                    ) : hasInsertionSortMetadata ? (
                        <div className="mb-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-text-secondary sm:grid-cols-2 lg:grid-cols-4">
                            <span>
                                Key: <span className="text-text-primary">{insertionSortMeta?.key ?? "--"}</span>
                            </span>
                            <span>
                                Current Index: <span className="text-text-primary">{insertionSortMeta?.currentIndex ?? "--"}</span>
                            </span>
                            <span>
                                Compare Index: <span className="text-text-primary">{insertionSortMeta?.compareIndex ?? "--"}</span>
                            </span>
                            <span>
                                Insert Position: <span className="text-text-primary">{insertionSortMeta?.insertPosition ?? "--"}</span>
                            </span>
                            <span>
                                Shift: <span className="text-text-primary">{insertionSortMeta?.shiftFrom ?? "--"} to {insertionSortMeta?.shiftTo ?? "--"}</span>
                            </span>
                            <span>
                                Sorted Boundary: <span className="text-text-primary">{insertionSortMeta?.sortedBoundary ?? "--"}</span>
                            </span>
                            <span>
                                Insertion Step: <span className="text-text-primary">{formatActionLabel(currentStep?.actionLabel ?? "--")}</span>
                            </span>
                        </div>
                    ) : mergeSortMeta ? (
                        <div className="mb-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-text-secondary sm:grid-cols-2 lg:grid-cols-4">
                            <span>Phase: <span className="text-text-primary">{formatActionLabel(mergeSortMeta.type ?? "--")}</span></span>
                            <span>Depth: <span className="text-text-primary">{mergeSortMeta.recursionDepth}</span></span>
                            <span>Range: <span className="text-text-primary">[{mergeSortMeta.left}..{mergeSortMeta.right}]</span></span>
                            <span>Mid: <span className="text-text-primary">{typeof mergeSortMeta.mid === "number" ? mergeSortMeta.mid : "--"}</span></span>
                        </div>
                    ) : null}

                    {isPracticeMode && hintMessage ? (
                        <div className="mb-4 rounded-2xl border border-sky-400/10 bg-sky-400/5 px-4 py-3 text-sm text-sky-50">
                            {hintMessage}
                        </div>
                    ) : null}

                    {algorithmType === "search" ? (
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="text-text-secondary">Find:</span>
                                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                                    {searchTarget ?? "--"}
                                </span>
                                <span className="text-text-secondary">
                                    Window: {searchWindow.low} to {searchWindow.high}
                                </span>
                            </div>

                            {showSearchDecisionControls ? (
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => onSearchDecision?.("left")}
                                        disabled={isInteractionDisabled || isTargetAtMidpoint}
                                    >
                                        Go Left
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => onSearchDecision?.("right")}
                                        disabled={isInteractionDisabled || isTargetAtMidpoint}
                                    >
                                        Go Right
                                    </Button>
                                    <Button
                                        variant="default"
                                        onClick={() => onSearchDecision?.("found")}
                                        disabled={isInteractionDisabled}
                                    >
                                        Found
                                    </Button>
                                </div>
                            ) : null}

                            {showSearchDecisionControls && isTargetAtMidpoint && !practiceCompleted ? (
                                <p className="text-xs text-emerald-200">
                                    Midpoint matches the target — click Found.
                                </p>
                            ) : null}

                            <div className="flex flex-wrap items-end justify-center" style={{ gap: `${selectionGapPx}px` }}>
                                {values.length > 0 ? (
                                    values.map((value, index) => {
                                        const isActive = activeIndices.has(index);
                                        const isDiscarded = discardedIndexSet.has(index);
                                        const isInRange = index >= searchWindow.low && index <= searchWindow.high;
                                        const isMidpoint = typeof searchWindow.midpoint === "number" && index === searchWindow.midpoint;
                                        const isFound = isSearchFound && isMidpoint;

                                        return (
                                            <motion.div
                                                key={`search-box-${index}-${value}`}
                                                layout
                                                transition={shouldReduceMotion ? reducedMotionTransition : layoutTransition}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 transition-[opacity,filter] duration-500",
                                                    isDiscarded && "opacity-30 grayscale",
                                                )}
                                            >
                                                <motion.div
                                                    animate={shouldReduceMotion ? {} : { scale: isMidpoint ? 1.12 : 1 }}
                                                    transition={{ duration: 0.25 }}
                                                    className={cn(
                                                        "flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-semibold text-white",
                                                        isInRange && "border-accent/40 bg-accent/10",
                                                        isMidpoint && "border-accent/60 bg-accent/25 shadow-[0_0_20px_rgba(213,255,64,0.3)]",
                                                        isActive && "ring-2 ring-accent/40",
                                                        isFound && "border-emerald-400/60 bg-emerald-400/20 text-emerald-100 shadow-[0_0_22px_rgba(52,211,153,0.35)]",
                                                    )}
                                                    style={{
                                                        width: `${searchTileSizePx}px`,
                                                        height: `${searchTileSizePx}px`,
                                                        fontSize: `${searchTileFontPx}px`,
                                                    }}
                                                >
                                                    {value}
                                                </motion.div>
                                                <span className="text-[11px] text-text-secondary">
                                                    {index}
                                                </span>
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
                    ) : isSelectionSortStep ? (
                        <div className="flex flex-col gap-4">
                            {showSelectionPracticeControls ? (
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => onSelectionPracticeGoRight?.()}
                                        disabled={!canSelectionPracticeGoRight || isInteractionDisabled}
                                    >
                                        Go Right
                                    </Button>
                                    <Button
                                        variant="default"
                                        onClick={() => onSelectionPracticeSelectMin?.()}
                                        disabled={!canSelectionPracticeSelectMin || isInteractionDisabled}
                                    >
                                        Select Min
                                    </Button>
                                </div>
                            ) : null}

                        <motion.div
                            key={`selection-tiles-${mode}`}
                            initial={shouldReduceMotion
                                ? false
                                : (feedbackTone === "incorrect"
                                    ? { x: 0 }
                                    : (feedbackTone === "correct" ? { scale: 0.995 } : false))}
                            animate={shouldReduceMotion
                                ? {}
                                : (feedbackTone === "incorrect"
                                    ? { x: [0, -8, 8, -5, 5, 0] }
                                    : (feedbackTone === "correct"
                                        ? { scale: [1, 1.015, 1] }
                                        : { x: 0, scale: 1 }))}
                            transition={{ duration: 0.36, ease: "easeOut" }}
                            className="flex min-h-56 items-center overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] p-4"
                            style={{ gap: `${selectionGapPx}px` }}
                        >
                            {visualBars.length > 0 ? (
                                visualBars.map((bar, index) => {
                                    const isSorted = sortedIndices.has(index);
                                    const isSelected = selectedIndexSet.has(index);
                                    const isSuggested = suggestedIndexSet.has(index);
                                    const isFeedbackTarget = feedbackIndexSet.has(index);
                                    const isDiscarded = discardedIndexSet.has(index);
                                    const isInteractive = isPracticeMode && typeof onBarClick === "function" && !isDiscarded;
                                    const isMin = selectionMinIndex === index;
                                    const isCurrent = selectionCurrentIndex === index;
                                    const isCandidate = selectionCandidateIndex === index;
                                    const isSwapFrom = selectionSwapFromIndex === index;
                                    const isSwapTo = selectionSwapToIndex === index;
                                    const isPracticeCandidate = isPracticeMode
                                        && selectionPracticeCandidateIndex === index
                                        && selectionPracticeConfirmedMinIndex === null;
                                    const isPracticeConfirmedMin = isPracticeMode
                                        && selectionPracticeConfirmedMinIndex === index;
                                    const isPracticeSwapAnchor = isPracticeMode
                                        && selectionPracticeSwapAnchorIndex === index;
                                    const shouldPulseCandidate = !isPracticeMode && isCandidate && !isSorted && !isMin && !shouldReduceMotion;
                                    const shouldPulseMin = !isPracticeMode && isMin && !isSorted && !shouldReduceMotion;
                                    const baseScale = isSelected ? 1.03 : 1;
                                    const scaleSequence = shouldPulseCandidate
                                        ? [baseScale, 1.07, baseScale]
                                        : (shouldPulseMin
                                            ? [baseScale, 1.05, baseScale]
                                            : (isPracticeCandidate && !shouldReduceMotion
                                                ? [baseScale, 1.06, baseScale]
                                                : baseScale));

                                    const tileClassName = cn(
                                        "flex items-center justify-center rounded-xl border font-semibold transition-[transform,background-color,border-color,box-shadow] duration-300",
                                        "border-white/20 bg-slate-900/60 text-slate-100",
                                        isSorted && "border-emerald-300/70 bg-emerald-400 text-emerald-950 shadow-[0_0_22px_rgba(52,211,153,0.3)]",
                                        !isPracticeMode && !isSorted && (isMin || isCurrent || isSwapFrom) && "border-sky-200/80 bg-sky-400 text-sky-950 shadow-[0_0_22px_rgba(56,189,248,0.3)]",
                                        !isPracticeMode && !isSorted && !isMin && (isCandidate || isSwapTo) && "border-red-200/80 bg-red-500 text-red-50 shadow-[0_0_24px_rgba(239,68,68,0.34)]",
                                        isPracticeMode && isPracticeCandidate && "border-red-200/85 bg-red-500 text-red-50 shadow-[0_0_24px_rgba(239,68,68,0.35)]",
                                        isPracticeMode && isPracticeConfirmedMin && "border-sky-200/80 bg-sky-400 text-sky-950 shadow-[0_0_22px_rgba(56,189,248,0.34)]",
                                        isPracticeMode && isPracticeSwapAnchor && !isPracticeConfirmedMin && "ring-2 ring-accent/70 ring-offset-1 ring-offset-transparent",
                                        isSuggested && isPracticeMode && "border-accent/60 bg-accent/70 text-slate-900 shadow-[0_0_20px_rgba(213,255,64,0.28)]",
                                        isSelected && isPracticeMode && "border-sky-200/80 bg-sky-400 text-sky-950 shadow-[0_0_20px_rgba(56,189,248,0.3)]",
                                        isFeedbackTarget && feedbackTone === "correct" && "border-emerald-300/80 bg-emerald-400 text-emerald-950 shadow-[0_0_20px_rgba(52,211,153,0.32)]",
                                        isFeedbackTarget && feedbackTone === "incorrect" && "border-red-300/80 bg-red-500 text-red-50 shadow-[0_0_20px_rgba(248,113,113,0.35)]",
                                        isDiscarded && "opacity-30 grayscale pointer-events-none",
                                    );

                                    return (
                                        <motion.div
                                            key={bar.id}
                                            layout
                                            transition={shouldReduceMotion ? reducedMotionTransition : layoutTransition}
                                            className={cn(
                                                "flex flex-col items-center gap-2",
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
                                            <motion.div
                                                animate={shouldReduceMotion
                                                    ? {}
                                                    : {
                                                        y: (isMin || isCandidate || isSelected || isPracticeCandidate || isPracticeConfirmedMin) && !isSorted ? -3 : 0,
                                                        scale: scaleSequence,
                                                    }}
                                                transition={{ duration: 0.28, ease: "easeOut" }}
                                                className={tileClassName}
                                                style={{
                                                    width: `${selectionTileSizePx}px`,
                                                    height: `${selectionTileSizePx}px`,
                                                    fontSize: `${selectionTileFontPx}px`,
                                                }}
                                                aria-label={`Index ${index}, value ${bar.value}`}
                                                aria-current={isMin || isCandidate || isSelected ? "true" : undefined}
                                            >
                                                {bar.value}
                                            </motion.div>
                                            <span className={cn(
                                                "text-[11px] text-text-secondary",
                                                isSorted && "text-emerald-200",
                                                !isSorted && isMin && "text-sky-100",
                                                !isSorted && !isMin && isCandidate && "text-red-100",
                                                !isSorted && isPracticeCandidate && "text-red-100",
                                                !isSorted && isPracticeConfirmedMin && "text-sky-100",
                                            )}
                                            >
                                                {index}
                                            </span>
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
                    ) : isMergeSortStep ? (
                        <MergeSortVisualizer
                            steps={steps}
                            currentStepIndex={safeIndex}
                            mode={mode}
                            practiceArray={values}
                            selectedIndices={selectedIndices}
                            suggestedIndices={suggestedIndices}
                            isInteractionDisabled={isInteractionDisabled}
                            practiceCompleted={practiceCompleted}
                            onBarClick={onBarClick}
                        />
                    ) : isHeapStep ? (
                        <div>
                            <div className="mb-3 flex items-center justify-between text-xs text-text-secondary">
                                <span>{isHeapComplete ? "Sorted array" : "Heap tree + array"}</span>
                                <span>
                                    {isHeapComplete
                                        ? "Heap complete"
                                        : `Boundary: 0 to ${heapBoundaryEnd}`}
                                </span>
                            </div>

                            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                                <div ref={heapStageRef} className="relative h-[30rem] w-full">
                                    {!isHeapComplete ? (
                                        <>
                                            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                {heapEdges.map((edge) => (
                                                    <motion.line
                                                        key={edge.id}
                                                        initial={false}
                                                        animate={{
                                                            x1: edge.x1,
                                                            y1: edge.y1,
                                                            x2: edge.x2,
                                                            y2: edge.y2,
                                                        }}
                                                        transition={shouldReduceMotion
                                                            ? reducedMotionTransition
                                                            : {
                                                                x1: { ...layoutTransition },
                                                                y1: { ...layoutTransition },
                                                                x2: { ...layoutTransition },
                                                                y2: { ...layoutTransition },
                                                            }}
                                                        stroke="rgba(255,255,255,0.34)"
                                                        strokeWidth="1.1"
                                                        strokeLinecap="round"
                                                    />
                                                ))}
                                            </svg>

                                            {heapNodes.map((node) => {
                                                const nodeMotion = getNodeAnimate(node.state, false);
                                                const isSelectedNode = selectedIndexSet.has(node.index);
                                                const isSuggestedNode = suggestedIndexSet.has(node.index);
                                                const isFeedbackNode = feedbackIndexSet.has(node.index);
                                                const isInteractiveNode = isHeapPracticeInteractive && !isInteractionDisabled;
                                                const shouldShowSuggestionRing = isSuggestedNode && !isHeapPracticeInteractive;

                                                return (
                                                    <motion.div
                                                        key={node.id}
                                                        initial={false}
                                                        transition={shouldReduceMotion
                                                            ? reducedMotionTransition
                                                            : {
                                                                left: { ...layoutTransition },
                                                                top: { ...layoutTransition },
                                                                scale: { duration: node.incomingToRoot ? 0.44 : 0.28, ease: "easeOut" },
                                                                x: { duration: 0.34, ease: "easeInOut" },
                                                                y: { duration: 0.34, ease: "easeInOut" },
                                                                boxShadow: { duration: 0.34, ease: "easeOut" },
                                                            }}
                                                        animate={shouldReduceMotion
                                                            ? { left: `${node.x}%`, top: `${node.y}%`, scale: 1, x: 0, y: 0 }
                                                            : {
                                                                left: `${node.x}%`,
                                                                top: `${node.y}%`,
                                                                ...nodeMotion,
                                                                scale: node.incomingToRoot ? [1, 1.16, 1] : nodeMotion.scale,
                                                                boxShadow: node.incomingToRoot
                                                                    ? [
                                                                        "0 0 0 rgba(56,189,248,0)",
                                                                        "0 0 24px rgba(56,189,248,0.45)",
                                                                        "0 0 10px rgba(56,189,248,0.22)",
                                                                    ]
                                                                    : "0 0 0 rgba(0,0,0,0)",
                                                            }}
                                                            className={cn(
                                                                "absolute",
                                                                isInteractiveNode && "cursor-pointer",
                                                                isInteractionDisabled && "cursor-not-allowed opacity-80",
                                                            )}
                                                        style={{
                                                            marginLeft: -HEAP_NODE_RADIUS_PX,
                                                            marginTop: -HEAP_NODE_RADIUS_PX,
                                                        }}
                                                            onClick={() => {
                                                                if (isInteractiveNode) {
                                                                    onBarClick(node.index);
                                                                }
                                                            }}
                                                            onKeyDown={(event) => {
                                                                if (!isInteractiveNode) {
                                                                    return;
                                                                }

                                                                if (event.key === "Enter" || event.key === " ") {
                                                                    event.preventDefault();
                                                                    onBarClick(node.index);
                                                                }
                                                            }}
                                                            role={isInteractiveNode ? "button" : undefined}
                                                            tabIndex={isInteractiveNode ? 0 : undefined}
                                                            aria-disabled={isHeapPracticeInteractive ? isInteractionDisabled : undefined}
                                                            aria-pressed={isInteractiveNode ? isSelectedNode : undefined}
                                                    >
                                                        <div className="relative">
                                                            <div className={cn(
                                                                "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold",
                                                                getNodeClassName(node.state),
                                                                node.incomingToRoot && "ring-2 ring-sky-300/70 shadow-[0_0_24px_rgba(56,189,248,0.35)]",
                                                                shouldShowSuggestionRing && "ring-2 ring-accent/70",
                                                                    isSelectedNode && "ring-2 ring-sky-300/80",
                                                                    isFeedbackNode && feedbackTone === "correct" && "ring-2 ring-emerald-300/80",
                                                                    isFeedbackNode && feedbackTone === "incorrect" && "ring-2 ring-red-300/80",
                                                            )}
                                                            >
                                                                {node.value}
                                                            </div>
                                                            <span className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 pt-1 text-[10px] text-text-secondary">
                                                                i{node.index}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </>
                                    ) : null}

                                    <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
                                        <div className="mb-2 flex items-center justify-between text-xs text-text-secondary">
                                            <span>Array view</span>
                                            <span>{isHeapComplete ? "Sorted array" : "Sorted region grows from right"}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                                            {displayedHeapArrayValues.map((value, index) => {
                                                const isSortedCell = value !== null;
                                                const isLandingCell = showFallingNode && index === sortedStartIndex;

                                                return (
                                                    <motion.div
                                                        key={`heap-array-${index}-${value ?? "empty"}-${safeIndex}`}
                                                        ref={(element) => {
                                                            heapArrayCellRefs.current[index] = element;
                                                        }}
                                                        layout
                                                        transition={shouldReduceMotion ? reducedMotionTransition : layoutTransition}
                                                        animate={shouldReduceMotion
                                                            ? {}
                                                            : (isLandingCell
                                                                ? { scale: [0.84, 1.12, 1], y: [3, -2, 0] }
                                                                : { scale: 1, y: 0 })}
                                                        className={cn(
                                                            "rounded-xl border px-2 py-3 text-center",
                                                            isSortedCell
                                                                ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-100"
                                                                : "border-white/10 bg-white/[0.03] text-white/30",
                                                        )}
                                                    >
                                                        <div className="text-sm font-semibold">{value ?? ""}</div>
                                                        <div className="text-[10px] text-text-secondary">idx {index}</div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {showFallingNode && fallingValue !== null ? (
                                        <>
                                            <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <motion.path
                                                    d={fallingTrajectoryPath}
                                                    fill="none"
                                                    stroke="rgba(52,211,153,0.6)"
                                                    strokeWidth="0.8"
                                                    strokeDasharray="2.2 1.6"
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    animate={{ pathLength: 1, opacity: 1 }}
                                                    transition={shouldReduceMotion
                                                        ? { duration: 0 }
                                                        : { duration: 0.5, ease: "easeOut" }}
                                                />
                                            </svg>

                                            <motion.div
                                                key={`fall-node-${currentStep?.stepNumber ?? safeIndex}`}
                                                className="pointer-events-none absolute z-30"
                                                style={{
                                                    left: `${fallingFromX}%`,
                                                    top: `${fallingFromY}%`,
                                                    marginLeft: -FALLING_NODE_RADIUS_PX,
                                                    marginTop: -FALLING_NODE_RADIUS_PX,
                                                }}
                                                initial={{ left: `${fallingFromX}%`, top: `${fallingFromY}%`, opacity: 1, scale: 1 }}
                                                animate={{ left: `${fallingTargetX}%`, top: `${fallingTargetY}%`, opacity: [1, 1, 0], scale: [1, 1.03, 0.7] }}
                                                transition={shouldReduceMotion
                                                    ? { duration: 0 }
                                                    : { duration: 0.68, ease: "easeInOut" }}
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300/80 bg-emerald-400/30 text-sm font-semibold text-emerald-50 shadow-[0_0_20px_rgba(52,211,153,0.38)]">
                                                    {fallingValue}
                                                </div>
                                            </motion.div>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            key={`bars-${mode}`}
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
                            className="flex min-h-64 items-end overflow-x-auto rounded-xl px-1 pb-1 pt-6 sm:min-h-72"
                            style={{ gap: `${barGapPx}px` }}
                        >
                            {visualBars.length > 0 ? (
                                visualBars.map((bar, index) => {
                                    const isActive = activeIndices.has(index);
                                    const isSorted = sortedIndices.has(index);
                                    const isSelected = selectedIndexSet.has(index);
                                    const isSuggested = suggestedIndexSet.has(index);
                                    const isFeedbackTarget = feedbackIndexSet.has(index);
                                    const isDiscarded = discardedIndexSet.has(index);
                                    const isInQuickSortRange = Boolean(
                                        quickSortRange
                                        && index >= quickSortRange.low
                                        && index <= quickSortRange.high,
                                    );
                                    const isQuickSortPivotPlacementIndex = typeof quickSortPivotIndex === "number"
                                        && index === quickSortPivotIndex;
                                    const isInsertionKey = isInsertionSortStep && insertionKeyIndex === index;
                                    const isInsertionCompare = isInsertionSortStep && insertionCompareIndex === index;
                                    const isInsertionInsertPosition = isInsertionSortStep && insertionPositionIndex === index;
                                    const isInsertionShift = isInsertionSortStep
                                        && (insertionSortMeta?.shiftFrom === index || insertionSortMeta?.shiftTo === index);
                                    const isInsertionSortedPrefix = isInsertionSortStep
                                        && insertionSortedBoundary !== null
                                        && index <= insertionSortedBoundary;
                                    const height = `${Math.max((bar.value / globalMax) * 100, 8)}%`;
                                    const isInteractive = isPracticeMode && typeof onBarClick === "function" && !isDiscarded;
                                    const shouldPulseMidpoint = !isPracticeMode && isSearchMidpoint && isActive && !shouldReduceMotion;
                                    const shouldEmphasizeFound = !isPracticeMode && isSearchFound && isActive && !shouldReduceMotion;
                                    const shouldEmphasizeNotFound = !isPracticeMode && isSearchNotFound && isActive && !shouldReduceMotion;
                                    const baseScale = isActive || isSelected ? 1.03 : 1;
                                    const scaleSequence = shouldPulseMidpoint
                                        ? [baseScale, 1.08, baseScale]
                                        : (shouldEmphasizeFound || shouldEmphasizeNotFound
                                            ? [baseScale, 1.06, baseScale]
                                            : baseScale);
                                    const pulseShadow = shouldEmphasizeFound
                                        ? "0 0 28px rgba(52,211,153,0.35)"
                                        : (shouldEmphasizeNotFound
                                            ? "0 0 28px rgba(248,113,113,0.35)"
                                            : undefined);

                                    return (
                                        <motion.div
                                            key={bar.id}
                                            layout
                                            transition={shouldReduceMotion ? reducedMotionTransition : layoutTransition}
                                            className={cn(
                                                "flex flex-1 flex-col items-center justify-end gap-2 transition-[opacity,filter] duration-500",
                                                isInteractive && "cursor-pointer",
                                                isInteractionDisabled && "cursor-not-allowed opacity-70",
                                                isDiscarded && "opacity-30 grayscale pointer-events-none",
                                            )}
                                            style={{ minWidth: `${barMinWidthPx}px` }}
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
                                                    densityLevel === "ultra" ? "text-[10px] font-medium text-text-secondary transition-colors duration-300" : "text-xs font-medium text-text-secondary transition-colors duration-300",
                                                    isSorted && "text-emerald-200",
                                                    isInsertionShift && "text-red-100",
                                                    (isInsertionKey || isInsertionCompare) && "text-yellow-100",
                                                    isInsertionInsertPosition && "text-sky-100",
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
                                                        scale: scaleSequence,
                                                        boxShadow: pulseShadow,
                                                    }}
                                                    transition={shouldReduceMotion
                                                        ? reducedMotionTransition
                                                        : {
                                                            ...activeBarTransition,
                                                            scale: { duration: 0.6, ease: "easeInOut" },
                                                            boxShadow: { duration: 0.4, ease: "easeOut" },
                                                        }}
                                                    className={cn(
                                                        "w-full rounded-t-xl border border-white/10 bg-gradient-to-b from-white/20 to-white/5 transition-[background-color,box-shadow,border-color] duration-300",
                                                        isSorted && "border-emerald-400/40 from-emerald-400/90 to-emerald-500 shadow-[0_0_18px_rgba(52,211,153,0.22)]",
                                                        isInsertionSortedPrefix && !isInsertionShift && !isInsertionInsertPosition && !(isInsertionKey || isInsertionCompare) && "border-emerald-300/45 from-emerald-300/85 to-emerald-500/90 shadow-[0_0_16px_rgba(52,211,153,0.2)]",
                                                        (isInsertionKey || isInsertionCompare) && "border-yellow-300/60 from-yellow-300/90 to-yellow-500 shadow-[0_0_18px_rgba(250,204,21,0.3)]",
                                                        isInsertionShift && "border-red-300/60 from-red-300/90 to-red-500 shadow-[0_0_18px_rgba(248,113,113,0.3)]",
                                                        isInsertionInsertPosition && "border-sky-300/60 from-sky-300/90 to-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.28)]",
                                                        isInQuickSortRange && !isHeapStep && "border-sky-300/40 from-sky-400/40 to-sky-500/20 shadow-[0_0_12px_rgba(56,189,248,0.18)]",
                                                        isQuickSortPivotPlacementIndex && "border-emerald-300/70 from-emerald-300 to-emerald-500 shadow-[0_0_24px_rgba(52,211,153,0.35)]",
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
                                                    densityLevel === "ultra" ? "text-[10px] text-text-secondary transition-colors duration-300" : "text-[11px] text-text-secondary transition-colors duration-300",
                                                    isSorted && "text-emerald-200",
                                                    isInsertionShift && "text-red-100",
                                                    (isInsertionKey || isInsertionCompare) && "text-yellow-100",
                                                    isInsertionInsertPosition && "text-sky-100",
                                                    isInQuickSortRange && !isSorted && "text-sky-100",
                                                    isQuickSortPivotPlacementIndex && "text-emerald-100",
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
                    )}
                </div>
            </div>
        </section>
    );
}

export default memo(AlgorithmVisualizer);
