const difficultyByAlgorithm = {
    "bubble sort": "Beginner",
    "binary search": "Intermediate",
    "merge sort": "Intermediate",
    "quick sort": "Advanced",
};

const algorithmKeyByName = {
    "bubble sort": "bubble_sort",
    "binary search": "binary_search",
    "merge sort": "merge_sort",
    "quick sort": "quick_sort",
};

export function getAlgorithmDifficulty(name) {
    return difficultyByAlgorithm[name.trim().toLowerCase()] || "Core";
}

export function getPrimaryComplexity(algorithm) {
    return algorithm.timeComplexityAverage
        || algorithm.timeComplexityWorst
        || algorithm.timeComplexityBest
        || "Not available";
}

export function getAlgorithmSampleInput(name) {
    switch (name.trim().toLowerCase()) {
        case "bubble sort":
            return [8, 3, 5, 1, 9, 2];
        default:
            return [8, 3, 5, 1, 9, 2];
    }
}

export function getSimulationAlgorithmKey(name) {
    return algorithmKeyByName[name.trim().toLowerCase()] || name.trim().toLowerCase().replace(/\s+/g, "_");
}

export function getAlgorithmIntroduction(name) {
    const normalizedName = name.trim().toLowerCase();

    if (normalizedName === "bubble sort") {
        return {
            eyebrow: "01 — Introduction",
            title: "How does Bubble Sort work?",
            paragraphs: [
                "Bubble Sort scans the array from left to right, comparing adjacent values and swapping them whenever the left value is larger than the right one.",
                "After each full pass, the largest unsorted value settles into its final position. The process repeats until a pass completes with no swaps.",
            ],
            steps: [
                {
                    num: "01",
                    title: "Start with unsorted array",
                    desc: "Begin with an unsorted list of numbers and prepare for the first pass.",
                    matchAction: "start",
                },
                {
                    num: "02",
                    title: "Compare adjacent pairs",
                    desc: "Move across the array and compare each neighboring pair in order.",
                    matchAction: "compare",
                },
                {
                    num: "03",
                    title: "Swap if out of order",
                    desc: "When the left value is larger, swap the pair so the bigger value moves right.",
                    matchAction: "swap",
                },
                {
                    num: "04",
                    title: "Repeat each pass",
                    desc: "Finish the pass, lock the largest value in place, and continue with the remaining unsorted portion.",
                    matchAction: "sorted",
                },
                {
                    num: "05",
                    title: "Early exit check",
                    desc: "If a pass completes without swaps, the array is already sorted and the algorithm stops.",
                    matchAction: "complete",
                },
            ],
        };
    }

    return {
        eyebrow: "01 — Introduction",
        title: `How does ${name} work?`,
        paragraphs: [
            `${name} follows a structured sequence of comparisons and state changes that can be explored step by step through the backend simulation trace.`,
            "Use the cards below to jump through the major phases and preview the related simulation state.",
        ],
        steps: [
            {
                num: "01",
                title: "Prepare input",
                desc: "Start with the input values and initialize the algorithm state.",
                matchAction: "start",
            },
            {
                num: "02",
                title: "Process state",
                desc: "Advance through the main comparisons or recursive decisions.",
                matchAction: "compare",
            },
            {
                num: "03",
                title: "Apply updates",
                desc: "Commit the state change that moves the algorithm forward.",
                matchAction: "swap",
            },
            {
                num: "04",
                title: "Complete result",
                desc: "Finish once the backend reports the trace is complete.",
                matchAction: "complete",
            },
        ],
    };
}
