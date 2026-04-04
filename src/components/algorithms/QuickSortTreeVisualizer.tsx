import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";

import type { AlgorithmSimulationStep, RecursionFrameModel } from "@/lib/api";
import { cn } from "@/lib/utils";

import QuickSortTreeNode, {
    type QuickSortNodeState,
    type QuickSortRenderableNode,
} from "./QuickSortTreeNode";

type LearningMode = "auto" | "practice";
type PracticeFeedbackTone = "correct" | "incorrect" | null;

type QuickSortTreeNodeModel = {
    id: string;
    low: number;
    high: number;
    depth: number;
    elements: number[];
    pivotIndex: number | null;
    pivotValue: number | null;
    leftPartition: number[];
    rightPartition: number[];
    leftChildId: string | null;
    rightChildId: string | null;
    parentId: string | null;
    state: QuickSortNodeState;
};

type QuickSortTreeLayout = {
    nodes: QuickSortRenderableNode[];
    edges: Array<{
        id: string;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    }>;
    stageWidth: number;
    stageHeight: number;
};

type QuickSortTreeVisualizerProps = {
    steps: AlgorithmSimulationStep[];
    currentStepIndex: number;
    mode?: LearningMode;
    values: number[];
    selectedIndices?: number[];
    suggestedIndices?: number[];
    feedbackIndices?: number[];
    feedbackTone?: PracticeFeedbackTone;
    isInteractionDisabled?: boolean;
    onBarClick?: (index: number) => void;
    shouldReduceMotion: boolean;
};

type VisualCell = { id: string; value: number };

type QuickSortCue = {
    pivotCandidateIndex: number | null;
    pointerIndex: number | null;
    pointerLabel: string | null;
};

function reconcileCells(prev: VisualCell[], nextValues: number[], create: (v: number) => VisualCell): VisualCell[] {
    const pool = new Map<number, VisualCell[]>();
    prev.forEach((cell) => {
        const bucket = pool.get(cell.value) ?? [];
        bucket.push(cell);
        pool.set(cell.value, bucket);
    });
    return nextValues.map((v) => {
        const bucket = pool.get(v);
        const reused = bucket?.shift();
        return reused ?? create(v);
    });
}

// ─── Layout constants ──────────────────────────────────────────────────────────
const NODE_CELL_WIDTH = 40;
const NODE_CELL_GAP = 4;
const NODE_HORIZONTAL_PADDING = 28;
const NODE_MIN_WIDTH = 80;
const SIBLING_GAP = 24;
const TREE_TOP_PADDING = 20;
const TREE_SIDE_PADDING = 32;
const LEVEL_HEIGHT = 108;
const NODE_CARD_HEIGHT = 72;
const STAGE_MAX_WIDTH = 1400;

const springTransition = {
    type: "spring" as const,
    stiffness: 340,
    damping: 28,
    mass: 0.9,
};

// ─── Step status text ──────────────────────────────────────────────────────────
function getStatusText(step: AlgorithmSimulationStep | undefined): string {
    if (!step) return "";

    const action = (step.actionLabel ?? "").trim().toLowerCase();
    const pivot = step.quickSort?.pivot;
    const range = step.quickSort?.range;
    const active = step.activeIndices ?? [];
    const arr = step.arrayState;

    if (action === "start") return "Quick Sort begins with the full unsorted array.";

    if (action === "recursive_call") {
        if (Array.isArray(range) && range.length >= 2) {
            return `Sorting subarray [${range[0]}..${range[1]}].`;
        }
        return "Entering a recursive call.";
    }

    if (action === "base_case") {
        return "Base case - this branch already has one or zero elements.";
    }

    if (action === "partition_start") {
        return "Starting a partition pass on the current subarray.";
    }

    if (action === "pivot_select") {
        return `Pivot selected: ${pivot ?? "?"}.`;
    }

    if (action === "pivot_placed") {
        return `Pivot ${pivot ?? "?"} placed at its final sorted position.`;
    }

    if (action === "pivot_positioned") {
        return "Partition complete. The pivot now splits this branch into left and right subarrays.";
    }

    if (action === "compare") {
        const [i] = active;
        if (typeof i === "number" && typeof arr[i] === "number" && typeof pivot === "number") {
            const value = arr[i];
            const side = value < pivot ? "left partition" : "right partition";
            const relation = value < pivot ? "<" : ">=";
            return `${value} ${relation} pivot (${pivot}) - move it toward the ${side}.`;
        }
        return "Comparing the active element against the pivot.";
    }

    if (action === "swap") {
        const [i, j] = active;
        if (typeof i === "number" && typeof j === "number") {
            const leftValue = arr[i];
            const rightValue = arr[j];
            if (typeof leftValue === "number" && typeof rightValue === "number") {
                return `Swapping ${leftValue} with ${rightValue}.`;
            }
        }
        return "Swapping two values inside the partition.";
    }

    if (action === "pivot_swap") {
        return "Moving the pivot into its final slot.";
    }

    if (action === "sort_left_start") return "Descending into the left branch.";
    if (action === "sort_right_start") return "Descending into the right branch.";
    if (action === "sort_left_complete") return "Left branch sorted.";
    if (action === "sort_right_complete") return "Right branch sorted.";

    if (action === "return") {
        if (Array.isArray(range) && range.length >= 2) {
            return `Subarray [${range[0]}..${range[1]}] is fully sorted.`;
        }
        return "Returning from the recursive call.";
    }

    if (action === "complete" || action === "done") return "Array is fully sorted.";

    return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
// ─── Helpers ───────────────────────────────────────────────────────────────────
function arraysEqual(left: number[], right: number[]) {
    if (left.length !== right.length) return false;
    for (let i = 0; i < left.length; i += 1) {
        if (left[i] !== right[i]) return false;
    }
    return true;
}

function getStack(step: AlgorithmSimulationStep | undefined) {
    return Array.isArray(step?.recursion?.stack)
        ? step.recursion.stack
        : (Array.isArray(step?.recursion?.frames) ? step.recursion.frames : []);
}

function normalizeFrameId(frame: RecursionFrameModel | undefined, fallback: string) {
    const rawId = frame?.id;
    if (typeof rawId === "string" || typeof rawId === "number") return String(rawId);
    return fallback;
}

function getFrameBounds(frame: RecursionFrameModel | undefined, fallbackRange: number[] | undefined) {
    const low = typeof frame?.leftIndex === "number"
        ? frame.leftIndex
        : (typeof frame?.lowIndex === "number"
            ? frame.lowIndex
            : (typeof frame?.startIndex === "number" ? frame.startIndex : fallbackRange?.[0]));
    const high = typeof frame?.rightIndex === "number"
        ? frame.rightIndex
        : (typeof frame?.highIndex === "number"
            ? frame.highIndex
            : (typeof frame?.endIndex === "number" ? frame.endIndex : fallbackRange?.[1]));
    if (typeof low !== "number" || typeof high !== "number") return null;
    return { low, high };
}

function getCurrentFrame(step: AlgorithmSimulationStep | undefined) {
    const stack = getStack(step);
    if (stack.length === 0) return null;
    const currentFrameId = step?.recursion?.currentFrameId;
    if (currentFrameId !== null && currentFrameId !== undefined) {
        const matched = stack.find((frame, index) =>
            normalizeFrameId(frame, `frame-${index}`) === String(currentFrameId),
        );
        if (matched) return matched;
    }
    return stack[stack.length - 1] ?? null;
}

function resolveVisualStepIndex(
    steps: AlgorithmSimulationStep[],
    currentStepIndex: number,
    values: number[],
    mode: LearningMode,
) {
    const safeIndex = steps.length === 0
        ? 0
        : Math.min(Math.max(currentStepIndex, 0), steps.length - 1);

    if (mode !== "practice") return safeIndex;

    for (let s = safeIndex; s >= 0; s -= 1) {
        const candidate = steps[s];
        if (Array.isArray(candidate?.arrayState) && arraysEqual(candidate.arrayState, values)) {
            return s;
        }
    }
    return safeIndex;
}

function attachChild(
    parentNode: QuickSortTreeNodeModel | undefined,
    childNodeId: string,
    low: number,
    high: number,
) {
    if (!parentNode) return;
    if (typeof parentNode.pivotIndex === "number") {
        if (high < parentNode.pivotIndex) { parentNode.leftChildId = childNodeId; return; }
        if (low > parentNode.pivotIndex) { parentNode.rightChildId = childNodeId; return; }
    }
    if (!parentNode.leftChildId) { parentNode.leftChildId = childNodeId; return; }
    if (!parentNode.rightChildId) { parentNode.rightChildId = childNodeId; }
}

function markChildComplete(
    parentNode: QuickSortTreeNodeModel | undefined,
    range: number[] | undefined,
    nodesById: Map<string, QuickSortTreeNodeModel>,
) {
    if (!parentNode || !Array.isArray(range) || range.length < 2) return;
    const [low, high] = range;
    [parentNode.leftChildId, parentNode.rightChildId].forEach((childId) => {
        if (!childId) return;
        const childNode = nodesById.get(childId);
        if (!childNode) return;
        if (childNode.low === low && childNode.high === high && childNode.state !== "base_case") {
            childNode.state = "complete";
        }
    });
}

function buildQuickSortTree(steps: AlgorithmSimulationStep[], uptoIndex: number) {
    const nodesById = new Map<string, QuickSortTreeNodeModel>();

    for (let stepIndex = 0; stepIndex <= uptoIndex && stepIndex < steps.length; stepIndex += 1) {
        const step = steps[stepIndex];
        const action = (step?.actionLabel ?? "").trim().toLowerCase();
        const stack = getStack(step);
        const currentFrame = getCurrentFrame(step);
        const currentFrameId = currentFrame ? normalizeFrameId(currentFrame, `frame-${stepIndex}`) : null;
        const bounds = getFrameBounds(currentFrame ?? undefined, step?.quickSort?.range ?? undefined);
        const currentNode = currentFrameId ? nodesById.get(currentFrameId) : undefined;

        if (action === "recursive_call" && currentFrameId && bounds) {
            const existingNode = nodesById.get(currentFrameId);
            const currentFrameIndex = stack.findIndex(
                (frame, index) => normalizeFrameId(frame, `frame-${index}`) === currentFrameId,
            );
            const parentFrame = currentFrameIndex > 0 ? stack[currentFrameIndex - 1] : null;
            const parentFrameId = parentFrame
                ? normalizeFrameId(parentFrame, `frame-${currentFrameIndex - 1}`)
                : null;
            const parentNode = parentFrameId ? nodesById.get(parentFrameId) : undefined;
            const elements = step.arrayState.slice(bounds.low, bounds.high + 1);

            const nextNode: QuickSortTreeNodeModel = existingNode ?? {
                id: currentFrameId,
                low: bounds.low,
                high: bounds.high,
                depth: typeof currentFrame?.depth === "number"
                    ? currentFrame.depth
                    : (step.quickSort?.recursionDepth ?? 0),
                elements,
                pivotIndex: null,
                pivotValue: null,
                leftPartition: [],
                rightPartition: [],
                leftChildId: null,
                rightChildId: null,
                parentId: parentNode?.id ?? null,
                state: "active",
            };

            nextNode.low = bounds.low;
            nextNode.high = bounds.high;
            nextNode.depth = typeof currentFrame?.depth === "number" ? currentFrame.depth : nextNode.depth;
            nextNode.parentId = parentNode?.id ?? nextNode.parentId;
            nextNode.elements = nextNode.elements.length > 0 ? nextNode.elements : elements;
            nextNode.state = "active";
            nodesById.set(currentFrameId, nextNode);
            attachChild(parentNode, currentFrameId, bounds.low, bounds.high);
            continue;
        }

        if (!currentNode) continue;

        if (action === "base_case") { currentNode.state = "base_case"; continue; }
        if (
            action === "partition_start"
            || action === "pivot_select"
            || action === "compare"
            || action === "swap"
            || action === "pivot_swap"
        ) {
            currentNode.state = "partitioning";
            continue;
        }

        if (action === "pivot_placed" && bounds) {
            const pivotIndex = typeof step.quickSort?.pivotIndex === "number"
                ? step.quickSort.pivotIndex
                : null;
            const elements = step.arrayState.slice(bounds.low, bounds.high + 1);
            currentNode.pivotIndex = pivotIndex;
            currentNode.pivotValue = typeof step.quickSort?.pivot === "number"
                ? step.quickSort.pivot
                : (typeof pivotIndex === "number" ? (step.arrayState[pivotIndex] ?? null) : null);
            currentNode.elements = elements;
            if (typeof pivotIndex === "number") {
                const localPivotIndex = pivotIndex - bounds.low;
                currentNode.leftPartition = localPivotIndex > 0 ? elements.slice(0, localPivotIndex) : [];
                currentNode.rightPartition = localPivotIndex < elements.length - 1
                    ? elements.slice(localPivotIndex + 1)
                    : [];
            } else {
                currentNode.leftPartition = [];
                currentNode.rightPartition = [];
            }
            continue;
        }

        if (action === "sort_left_complete" || action === "sort_right_complete") {
            markChildComplete(currentNode, step.quickSort?.range ?? undefined, nodesById);
            continue;
        }

        if (action === "return" && currentNode.state !== "base_case") {
            currentNode.state = "complete";
        }
    }

    return nodesById;
}

// ─── Tree layout ───────────────────────────────────────────────────────────────
function getNodeCardWidth(node: QuickSortTreeNodeModel) {
    const contentWidth = (node.elements.length * NODE_CELL_WIDTH)
        + (Math.max(node.elements.length - 1, 0) * NODE_CELL_GAP)
        + NODE_HORIZONTAL_PADDING;
    return Math.max(NODE_MIN_WIDTH, contentWidth);
}

function createTreeLayout(nodesById: Map<string, QuickSortTreeNodeModel>) {
    const nodeList = Array.from(nodesById.values());
    const roots = nodeList
        .filter((n) => !n.parentId || !nodesById.has(n.parentId))
        .sort((a, b) => a.depth - b.depth || a.low - b.low || a.high - b.high);

    if (roots.length === 0) {
        return {
            nodes: [] as QuickSortRenderableNode[],
            edges: [] as QuickSortTreeLayout["edges"],
            stageWidth: 0,
            stageHeight: 0,
        };
    }

    const nodeWidths = new Map<string, number>();
    const subtreeWidths = new Map<string, number>();
    let maxDepth = 0;

    function measure(nodeId: string): number {
        const node = nodesById.get(nodeId);
        if (!node) return 0;
        maxDepth = Math.max(maxDepth, node.depth);
        const nodeWidth = getNodeCardWidth(node);
        nodeWidths.set(nodeId, nodeWidth);
        const leftWidth = node.leftChildId ? measure(node.leftChildId) : 0;
        const rightWidth = node.rightChildId ? measure(node.rightChildId) : 0;
        let childrenWidth: number;
        if (leftWidth > 0 && rightWidth > 0) {
            childrenWidth = leftWidth + SIBLING_GAP + rightWidth;
        } else if (leftWidth > 0 || rightWidth > 0) {
            childrenWidth = nodeWidth + 2 * SIBLING_GAP + Math.max(leftWidth, rightWidth);
        } else {
            childrenWidth = 0;
        }
        const subtreeWidth = Math.max(nodeWidth, childrenWidth);
        subtreeWidths.set(nodeId, subtreeWidth);
        return subtreeWidth;
    }

    const rootWidths = roots.map((root) => measure(root.id));
    const totalRootsWidth = rootWidths.reduce((sum, w) => sum + w, 0);
    const totalRootGaps = Math.max(roots.length - 1, 0) * SIBLING_GAP;
    const naturalWidth = totalRootsWidth + totalRootGaps + TREE_SIDE_PADDING * 2;
    const stageWidth = Math.min(Math.max(naturalWidth, 720), STAGE_MAX_WIDTH);
    const stageHeight = TREE_TOP_PADDING + (maxDepth + 1) * LEVEL_HEIGHT + 12;
    const layoutNodes = new Map<string, QuickSortRenderableNode>();
    const edges: QuickSortTreeLayout["edges"] = [];

    function positionNode(nodeId: string, leftEdge: number) {
        const node = nodesById.get(nodeId);
        if (!node) return;
        const subtreeWidth = subtreeWidths.get(nodeId) ?? getNodeCardWidth(node);
        const nodeWidth = nodeWidths.get(nodeId) ?? getNodeCardWidth(node);
        const x = leftEdge + subtreeWidth / 2;
        const y = TREE_TOP_PADDING + node.depth * LEVEL_HEIGHT;

        layoutNodes.set(nodeId, {
            id: node.id,
            low: node.low,
            high: node.high,
            depth: node.depth,
            elements: node.elements,
            pivotIndex: node.pivotIndex,
            pivotValue: node.pivotValue,
            leftPartition: node.leftPartition,
            rightPartition: node.rightPartition,
            state: node.state,
            x,
            y,
            width: nodeWidth,
        });

        const leftSubtreeWidth = node.leftChildId ? (subtreeWidths.get(node.leftChildId) ?? 0) : 0;
        const rightSubtreeWidth = node.rightChildId ? (subtreeWidths.get(node.rightChildId) ?? 0) : 0;

        if (node.leftChildId && node.rightChildId) {
            const childrenWidth = leftSubtreeWidth + SIBLING_GAP + rightSubtreeWidth;
            const childStart = x - childrenWidth / 2;
            positionNode(node.leftChildId, childStart);
            positionNode(node.rightChildId, childStart + leftSubtreeWidth + SIBLING_GAP);
        } else if (node.rightChildId) {
            const childCenterX = x + nodeWidth / 2 + SIBLING_GAP;
            positionNode(node.rightChildId, childCenterX - rightSubtreeWidth / 2);
        } else if (node.leftChildId) {
            const childCenterX = x - nodeWidth / 2 - SIBLING_GAP;
            positionNode(node.leftChildId, childCenterX - leftSubtreeWidth / 2);
        }
    }

    let currentLeftEdge = TREE_SIDE_PADDING;
    roots.forEach((root, index) => {
        positionNode(root.id, currentLeftEdge);
        currentLeftEdge += rootWidths[index] + SIBLING_GAP;
    });

    layoutNodes.forEach((node) => {
        const sourceModel = nodesById.get(node.id);
        if (!sourceModel) return;
        [sourceModel.leftChildId, sourceModel.rightChildId].forEach((childId) => {
            if (!childId) return;
            const child = layoutNodes.get(childId);
            if (!child) return;
            edges.push({
                id: `${node.id}-${child.id}`,
                x1: node.x,
                y1: node.y + NODE_CARD_HEIGHT,
                x2: child.x,
                y2: child.y - 6,
            });
        });
    });

    return { nodes: Array.from(layoutNodes.values()), edges, stageWidth, stageHeight };
}

function normalizePracticeAction(step: AlgorithmSimulationStep | undefined) {
    const rawAction = (step?.quickSort?.type ?? step?.actionLabel ?? "").trim().toLowerCase();
    if (rawAction === "pivot_swap" || rawAction === "swap") return "swap";
    if (rawAction === "compare") return "compare";
    return rawAction;
}

function getQuickSortCue(step: AlgorithmSimulationStep | undefined): QuickSortCue {
    if (!step) {
        return {
            pivotCandidateIndex: null,
            pointerIndex: null,
            pointerLabel: null,
        };
    }

    const action = (step.quickSort?.type ?? step.actionLabel ?? "").trim().toLowerCase();
    const range = Array.isArray(step.quickSort?.range) && step.quickSort.range.length === 2
        ? step.quickSort.range
        : null;
    const pivotCandidateIndex = typeof step.quickSort?.pivotIndex === "number"
        ? step.quickSort.pivotIndex
        : range?.[1] ?? null;
    const [firstActive] = step.activeIndices ?? [];
    const firstValue = typeof firstActive === "number" ? step.arrayState[firstActive] : null;
    const pivotValue = step.quickSort?.pivot ?? null;

    if (action === "pivot_select") {
        return {
            pivotCandidateIndex,
            pointerIndex: pivotCandidateIndex,
            pointerLabel: "pivot",
        };
    }

    if (action === "compare" && typeof firstActive === "number") {
        return {
            pivotCandidateIndex,
            pointerIndex: firstActive,
            pointerLabel: typeof firstValue === "number" && typeof pivotValue === "number"
                ? (firstValue < pivotValue ? "left" : "right")
                : "compare",
        };
    }

    if ((action === "swap" || action === "pivot_swap") && typeof firstActive === "number") {
        return {
            pivotCandidateIndex,
            pointerIndex: firstActive,
            pointerLabel: action === "pivot_swap" ? "place" : "swap",
        };
    }

    if (action === "partition_start") {
        return {
            pivotCandidateIndex,
            pointerIndex: null,
            pointerLabel: null,
        };
    }

    return {
        pivotCandidateIndex,
        pointerIndex: null,
        pointerLabel: null,
    };
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function QuickSortTreeVisualizer({
    steps,
    currentStepIndex,
    mode = "auto",
    values,
    selectedIndices = [],
    suggestedIndices = [],
    feedbackIndices = [],
    feedbackTone = null,
    isInteractionDisabled = false,
    onBarClick,
    shouldReduceMotion,
}: QuickSortTreeVisualizerProps) {
    const visualStepIndex = useMemo(
        () => resolveVisualStepIndex(steps, currentStepIndex, values, mode),
        [currentStepIndex, mode, steps, values],
    );
    const visualStep = steps[visualStepIndex];
    const treeLayout = useMemo(
        () => createTreeLayout(buildQuickSortTree(steps, visualStepIndex)),
        [steps, visualStepIndex],
    );
    const currentFrameId = visualStep?.recursion?.currentFrameId;
    const normalizedAction = normalizePracticeAction(visualStep);
    const quickSortCue = useMemo(
        () => getQuickSortCue(visualStep),
        [visualStep],
    );
    const selectedIndexSet = useMemo(() => new Set(selectedIndices), [selectedIndices]);
    const suggestedIndexSet = useMemo(() => new Set(suggestedIndices), [suggestedIndices]);
    const feedbackIndexSet = useMemo(() => new Set(feedbackIndices), [feedbackIndices]);
    const isPracticeMode = mode === "practice";
    const currentPartitionRange = Array.isArray(visualStep?.quickSort?.range)
        && visualStep.quickSort.range.length === 2
        ? visualStep.quickSort.range
        : null;
    const pivotIndex = typeof visualStep?.quickSort?.pivotIndex === "number"
        ? visualStep.quickSort.pivotIndex
        : null;
    const previewNode = useMemo<QuickSortRenderableNode | null>(() => {
        if (treeLayout.nodes.length > 0 || values.length === 0) {
            return null;
        }

        return {
            id: "quick-sort-preview-root",
            low: 0,
            high: values.length - 1,
            depth: 0,
            elements: values,
            pivotIndex: null,
            pivotValue: null,
            leftPartition: [],
            rightPartition: [],
            state: "active",
            x: 360,
            y: TREE_TOP_PADDING + 16,
            width: getNodeCardWidth({
                id: "preview",
                low: 0,
                high: values.length - 1,
                depth: 0,
                elements: values,
                pivotIndex: null,
                pivotValue: null,
                leftPartition: [],
                rightPartition: [],
                leftChildId: null,
                rightChildId: null,
                parentId: null,
                state: "active",
            }),
        };
    }, [treeLayout.nodes.length, values]);
    const nodesToRender = previewNode ? [previewNode] : treeLayout.nodes;

    // Practice mode interactive array
    const nextCellIdRef = useRef(0);
    const createCell = (v: number): VisualCell => ({ id: `qs-cell-${nextCellIdRef.current++}`, value: v });
    const [visualCells, setVisualCells] = useState<VisualCell[]>(() => values.map((v) => createCell(v)));

    useLayoutEffect(() => {
        if (values.length === 0) { setVisualCells([]); return; }
        setVisualCells((prev) => {
            if (prev.length === 0 || prev.length !== values.length || (!isPracticeMode && visualStepIndex === 0)) {
                return values.map((v) => createCell(v));
            }
            return reconcileCells(prev, values, createCell);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visualStepIndex, isPracticeMode, values]);

    // Coordinate mapping
    // Auto mode: status bar ~48px, practice mode: array panel ~128px
    const BOTTOM_PANEL_PX = isPracticeMode ? 128 : 52;
    const CONTAINER_PX = 480;
    const treeAreaFraction = (CONTAINER_PX - BOTTOM_PANEL_PX) / CONTAINER_PX;

    const safeStageWidth = Math.max(treeLayout.stageWidth || 720, 1);
    const safeStageHeight = Math.max(treeLayout.stageHeight || 180, 1);
    const toXPct = (x: number) => (x / safeStageWidth) * 100;
    const toYPct = (y: number) => (y / safeStageHeight) * treeAreaFraction * 100;

    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between gap-3 text-xs text-text-secondary">
                <span>Quick Sort Recursion Tree</span>
                <div className="flex flex-wrap items-center gap-2">
                    {typeof visualStep?.quickSort?.recursionDepth === "number" ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
                            Depth {visualStep.quickSort.recursionDepth}
                        </span>
                    ) : null}
                    {currentPartitionRange ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
                            Range {currentPartitionRange[0]}-{currentPartitionRange[1]}
                        </span>
                    ) : null}
                </div>
            </div>

            {/* Main container */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#111214] h-[30rem]">
                {nodesToRender.length > 0 ? (
                    <>
                        {/* SVG edges */}
                        <svg
                            className="absolute inset-0 h-full w-full pointer-events-none"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            {treeLayout.edges.map((edge) => {
                                const d = `M ${toXPct(edge.x1)} ${toYPct(edge.y1)} L ${toXPct(edge.x2)} ${toYPct(edge.y2)}`;

                                return (
                                    <motion.path
                                        key={edge.id}
                                        initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0.2 }}
                                        animate={{ d, pathLength: 1, opacity: 1 }}
                                        transition={shouldReduceMotion ? { duration: 0 } : {
                                            d: springTransition,
                                            pathLength: { duration: 0.35, ease: "easeOut" },
                                            opacity: { duration: 0.18, ease: "easeOut" },
                                        }}
                                        fill="none"
                                        stroke="rgba(251,113,133,0.48)"
                                        strokeWidth="0.9"
                                        strokeLinecap="round"
                                    />
                                );
                            })}
                        </svg>

                        {treeLayout.edges.map((edge) => {
                            const x2 = toXPct(edge.x2);
                            const y2 = toYPct(edge.y2);
                            const dx = toXPct(edge.x2) - toXPct(edge.x1);
                            const dy = toYPct(edge.y2) - toYPct(edge.y1);
                            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                            return (
                                <motion.div
                                    key={`${edge.id}-icon`}
                                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        left: `${x2}%`,
                                        top: `${y2}%`,
                                        rotate: angle,
                                    }}
                                    transition={shouldReduceMotion ? { duration: 0 } : {
                                        opacity: { duration: 0.18, ease: "easeOut" },
                                        scale: { duration: 0.18, ease: "easeOut" },
                                        left: springTransition,
                                        top: springTransition,
                                        rotate: springTransition,
                                    }}
                                    className="pointer-events-none absolute z-[5] -ml-[7px] -mt-[7px] text-rose-300/80"
                                >
                                    <ArrowRight size={14} strokeWidth={2.2} />
                                </motion.div>
                            );
                        })}

                        {/* Tree nodes */}
                        {nodesToRender.map((node) => {
                            const isPreviewNode = previewNode?.id === node.id;
                            const xPct = isPreviewNode ? 50 : toXPct(node.x);
                            const yPct = isPreviewNode ? 10 : toYPct(node.y);
                            const isCurrentFrame = isPreviewNode
                                ? true
                                : currentFrameId !== null
                                    && currentFrameId !== undefined
                                    && String(currentFrameId) === node.id;

                            return (
                                <motion.div
                                    key={node.id}
                                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.88, y: -10 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        y: 0,
                                        left: `${xPct}%`,
                                        top: `${yPct}%`,
                                    }}
                                    transition={shouldReduceMotion ? { duration: 0 } : {
                                        opacity: { duration: 0.28, ease: "easeOut" },
                                        scale: { duration: 0.28, ease: "easeOut" },
                                        y: { duration: 0.28, ease: "easeOut" },
                                        left: springTransition,
                                        top: springTransition,
                                    }}
                                    className="absolute z-10"
                                    style={{
                                        width: `${node.width}px`,
                                        marginLeft: `-${Math.round(node.width / 2)}px`,
                                    }}
                                >
                                    <QuickSortTreeNode
                                        node={node}
                                        isCurrentFrame={isCurrentFrame}
                                        activeGlobalIndices={isCurrentFrame ? (visualStep?.activeIndices ?? []) : []}
                                        actionType={isCurrentFrame ? normalizedAction : ""}
                                        pivotCandidateIndex={isCurrentFrame ? quickSortCue.pivotCandidateIndex : null}
                                        pointerIndex={isCurrentFrame ? quickSortCue.pointerIndex : null}
                                        pointerLabel={isCurrentFrame ? quickSortCue.pointerLabel : null}
                                        shouldReduceMotion={shouldReduceMotion}
                                    />
                                </motion.div>
                            );
                        })}

                        {/* Bottom panel */}
                        {isPracticeMode ? (
                            <div className="absolute inset-x-0 bottom-0 border-t border-white/8 bg-[#0f1113]/95 px-3 pb-3 pt-2 backdrop-blur-sm">
                                <div className="mb-1.5 flex items-center justify-between text-xs text-text-secondary">
                                    <span>Array view</span>
                                    <span>Click to compare / swap</span>
                                </div>
                                <LayoutGroup id={`qs-array-${visualStepIndex}`}>
                                    <div className="flex flex-wrap items-end justify-center gap-1.5">
                                        {visualCells.map((cell, index) => {
                                            const isSelected = selectedIndexSet.has(index);
                                            const isSuggested = suggestedIndexSet.has(index);
                                            const isFeedbackTarget = feedbackIndexSet.has(index);
                                            const isPivot = pivotIndex === index;
                                            const isWithinRange = currentPartitionRange !== null
                                                && index >= currentPartitionRange[0]
                                                && index <= currentPartitionRange[1];
                                            const isInteractive = typeof onBarClick === "function";

                                            return (
                                                <motion.div
                                                    key={cell.id}
                                                    layout
                                                    transition={shouldReduceMotion ? { duration: 0 } : springTransition}
                                                    className="flex flex-col items-center gap-0.5"
                                                >
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => {
                                                            if (isInteractive && !isInteractionDisabled) onBarClick(index);
                                                        }}
                                                        disabled={!isInteractive || isInteractionDisabled}
                                                        animate={shouldReduceMotion ? {} : (isSelected ? { scale: [1, 1.06, 1], y: -3 } : { scale: 1, y: 0 })}
                                                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: "easeInOut" }}
                                                        className={cn(
                                                            "flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-semibold transition-colors duration-200",
                                                            !isInteractive && "cursor-default",
                                                            isInteractive && !isInteractionDisabled && "cursor-pointer",
                                                            isInteractionDisabled && "cursor-not-allowed opacity-80",
                                                            isFeedbackTarget && feedbackTone === "correct" && "border-emerald-400/60 bg-emerald-500/18 text-emerald-100",
                                                            isFeedbackTarget && feedbackTone === "incorrect" && "border-red-400/60 bg-red-500/18 text-red-100",
                                                            !isFeedbackTarget && isSelected && "border-sky-400/60 bg-sky-500/18 text-sky-100",
                                                            !isFeedbackTarget && !isSelected && isSuggested && "border-accent/60 bg-accent/14 text-accent",
                                                            !isFeedbackTarget && !isSelected && !isSuggested && isPivot && "border-accent/60 bg-accent/25 text-accent",
                                                            !isFeedbackTarget && !isSelected && !isSuggested && !isPivot && isWithinRange && "border-amber-500/50 bg-amber-500/15 text-amber-100",
                                                            !isFeedbackTarget && !isSelected && !isSuggested && !isPivot && !isWithinRange && "border-white/10 bg-white/[0.04] text-white/70",
                                                        )}
                                                        aria-label={`Array index ${index}, value ${cell.value}`}
                                                        aria-pressed={isInteractive ? isSelected : undefined}
                                                    >
                                                        {cell.value}
                                                    </motion.button>
                                                    <motion.span
                                                        layout="position"
                                                        transition={shouldReduceMotion ? { duration: 0 } : springTransition}
                                                        className="text-[9px] text-text-secondary"
                                                    >
                                                        {index}
                                                    </motion.span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </LayoutGroup>
                            </div>
                        ) : (
                            // Auto mode — status text bar
                            <div className="absolute inset-x-0 bottom-0 flex min-h-[3.25rem] items-center justify-center border-t border-white/8 bg-[#0f1113]/95 px-5 backdrop-blur-sm">
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={visualStepIndex}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.18, ease: "easeOut" }}
                                        className="text-center text-sm text-text-secondary"
                                    >
                                        {getStatusText(visualStep)}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                        No quick sort tree is available for this step yet.
                    </div>
                )}
            </div>
        </div>
    );
}




