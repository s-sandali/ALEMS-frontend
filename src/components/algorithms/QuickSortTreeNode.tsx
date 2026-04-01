import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export type QuickSortNodeState = "active" | "partitioning" | "complete" | "base_case";

export type QuickSortRenderableNode = {
    id: string;
    low: number;
    high: number;
    depth: number;
    elements: number[];
    pivotIndex: number | null;
    pivotValue: number | null;
    leftPartition: number[];
    rightPartition: number[];
    state: QuickSortNodeState;
    x: number;
    y: number;
    width: number;
};

type QuickSortTreeNodeProps = {
    node: QuickSortRenderableNode;
    isCurrentFrame: boolean;
    activeGlobalIndices?: number[];
    actionType?: string;
    shouldReduceMotion: boolean;
};

function getCellClassName(
    node: QuickSortRenderableNode,
    absoluteIndex: number,
    isCurrentFrame: boolean,
    isComparing: boolean,
    isSwapping: boolean,
) {
    const hasPivot = typeof node.pivotIndex === "number";
    const isPivotCell = hasPivot && node.pivotIndex === absoluteIndex;
    const isLeftPartition = hasPivot && node.pivotIndex !== null && absoluteIndex < node.pivotIndex;
    const isRightPartition = hasPivot && node.pivotIndex !== null && absoluteIndex > node.pivotIndex;
    const isBaseCase = node.state === "base_case";

    // Compare/swap states take priority — show live action
    if (isSwapping) {
        return "border-red-300/70 bg-red-400/20 text-red-50";
    }

    if (isComparing) {
        return "border-yellow-300/65 bg-yellow-300/18 text-yellow-50";
    }

    // Pivot uses accent (matches binary search midpoint)
    if (isPivotCell) {
        return "border-accent/65 bg-accent/22 text-accent shadow-[0_0_12px_rgba(213,255,64,0.2)]";
    }

    if (isBaseCase || (!hasPivot && node.elements.length <= 1)) {
        return "border-emerald-400/55 bg-emerald-500/16 text-emerald-100";
    }

    if (isLeftPartition) {
        return "border-emerald-400/50 bg-emerald-500/14 text-emerald-100";
    }

    if (isRightPartition) {
        return "border-sky-400/50 bg-sky-500/14 text-sky-100";
    }

    if (isCurrentFrame || node.state === "partitioning" || node.state === "active") {
        return "border-white/20 bg-white/[0.08] text-white";
    }

    if (node.state === "complete") {
        return "border-white/12 bg-white/[0.04] text-white/80";
    }

    return "border-white/10 bg-white/[0.03] text-white/75";
}

export default function QuickSortTreeNode({
    node,
    isCurrentFrame,
    activeGlobalIndices = [],
    actionType = "",
    shouldReduceMotion,
}: QuickSortTreeNodeProps) {
    const activeSet = new Set(activeGlobalIndices);
    const isSwapAction = actionType === "swap" || actionType === "pivot_swap";
    const isCompareAction = actionType === "compare";

    return (
        <div
            className={cn(
                "rounded-xl border bg-[#111214] px-2.5 py-2",
                isCurrentFrame
                    ? "border-white/25 shadow-[0_0_14px_rgba(255,255,255,0.05)]"
                    : "border-white/10",
            )}
        >
            
            <div className="flex items-center justify-center gap-1">
                {node.elements.map((value, offset) => {
                    const absoluteIndex = node.low + offset;
                    const isPivot = node.pivotIndex === absoluteIndex;
                    const isActive = activeSet.has(absoluteIndex);
                    const isComparing = isCurrentFrame && isCompareAction && isActive;
                    const isSwapping = isCurrentFrame && isSwapAction && isActive;

                    const baseAnimate = isPivot ? { scale: [1, 1.08, 1] } : { scale: 1 };
                    const actionAnimate = isComparing || isSwapping ? { scale: [1, 1.1, 1] } : baseAnimate;
                    const cellAnimate = shouldReduceMotion ? {} : actionAnimate;

                    return (
                        <motion.div
                            key={`${node.id}-${absoluteIndex}-${value}`}
                            animate={cellAnimate}
                            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.32, ease: "easeInOut" }}
                            className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition-colors duration-300",
                                getCellClassName(node, absoluteIndex, isCurrentFrame, isComparing, isSwapping),
                            )}
                        >
                            {value}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
