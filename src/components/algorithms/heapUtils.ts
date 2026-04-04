import type { AlgorithmSimulationStep } from "@/lib/api";

export const HEAP_NODE_RADIUS_PX = 22;
export const FALLING_NODE_RADIUS_PX = 20;

export type HeapNodeState = "normal" | "active" | "comparing" | "swapping" | "removing";

export type HeapVisualNode = {
    id: string;
    index: number;
    value: number;
    x: number;
    y: number;
    state: HeapNodeState;
    incomingToRoot: boolean;
};

export type HeapIdentityNode = {
    id: string;
    index: number;
    value: number;
};

export type HeapVisualEdge = {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

export function formatHeapComparison(step: AlgorithmSimulationStep | undefined) {
    const compared = step?.heap?.comparedIndices;
    if (!compared || compared.length < 2) {
        return "--";
    }

    return `${compared[0]} vs ${compared[1]}`;
}

export function getHeapNodePosition(index: number) {
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

export function reconcileHeapIdentityNodes(previousNodes: HeapIdentityNode[], nextValues: number[], createId: () => string) {
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

export function buildHeapVisualNodes(
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

export function buildHeapVisualEdges(nodes: HeapVisualNode[]): HeapVisualEdge[] {
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

export function getNodeClassName(state: HeapNodeState) {
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

export function getNodeAnimate(state: HeapNodeState, shouldReduceMotion: boolean) {
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

export function buildTrajectoryPath(startX: number, startY: number, endX: number, endY: number) {
    const deltaX = endX - startX;
    const direction = deltaX >= 0 ? 1 : -1;
    const horizontalSpan = Math.abs(deltaX);

    // Keep control point between start/end to avoid overshooting far right/left.
    const controlX = startX + (deltaX * 0.58) - (direction * Math.min(3.5, horizontalSpan * 0.06));
    const controlY = ((startY + endY) / 2) - Math.min(11, 5 + horizontalSpan * 0.06);

    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
}
