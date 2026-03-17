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

const spaceComplexityByAlgorithm = {
    "bubble sort": "O(1)",
    "binary search": "O(1)",
    "merge sort": "O(n)",
    "quick sort": "O(log n)",
};

const quizMetadataByAlgorithm = {
    "bubble sort": {
        available: true,
        questionCount: 5,
        xpReward: 50,
        timeMinutes: 3,
    },
    "binary search": {
        available: false,
        questionCount: 5,
        xpReward: 60,
        timeMinutes: 3,
    },
    "merge sort": {
        available: false,
        questionCount: 6,
        xpReward: 75,
        timeMinutes: 4,
    },
    "quick sort": {
        available: false,
        questionCount: 6,
        xpReward: 75,
        timeMinutes: 4,
    },
};

const sampleSizes = [8, 16, 32, 64, 128, 256];

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

export function getSpaceComplexity(name) {
    return spaceComplexityByAlgorithm[name.trim().toLowerCase()] || "O(n)";
}

function normalizeComplexityLabel(label) {
    return label
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace("²", "^2");
}

function evaluateComplexity(label, n) {
    const normalized = normalizeComplexityLabel(label);

    switch (normalized) {
        case "o(1)":
            return 1;
        case "o(logn)":
            return Math.log2(n);
        case "o(n)":
            return n;
        case "o(nlogn)":
            return n * Math.log2(n);
        case "o(n^2)":
            return n * n;
        default:
            return n;
    }
}

function scaleSeriesValues(values) {
    const maxValue = Math.max(...values, 1);

    return values.map((value) => Math.max(1, Math.round((value / maxValue) * 100)));
}

export function getComplexityChartData(algorithm) {
    const timeLabels = {
        best: algorithm.timeComplexityBest || "O(n)",
        average: algorithm.timeComplexityAverage || algorithm.timeComplexityWorst || "O(n)",
        worst: algorithm.timeComplexityWorst || algorithm.timeComplexityAverage || "O(n)",
    };
    const spaceLabel = getSpaceComplexity(algorithm.name);

    const bestValues = scaleSeriesValues(sampleSizes.map((n) => evaluateComplexity(timeLabels.best, n)));
    const averageValues = scaleSeriesValues(sampleSizes.map((n) => evaluateComplexity(timeLabels.average, n)));
    const worstValues = scaleSeriesValues(sampleSizes.map((n) => evaluateComplexity(timeLabels.worst, n)));
    const spaceValues = scaleSeriesValues(sampleSizes.map((n) => evaluateComplexity(spaceLabel, n)));

    return {
        timeLabels,
        spaceLabel,
        timeData: sampleSizes.map((n, index) => ({
            n,
            best: bestValues[index],
            average: averageValues[index],
            worst: worstValues[index],
        })),
        spaceData: sampleSizes.map((n, index) => ({
            n,
            space: spaceValues[index],
        })),
    };
}

export function getAlgorithmQuizMetadata(name) {
    return quizMetadataByAlgorithm[name.trim().toLowerCase()] || {
        available: false,
        questionCount: 5,
        xpReward: 50,
        timeMinutes: 3,
    };
}

export function getAlgorithmIntroduction(name) {
    const normalizedName = name.trim().toLowerCase();

    if (normalizedName === "bubble sort") {
        return {
            eyebrow: "01 - Introduction",
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
        eyebrow: "01 - Introduction",
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
