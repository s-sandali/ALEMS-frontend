import type { AlgorithmSimulationStep } from "@/lib/api";

export type LearningMode = "auto" | "practice";
export type PracticeFeedbackTone = "correct" | "incorrect" | null;
export type SearchDecision = "left" | "right" | "found";

export type VisualBar = {
    id: string;
    value: number;
};

const actionLabelAliases: Record<string, string> = {
    pivotplaced: "Pivot Placed",
    partition_complete: "Pivot Placed",
};

export function getStepTone(step: AlgorithmSimulationStep | undefined) {
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

export function getPracticeTone(feedbackTone: PracticeFeedbackTone, practiceCompleted: boolean) {
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

export function formatActionLabel(actionLabel: string) {
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

export function getQuickSortRange(step: AlgorithmSimulationStep | undefined) {
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

export function isQuickSortPivotPlacedAction(actionLabel: string | undefined) {
    const normalized = (actionLabel ?? "").trim().toLowerCase();
    return normalized === "pivotplaced" || normalized === "partition_complete";
}

export function getSearchActiveIndices(step: AlgorithmSimulationStep | undefined) {
    if (!step?.search) {
        return step?.activeIndices ?? [];
    }

    if (typeof step.search.midpointIndex === "number") {
        return [step.search.midpointIndex];
    }

    return step.activeIndices ?? [];
}

export function getSearchState(step: AlgorithmSimulationStep | undefined) {
    return (step?.search?.state ?? step?.actionLabel ?? "").trim().toLowerCase();
}

export function getQuickSortPracticeAction(step: AlgorithmSimulationStep | undefined) {
    const action = (step?.quickSort?.type ?? step?.actionLabel ?? "").trim().toLowerCase();

    if (action === "pivot_swap" || action === "swap") {
        return "swap";
    }

    if (action === "compare") {
        return "compare";
    }

    return action;
}

export function getInsertionSortPracticeAction(step: AlgorithmSimulationStep | undefined) {
    const action = (step?.insertionSort?.type ?? step?.actionLabel ?? "").trim().toLowerCase();

    if (action === "compare" || action === "shift" || action === "insert") {
        return action;
    }

    if (action === "complete" || action === "early_exit") {
        return "complete";
    }

    return "compare";
}

export function getSafeStepIndex(index: number | null | undefined, totalValues: number) {
    if (typeof index !== "number") {
        return null;
    }

    if (index < 0 || index >= totalValues) {
        return null;
    }

    return index;
}

export function getSearchWindow(step: AlgorithmSimulationStep | undefined, totalValues: number) {
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

export function getSearchTargetValue(steps: AlgorithmSimulationStep[]) {
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

export function reconcileBars(
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

export function getSortedIndices(step: AlgorithmSimulationStep | undefined, totalValues: number) {
    const action = step?.actionLabel.trim().toLowerCase() ?? "";

    if (action.includes("complete")) {
        return new Set(Array.from({ length: totalValues }, (_, index) => index));
    }

    if (action.includes("sorted")) {
        return new Set(step?.activeIndices ?? []);
    }

    return new Set<number>();
}
