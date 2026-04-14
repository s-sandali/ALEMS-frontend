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
    pivotCandidateIndex?: number | null;
    pointerIndex?: number | null;
    pointerLabel?: string | null;
    shouldReduceMotion: boolean;
};

type TileRole = "left" | "pivot" | "right" | "neutral" | "complete" | "pivot_candidate";

function getTileClass(role: TileRole, isSwapping: boolean, isComparing: boolean): string {
    if (isSwapping) return "border-red-300/70 bg-red-400/20 text-red-50";
    if (isComparing) return "border-yellow-300/65 bg-yellow-300/15 text-yellow-50";
    if (role === "pivot") return "border-accent/65 bg-accent/22 text-accent shadow-[0_0_10px_rgba(var(--primary-rgb),0.25)]";
    if (role === "pivot_candidate") return "border-yellow-300/65 bg-yellow-300/16 text-yellow-50";
    if (role === "left") return "border-emerald-400/55 bg-emerald-500/16 text-emerald-100";
    if (role === "right") return "border-sky-400/55 bg-sky-500/16 text-sky-100";
    if (role === "complete") return "border-emerald-400/60 bg-emerald-400/20 text-emerald-100";
    return "border-amber-500/55 bg-amber-500/15 text-amber-100";
}

export default function QuickSortTreeNode({
    node,
    isCurrentFrame,
    activeGlobalIndices = [],
    actionType = "",
    pivotCandidateIndex = null,
    pointerIndex = null,
    pointerLabel = null,
    shouldReduceMotion,
}: QuickSortTreeNodeProps) {
    const activeSet = new Set(activeGlobalIndices);
    const isSwapAction = actionType === "swap" || actionType === "pivot_swap";
    const isCompareAction = actionType === "compare";
    const hasPartition = typeof node.pivotIndex === "number";
    const isComplete = node.state === "complete" || node.state === "base_case";

    function renderTile(value: number, absoluteIndex: number, role: TileRole) {
        const isActive = activeSet.has(absoluteIndex);
        const isSwapping = isCurrentFrame && isSwapAction && isActive;
        const isComparing = isCurrentFrame && isCompareAction && isActive;
        const shouldPulse = !shouldReduceMotion && (isSwapping || isComparing || role === "pivot");
        const resolvedRole = !hasPartition && !isComplete && pivotCandidateIndex === absoluteIndex
            ? "pivot_candidate"
            : role;
        const showPointer = isCurrentFrame && pointerIndex === absoluteIndex && Boolean(pointerLabel);

        return (
            <div key={`${node.id}-tile-${absoluteIndex}`} className="relative flex flex-col items-center">
                <motion.div
                    initial={false}
                    animate={showPointer
                        ? { opacity: 1, y: 0, scale: 1 }
                        : { opacity: 0, y: -4, scale: 0.96 }}
                    transition={shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 0.2, ease: "easeOut" }}
                    className="pointer-events-none absolute -top-8 z-10 flex flex-col items-center"
                >
                    <div className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-text-primary/80">
                        {pointerLabel}
                    </div>
                    <div className="h-2 w-px bg-white/30" />
                    <div className="h-0 w-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-white/45" />
                </motion.div>
                <motion.div
                    animate={shouldPulse ? { scale: [1, 1.12, 1] } : {}}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeInOut" }}
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-bold transition-colors duration-300",
                        getTileClass(resolvedRole, isSwapping, isComparing),
                    )}
                >
                    {value}
                </motion.div>
            </div>
        );
    }

    const cardBorder = isComplete
        ? (isCurrentFrame
            ? "border-emerald-400/40 shadow-[0_0_14px_rgba(52,211,153,0.1)]"
            : "border-emerald-400/20")
        : (isCurrentFrame
            ? (hasPartition
                ? "border-white/25 shadow-[0_0_14px_rgba(255,255,255,0.06)]"
                : "border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.12)]")
            : "border-white/10");

    if (isComplete) {
        return (
            <div className={cn("rounded-xl border bg-surface px-3 py-2.5", cardBorder)}>
                <div className="flex items-center justify-center gap-1">
                    {node.elements.map((value, offset) =>
                        renderTile(value, node.low + offset, "complete"),
                    )}
                </div>
            </div>
        );
    }

    if (hasPartition && typeof node.pivotIndex === "number") {
        const pivotIdx = node.pivotIndex;
        const pivotLocalIndex = pivotIdx - node.low;
        const leftElements = node.elements.slice(0, pivotLocalIndex);
        const pivotValue = node.elements[pivotLocalIndex];
        const rightElements = node.elements.slice(pivotLocalIndex + 1);

        return (
            <div className={cn("rounded-xl border bg-surface px-3 py-2.5", cardBorder)}>
                <div className="flex items-center justify-center gap-1">
                    {leftElements.map((value, index) =>
                        renderTile(value, node.low + index, "left"),
                    )}
                    {leftElements.length > 0 && (
                        <div className="mx-1 h-7 w-px shrink-0 bg-white/12" />
                    )}
                    {renderTile(pivotValue, pivotIdx, "pivot")}
                    {rightElements.length > 0 && (
                        <div className="mx-1 h-7 w-px shrink-0 bg-white/12" />
                    )}
                    {rightElements.map((value, index) =>
                        renderTile(value, pivotIdx + 1 + index, "right"),
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("rounded-xl border bg-surface px-3 py-2.5", cardBorder)}>
            <div className="flex items-center justify-center gap-1">
                {node.elements.map((value, offset) =>
                    renderTile(value, node.low + offset, "neutral"),
                )}
            </div>
        </div>
    );
}

