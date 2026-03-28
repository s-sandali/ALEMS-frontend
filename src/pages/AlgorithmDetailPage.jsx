import { useEffect, useMemo, useState } from "react";
import { UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link, useParams } from "react-router-dom";

import AlgorithmComplexityCharts from "../components/algorithms/AlgorithmComplexityCharts";
import CodePanel from "../components/algorithms/CodePanel";
import AlgorithmIntroductionSection from "../components/algorithms/AlgorithmIntroductionSection";
import AlgorithmQuizCTA from "../components/algorithms/AlgorithmQuizCTA";
import SimulationControls from "../components/algorithms/SimulationControls";
import AlgorithmVisualizer from "../components/algorithms/AlgorithmVisualizer";
import { AlgorithmService, SimulationService } from "../lib/api";
import {
    getAlgorithmCodeSnippets,
    getAlgorithmDifficulty,
    getAlgorithmSampleInput,
    getPrimaryComplexity,
    getSimulationAlgorithmKey,
} from "../lib/algorithmPresentation";

function buildMockBinarySearchSteps(array) {
    const values = Array.isArray(array) && array.length > 0
        ? [...array].sort((left, right) => left - right)
        : [3, 7, 12, 19, 25, 31, 44, 58];
    const midIndex = Math.floor((values.length - 1) / 2);
    const rightMidIndex = Math.floor((midIndex + 1 + (values.length - 1)) / 2);
    const lastIndex = Math.max(values.length - 1, 0);

    const buildSearchMock = (lowIndex, highIndex, midpointIndex, state, discardStartIndex, discardEndIndex) => {
        const hasDiscard = typeof discardStartIndex === "number" && typeof discardEndIndex === "number";
        const discardStart = hasDiscard ? discardStartIndex : null;
        const discardEnd = hasDiscard ? discardEndIndex : null;
        const discardedIndices = hasDiscard
            ? Array.from({ length: discardEnd - discardStart + 1 }, (_, offset) => discardStart + offset)
            : [];

        return {
            lowIndex,
            highIndex,
            midpointIndex,
            state,
            discardedSide: hasDiscard && midpointIndex !== null
                ? (discardEndIndex === midpointIndex ? "left" : "right")
                : null,
            discardStartIndex: discardStart,
            discardEndIndex: discardEnd,
            discardedIndices,
        };
    };

    return [
        {
            stepNumber: 1,
            arrayState: values,
            activeIndices: [midIndex],
            lineNumber: 4,
            actionLabel: "compare",
            search: buildSearchMock(0, lastIndex, midIndex, "midpoint_pick"),
        },
        {
            stepNumber: 2,
            arrayState: values,
            activeIndices: [midIndex],
            lineNumber: 7,
            actionLabel: "discard_left",
            search: buildSearchMock(0, lastIndex, midIndex, "discard_left", 0, midIndex),
        },
        {
            stepNumber: 3,
            arrayState: values,
            activeIndices: [rightMidIndex],
            lineNumber: 4,
            actionLabel: "compare",
            search: buildSearchMock(midIndex + 1, lastIndex, rightMidIndex, "midpoint_pick"),
        },
        {
            stepNumber: 4,
            arrayState: values,
            activeIndices: [rightMidIndex],
            lineNumber: 5,
            actionLabel: "found",
            search: buildSearchMock(midIndex + 1, lastIndex, rightMidIndex, "found"),
        },
        {
            stepNumber: 5,
            arrayState: values,
            activeIndices: [],
            lineNumber: 8,
            actionLabel: "not_found",
            search: buildSearchMock(midIndex + 1, lastIndex, null, "not_found"),
        },
    ];
}

function getFallbackStepsForAlgorithm(algorithmName, inputArray) {
    if (algorithmName?.trim().toLowerCase() === "binary search") {
        return buildMockBinarySearchSteps(inputArray);
    }

    return [];
}

function getDiscardedIndicesForStep(steps, stepIndex) {
    const safeStepIndex = Math.min(Math.max(stepIndex, 0), Math.max(steps.length - 1, 0));
    const step = steps[safeStepIndex];
    if (!step) {
        return [];
    }

    if (step.search) {
        if (Array.isArray(step.search.discardedIndices) && step.search.discardedIndices.length > 0) {
            return step.search.discardedIndices;
        }

        if (typeof step.search.discardStartIndex === "number" && typeof step.search.discardEndIndex === "number") {
            const start = step.search.discardStartIndex;
            const end = step.search.discardEndIndex;
            if (start <= end) {
                return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
            }
        }
    }

    const action = (step.search?.state ?? step.actionLabel)?.trim().toLowerCase() ?? "";
    if (!action.includes("discard")) {
        return [];
    }

    const values = Array.isArray(step.arrayState) ? step.arrayState : [];
    const activeIndex = Array.isArray(step.activeIndices) ? step.activeIndices[0] : undefined;
    if (typeof activeIndex !== "number") {
        return [];
    }

    if (action.includes("left") || action.includes("low") || action.includes("lower")) {
        return Array.from({ length: values.length }, (_, index) => index).filter((index) => index <= activeIndex);
    }

    if (action.includes("right") || action.includes("high") || action.includes("upper")) {
        return Array.from({ length: values.length }, (_, index) => index).filter((index) => index >= activeIndex);
    }

    const nextStep = steps[safeStepIndex + 1];
    const nextActiveIndex = Array.isArray(nextStep?.activeIndices) ? nextStep.activeIndices[0] : undefined;
    if (typeof nextActiveIndex === "number") {
        if (nextActiveIndex > activeIndex) {
            return Array.from({ length: values.length }, (_, index) => index).filter((index) => index <= activeIndex);
        }

        if (nextActiveIndex < activeIndex) {
            return Array.from({ length: values.length }, (_, index) => index).filter((index) => index >= activeIndex);
        }
    }

    return [];
}

function isTerminalSearchAction(actionLabel) {
    const normalizedAction = actionLabel?.trim().toLowerCase() ?? "";
    return normalizedAction === "found"
        || normalizedAction === "not_found"
        || normalizedAction === "target_found"
        || normalizedAction === "target_not_found";
}

function getNextSearchDecision(steps, currentIndex) {
    for (let index = currentIndex + 1; index < steps.length; index += 1) {
        const state = (steps[index]?.search?.state ?? steps[index]?.actionLabel ?? "").trim().toLowerCase();

        if (state.includes("discard_left")) {
            return { decision: "right", index };
        }

        if (state.includes("discard_right")) {
            return { decision: "left", index };
        }

        if (state === "found" || state === "target_found") {
            return { decision: "found", index };
        }
    }

    return null;
}

function getAlgorithmPresentation(algorithm) {
    const normalizedName = algorithm?.name?.trim().toLowerCase();
    if (normalizedName === "linear search" || normalizedName === "linera search") {
        return {
            ...algorithm,
            name: "Quick Sort",
            category: "Sorting",
            description: "Partitions the array around a pivot and recursively sorts the subarrays.",
            timeComplexityBest: "O(n log n)",
            timeComplexityAverage: "O(n log n)",
            timeComplexityWorst: "O(n^2)",
        };
    }

    return algorithm;
}

export default function AlgorithmDetailPage() {
    const playbackSpeeds = [0.5, 1, 2, 4];
    const basePlaybackIntervalMs = 1400;
    const { id } = useParams();
    const { getToken } = useAuth();
    const { user } = useUser();
    const [algorithm, setAlgorithm] = useState(null);
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [simulationError, setSimulationError] = useState("");
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [sampleInput, setSampleInput] = useState([]);
    const [arraySize, setArraySize] = useState(0);
    const [elementsText, setElementsText] = useState("");
    const [targetValue, setTargetValue] = useState("");
    const [mode, setMode] = useState("auto");
    const [practiceSessionId, setPracticeSessionId] = useState("");
    const [currentArray, setCurrentArray] = useState([]);
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [feedbackIndices, setFeedbackIndices] = useState([]);
    const [feedbackMessage, setFeedbackMessage] = useState("Choose Go Left, Go Right, or Found based on the midpoint.");
    const [hintMessage, setHintMessage] = useState("Use a sorted list, compare the midpoint to the target, then choose which half to discard.");
    const [isCorrect, setIsCorrect] = useState(null);
    const [suggestedIndices, setSuggestedIndices] = useState([]);
    const [isValidatingStep, setIsValidatingStep] = useState(false);
    const [practiceCompleted, setPracticeCompleted] = useState(false);
    const [feedbackVersion, setFeedbackVersion] = useState(0);
    const [showCompletionToast, setShowCompletionToast] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function runSimulationTrace(algorithmRecord, inputArray, targetNumber) {
            const simulationResponse = await SimulationService.runSimulation(
                getSimulationAlgorithmKey(algorithmRecord.name),
                inputArray,
                getToken,
                targetNumber,
            );

            if (!isMounted) {
                return;
            }

            setSampleInput(inputArray);
            setArraySize(inputArray.length);
            setElementsText(inputArray.join(", "));
            setSteps(Array.isArray(simulationResponse?.steps) ? simulationResponse.steps : []);
            if (typeof simulationResponse?.targetValue === "number") {
                setTargetValue(String(simulationResponse.targetValue));
            } else if (simulationAlgorithmKey !== "binary_search") {
                setTargetValue("");
            }
            setIsPlaying(false);
            setShowCompletionToast(false);
            setSimulationError("");
            resetPracticeState(inputArray, 0);
            await startPracticeSession(inputArray, targetNumber);
        }

        async function loadAlgorithmDetails() {
            const numericId = Number(id);
            if (!Number.isFinite(numericId)) {
                setError("Invalid algorithm id.");
                setAlgorithm(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");
                setSimulationError("");

                const response = await AlgorithmService.getById(numericId, getToken);
                if (!isMounted) {
                    return;
                }

                const algorithmRecord = response?.data ?? null;
                setAlgorithm(algorithmRecord);

                if (!algorithmRecord) {
                    setError("Algorithm not found.");
                    return;
                }

                try {
                    const initialInput = getAlgorithmSampleInput(algorithmRecord.name);
                    const initialAlgorithmKey = getSimulationAlgorithmKey(algorithmRecord.name);
                    const defaultTarget = initialAlgorithmKey === "binary_search"
                        ? initialInput[Math.floor(initialInput.length / 2)]
                        : null;
                    await runSimulationTrace(algorithmRecord, initialInput, defaultTarget);
                } catch (runError) {
                    if (!isMounted) {
                        return;
                    }

                    const fallbackInput = getAlgorithmSampleInput(algorithmRecord.name);
                    setSampleInput(fallbackInput);
                    setArraySize(fallbackInput.length);
                    setElementsText(fallbackInput.join(", "));
                    setSteps(getFallbackStepsForAlgorithm(algorithmRecord.name, fallbackInput));
                    setIsPlaying(false);
                    setShowCompletionToast(false);
                    setSimulationError(runError instanceof Error
                        ? `${runError.message} Showing local mock steps for visual testing.`
                        : "Simulation trace is not available yet. Showing local mock steps for visual testing.");
                    if (simulationAlgorithmKey === "binary_search") {
                        setTargetValue(String(fallbackInput[Math.floor(fallbackInput.length / 2)]));
                    } else {
                        setTargetValue("");
                    }
                    resetPracticeState(fallbackInput, 0);
                }
            } catch (loadError) {
                if (!isMounted) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : "Failed to load algorithm details.");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadAlgorithmDetails();

        return () => {
            isMounted = false;
        };
    }, [getToken, id]);

    useEffect(() => {
        if (mode !== "auto" || !isPlaying || steps.length <= 1) {
            return undefined;
        }

        if (currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
            setShowCompletionToast(true);
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setCurrentStepIndex((previousIndex) => Math.min(previousIndex + 1, steps.length - 1));
        }, basePlaybackIntervalMs / playbackSpeed);

        return () => window.clearTimeout(timeoutId);
    }, [basePlaybackIntervalMs, currentStepIndex, isPlaying, mode, playbackSpeed, steps.length]);

    useEffect(() => {
        if (!showCompletionToast) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setShowCompletionToast(false);
        }, 2600);

        return () => window.clearTimeout(timeoutId);
    }, [showCompletionToast]);

    const presentationAlgorithm = useMemo(
        () => (algorithm ? getAlgorithmPresentation(algorithm) : null),
        [algorithm],
    );
    const difficulty = presentationAlgorithm ? getAlgorithmDifficulty(presentationAlgorithm.name) : "";
    const primaryComplexity = presentationAlgorithm ? getPrimaryComplexity(presentationAlgorithm) : "";
    const codeSnippets = presentationAlgorithm ? getAlgorithmCodeSnippets(presentationAlgorithm.name) : [];
    const simulationAlgorithmKey = algorithm ? getSimulationAlgorithmKey(algorithm.name) : "";
    const algorithmType = simulationAlgorithmKey === "binary_search" ? "search" : "sort";
    const isSearchMode = algorithmType === "search";
    const activeLine = steps[currentStepIndex]?.lineNumber ?? 0;
    const lineToStepIndexMap = useMemo(
        () => steps.reduce((accumulator, step, index) => {
            if (typeof step.lineNumber === "number" && accumulator[step.lineNumber] === undefined) {
                accumulator[step.lineNumber] = index;
            }

            return accumulator;
        }, {}),
        [steps],
    );
    const autoDiscardedIndices = useMemo(
        () => (isSearchMode
            ? getDiscardedIndicesForStep(steps, currentStepIndex)
            : []),
        [currentStepIndex, isSearchMode, steps],
    );

    function resetPracticeState(inputArray, nextStepIndex = 0) {
        setCurrentArray(inputArray);
        setPracticeSessionId("");
        setSelectedIndices([]);
        setFeedbackIndices([]);
        setFeedbackMessage(
            isSearchMode
                ? "Choose Go Left, Go Right, or Found based on the midpoint."
                : "Select two bars to attempt the next swap.",
        );
        setHintMessage(
            isSearchMode
                ? "Use a sorted list, compare the midpoint to the target, then choose which half to discard."
                : "Each swap is validated by the backend before the array updates.",
        );
        setIsCorrect(null);
        setSuggestedIndices([]);
        setIsValidatingStep(false);
        setPracticeCompleted(false);
        setFeedbackVersion((previousValue) => previousValue + 1);
        setCurrentStepIndex(nextStepIndex);
    }

    async function startPracticeSession(inputArray, targetNumber) {
        if (!algorithm) {
            return null;
        }

        const session = await SimulationService.startSession(
            simulationAlgorithmKey,
            inputArray,
            getToken,
            targetNumber,
        );

        setPracticeSessionId(session?.sessionId ?? "");
        setCurrentStepIndex(typeof session?.currentStepIndex === "number" ? session.currentStepIndex : 0);

        if (Array.isArray(session?.steps) && session.steps.length > 0) {
            setSteps(session.steps);
        }

        if (typeof session?.targetValue === "number") {
            setTargetValue(String(session.targetValue));
        }

        const sessionStep = Array.isArray(session?.steps)
            ? session.steps[session.currentStepIndex]
            : null;
        const normalizedAction = (sessionStep?.search?.state ?? sessionStep?.actionLabel ?? "").trim().toLowerCase();
        const isComplete = normalizedAction === "complete"
            || normalizedAction === "early_exit"
            || isTerminalSearchAction(normalizedAction);

        setPracticeCompleted(isComplete);
        setHintMessage(isComplete
            ? "No more actions are needed."
            : (isSearchMode
                ? "Use a sorted list, compare the midpoint to the target, then choose which half to discard."
                : "Each swap is validated by the backend before the array updates."));

        return session;
    }

    function handleTogglePlayback() {
        if (mode !== "auto" || steps.length <= 1) {
            return;
        }

        if (currentStepIndex >= steps.length - 1) {
            setCurrentStepIndex(0);
            setIsPlaying(true);
            setShowCompletionToast(false);
            return;
        }

        setShowCompletionToast(false);
        setIsPlaying((previousValue) => !previousValue);
    }

    function handleStepChange(nextStepIndex) {
        setIsPlaying(false);
        setShowCompletionToast(false);
        setCurrentStepIndex(nextStepIndex);
    }

    function handleStepForward() {
        if (mode !== "auto" || steps.length <= 1) {
            return;
        }

        setIsPlaying(false);
        setShowCompletionToast(false);
        setCurrentStepIndex((previousIndex) => Math.min(previousIndex + 1, steps.length - 1));
    }

    function handleStepBackward() {
        if (mode !== "auto" || steps.length === 0) {
            return;
        }

        setIsPlaying(false);
        setShowCompletionToast(false);
        setCurrentStepIndex((previousIndex) => Math.max(previousIndex - 1, 0));
    }

    function handleReset() {
        setIsPlaying(false);
        setShowCompletionToast(false);

        if (mode === "practice") {
            resetPracticeState(sampleInput, 0);
            const parsedTarget = parseTargetValue(targetValue);
            void startPracticeSession(sampleInput, parsedTarget.value);
            return;
        }

        setCurrentStepIndex(0);
    }

    function handleModeChange(nextMode) {
        setMode(nextMode);
        setIsPlaying(false);
        setShowCompletionToast(false);

        if (nextMode === "practice") {
            resetPracticeState(sampleInput, 0);
            const parsedTarget = parseTargetValue(targetValue);
            void startPracticeSession(sampleInput, parsedTarget.value);
            return;
        }

        setPracticeSessionId("");
        setSelectedIndices([]);
        setFeedbackIndices([]);
        setIsCorrect(null);
        setSuggestedIndices([]);
        setIsValidatingStep(false);
        setPracticeCompleted(false);
        setFeedbackVersion((previousValue) => previousValue + 1);
    }

    async function validatePracticeSwap(indices) {
        if (!algorithm || !practiceSessionId) {
            return;
        }

        setIsPlaying(false);
        setShowCompletionToast(false);
        setSimulationError("");
        setIsValidatingStep(true);
        setFeedbackIndices(indices);
        setSuggestedIndices([]);

        try {
            const validationResponse = await SimulationService.validateStep(
                practiceSessionId,
                {
                    type: "swap",
                    indices,
                },
                getToken,
            );

            const nextArrayState = Array.isArray(validationResponse?.newArrayState)
                ? validationResponse.newArrayState
                : currentArray;
            const nextSuggestedIndices = Array.isArray(validationResponse?.suggestedIndices)
                ? validationResponse.suggestedIndices
                : [];
            const nextExpectedAction = validationResponse?.nextExpectedAction ?? "";
            const wasCorrect = Boolean(validationResponse?.correct);

            setIsCorrect(wasCorrect);
            setFeedbackMessage(validationResponse?.message || (wasCorrect ? "Correct swap." : "Incorrect step."));
            setHintMessage(validationResponse?.hint || "");
            setSuggestedIndices(nextSuggestedIndices);
            setFeedbackVersion((previousValue) => previousValue + 1);

            if (!wasCorrect) {
                return;
            }

            const isComplete = nextExpectedAction === "complete"
                || isTerminalSearchAction(nextExpectedAction);
            setCurrentArray(nextArrayState);
            setPracticeCompleted(isComplete);
            setCurrentStepIndex(
                typeof validationResponse?.currentStepIndex === "number"
                    ? validationResponse.currentStepIndex
                    : currentStepIndex,
            );

            if (isComplete) {
                setShowCompletionToast(true);
            }
        } catch (validationError) {
            setIsCorrect(false);
            setFeedbackMessage("We couldn't validate that move right now.");
            setHintMessage("Please try again once the backend validation endpoint is available.");
            setSuggestedIndices([]);
            setFeedbackVersion((previousValue) => previousValue + 1);
            setSimulationError(validationError instanceof Error ? validationError.message : "Failed to validate the practice step.");
        } finally {
            setSelectedIndices([]);
            setIsValidatingStep(false);
        }
    }

    async function validatePracticeMidpoint(index) {
        if (!algorithm || !practiceSessionId) {
            return;
        }

        const indices = [index];

        setIsPlaying(false);
        setShowCompletionToast(false);
        setSimulationError("");
        setIsValidatingStep(true);
        setSelectedIndices(indices);
        setFeedbackIndices(indices);
        setSuggestedIndices([]);

        try {
            const validationResponse = await SimulationService.validateStep(
                practiceSessionId,
                {
                    type: "midpoint",
                    indices,
                },
                getToken,
            );

            const nextArrayState = Array.isArray(validationResponse?.newArrayState)
                ? validationResponse.newArrayState
                : currentArray;
            const nextSuggestedIndices = Array.isArray(validationResponse?.suggestedIndices)
                ? validationResponse.suggestedIndices
                : [];
            const nextExpectedAction = validationResponse?.nextExpectedAction ?? "";
            const wasCorrect = Boolean(validationResponse?.correct);

            setIsCorrect(wasCorrect);
            setFeedbackMessage(validationResponse?.message || (wasCorrect ? "Correct midpoint." : "Incorrect midpoint."));
            setHintMessage(validationResponse?.hint || "");
            setSuggestedIndices(nextSuggestedIndices);
            setFeedbackVersion((previousValue) => previousValue + 1);

            if (!wasCorrect) {
                return;
            }

            const isComplete = nextExpectedAction === "complete"
                || isTerminalSearchAction(nextExpectedAction);
            setCurrentArray(nextArrayState);
            setPracticeCompleted(isComplete);
            setCurrentStepIndex(
                typeof validationResponse?.currentStepIndex === "number"
                    ? validationResponse.currentStepIndex
                    : currentStepIndex,
            );

            if (isComplete) {
                setShowCompletionToast(true);
            }
        } catch (validationError) {
            setIsCorrect(false);
            setFeedbackMessage("We couldn't validate that midpoint right now.");
            setHintMessage("Please try again once the backend validation endpoint is available.");
            setSuggestedIndices([]);
            setFeedbackVersion((previousValue) => previousValue + 1);
            setSimulationError(validationError instanceof Error ? validationError.message : "Failed to validate the practice step.");
        } finally {
            setIsValidatingStep(false);
        }
    }

    async function handlePracticeBarClick(index) {
        if (
            mode !== "practice"
            || !algorithm
            || isValidatingStep
            || practiceCompleted
            || currentArray.length === 0
        ) {
            return;
        }

        if (isSearchMode) {
            setFeedbackIndices([]);
            setIsCorrect(null);
            setFeedbackMessage("Validating midpoint selection...");
            setHintMessage("The backend will confirm whether this midpoint is the next valid move.");
            await validatePracticeMidpoint(index);
            return;
        }

        if (selectedIndices.includes(index)) {
            setSelectedIndices((previousIndices) => previousIndices.filter((value) => value !== index));
            return;
        }

        if (selectedIndices.length === 0) {
            setSelectedIndices([index]);
            setFeedbackIndices([]);
            setIsCorrect(null);
            setFeedbackMessage("Select one more bar to validate the swap.");
            setHintMessage("The backend will confirm whether this swap is the next valid move.");
            return;
        }

        const attemptedIndices = [...selectedIndices, index]
            .slice(0, 2)
            .sort((leftIndex, rightIndex) => leftIndex - rightIndex);

        setSelectedIndices(attemptedIndices);
        await validatePracticeSwap(attemptedIndices);
    }

    function handleArraySizeChange(nextSize) {
        const normalizedSize = Number.isFinite(nextSize)
            ? Math.min(Math.max(Math.floor(nextSize), 2), 16)
            : 2;

        setArraySize(normalizedSize);
        setElementsText((previousText) => {
            const parsedValues = previousText
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
                .map((value) => Number(value));

            const resizedValues = Array.from({ length: normalizedSize }, (_, index) => parsedValues[index] ?? 0);
            return resizedValues.join(", ");
        });
    }

    function parseTargetValue(value) {
        if (!isSearchMode) {
            return { value: null, valid: true };
        }

        const trimmed = value.trim();
        if (!trimmed) {
            return { value: null, valid: false };
        }

        const parsed = Number(trimmed);
        if (Number.isNaN(parsed)) {
            return { value: null, valid: false };
        }

        return { value: parsed, valid: true };
    }

    async function runSimulationForInput(inputArray, targetNumber) {
        if (!algorithm) {
            return;
        }

        const simulationResponse = await SimulationService.runSimulation(
            simulationAlgorithmKey,
            inputArray,
            getToken,
            targetNumber,
        );

        setSampleInput(inputArray);
        setArraySize(inputArray.length);
        setElementsText(inputArray.join(", "));
        setSteps(Array.isArray(simulationResponse?.steps) ? simulationResponse.steps : []);
        if (typeof simulationResponse?.targetValue === "number") {
            setTargetValue(String(simulationResponse.targetValue));
        }
        setIsPlaying(false);
        setShowCompletionToast(false);
        setSimulationError("");
        resetPracticeState(inputArray, 0);
        await startPracticeSession(inputArray, targetNumber);
    }

    async function handleApplyInput() {
        if (!algorithm) {
            return;
        }

        const parsedValues = elementsText
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .map((value) => Number(value));

        if (parsedValues.length !== arraySize || parsedValues.some((value) => Number.isNaN(value))) {
            setSimulationError(`Enter exactly ${arraySize} numeric values separated by commas.`);
            return;
        }

        const parsedTarget = parseTargetValue(targetValue);
        if (!parsedTarget.valid) {
            setSimulationError("Enter a numeric target value for binary search.");
            return;
        }

        try {
            await runSimulationForInput(parsedValues, parsedTarget.value);
        } catch (runError) {
            setSteps(getFallbackStepsForAlgorithm(algorithm?.name, parsedValues));
            setCurrentStepIndex(0);
            setIsPlaying(false);
            setShowCompletionToast(false);
            setSimulationError(runError instanceof Error
                ? `${runError.message} Showing local mock steps for visual testing.`
                : "Simulation trace is not available yet. Showing local mock steps for visual testing.");
        }
    }

    async function handleGenerateRandomArray() {
        const size = Math.max(arraySize || sampleInput.length || 6, 2);
        const randomInput = Array.from(
            { length: size },
            () => Math.floor(Math.random() * 90) + 10,
        );

        try {
            const parsedTarget = parseTargetValue(targetValue);
            await runSimulationForInput(randomInput, parsedTarget.value);
        } catch (runError) {
            setSteps(getFallbackStepsForAlgorithm(algorithm?.name, randomInput));
            setCurrentStepIndex(0);
            setIsPlaying(false);
            setShowCompletionToast(false);
            setSimulationError(runError instanceof Error
                ? `${runError.message} Showing local mock steps for visual testing.`
                : "Simulation trace is not available yet. Showing local mock steps for visual testing.");
        }
    }

    function handleSearchDecision(decision) {
        if (
            mode !== "practice"
            || !isSearchMode
            || isValidatingStep
            || practiceCompleted
            || steps.length === 0
        ) {
            return;
        }

        const expected = getNextSearchDecision(steps, currentStepIndex);
        if (!expected) {
            setPracticeCompleted(true);
            setFeedbackMessage("Practice complete.");
            setHintMessage("No more actions are needed.");
            setShowCompletionToast(true);
            return;
        }

        const isCorrectDecision = expected.decision === decision;
        setIsCorrect(isCorrectDecision);
        setFeedbackVersion((previousValue) => previousValue + 1);

        if (!isCorrectDecision) {
            setFeedbackMessage("That would discard the wrong half.");
            setHintMessage("Compare the midpoint to the target and try again.");
            return;
        }

        setFeedbackMessage(decision === "found" ? "Target found." : "Correct. Narrow the search window.");
        setHintMessage("Choose the next move based on the new midpoint.");
        setCurrentStepIndex(expected.index);

        if (decision === "found") {
            setPracticeCompleted(true);
            setShowCompletionToast(true);
        }
    }

    return (
        <div className="min-h-screen bg-bg">
            <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-bg/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img
                                src="/BIGO.png"
                                alt="BIGO Logo"
                                className="h-16 w-auto group-hover:scale-110 transition-transform"
                            />
                        </Link>
                        <div className="hidden items-center gap-2 text-sm text-text-secondary sm:flex">
                            <Link to="/algorithms" className="transition hover:text-white">
                                Algorithms
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-white">{presentationAlgorithm?.name || algorithm?.name || "Details"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="hidden text-sm text-text-secondary md:inline">
                            {user?.primaryEmailAddress?.emailAddress}
                        </span>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 sm:py-10">
                {loading ? (
                    <div className="flex min-h-[50vh] items-center justify-center rounded-[2rem] border border-white/[0.06] bg-surface/60">
                        <span className="inline-flex items-center gap-3 text-sm text-text-secondary">
                            <LoaderCircle className="h-4 w-4 animate-spin text-accent" />
                            Loading algorithm details
                        </span>
                    </div>
                ) : error ? (
                    <div className="rounded-[2rem] border border-red-400/20 bg-red-400/5 p-8 text-sm text-red-200">
                        {error}
                    </div>
                ) : algorithm ? (
                    <>
                        <section className="rounded-[2rem] border border-white/[0.06] bg-surface p-6 sm:p-8 lg:p-10">
                            <div className="max-w-4xl">
                                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                                    {presentationAlgorithm?.category || algorithm.category}
                                </p>
                                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                    {presentationAlgorithm?.name || algorithm.name}
                                </h1>
                                <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary sm:text-lg">
                                    {presentationAlgorithm?.description || algorithm.description}
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
                                        {primaryComplexity} avg
                                    </span>
                                    <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                                        {(presentationAlgorithm?.timeComplexityBest || algorithm.timeComplexityBest)} best
                                    </span>
                                    <span className="inline-flex rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-200">
                                        {(presentationAlgorithm?.timeComplexityWorst || algorithm.timeComplexityWorst)} worst
                                    </span>
                                    <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                                        {difficulty}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <AlgorithmIntroductionSection
                            algorithmName={(presentationAlgorithm?.name || algorithm.name)}
                            steps={steps}
                            currentStepIndex={currentStepIndex}
                            onStepChange={handleStepChange}
                        />

                        <AlgorithmComplexityCharts algorithm={presentationAlgorithm || algorithm} />

                        <SimulationControls
                            mode={mode}
                            algorithmType={algorithmType}
                            isPlaying={isPlaying}
                            speed={playbackSpeed}
                            speeds={playbackSpeeds}
                            currentStepIndex={currentStepIndex}
                            totalSteps={steps.length}
                            arraySize={arraySize}
                            elementsText={elementsText}
                            targetValue={targetValue}
                            sampleInput={sampleInput}
                            simulationError={simulationError}
                            feedbackMessage={feedbackMessage}
                            hintMessage={hintMessage}
                            isCorrect={isCorrect}
                            isValidatingStep={isValidatingStep}
                            practiceCompleted={practiceCompleted}
                            onModeChange={handleModeChange}
                            onTogglePlayback={handleTogglePlayback}
                            onStepBackward={handleStepBackward}
                            onStepForward={handleStepForward}
                            onReset={handleReset}
                            onSpeedChange={setPlaybackSpeed}
                            onArraySizeChange={handleArraySizeChange}
                            onElementsChange={setElementsText}
                            onTargetChange={setTargetValue}
                            onApplyInput={handleApplyInput}
                            onGenerateRandomArray={handleGenerateRandomArray}
                        />

                        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
                            <AlgorithmVisualizer
                                steps={steps}
                                currentStepIndex={currentStepIndex}
                                algorithmType={algorithmType}
                                searchTargetValue={isSearchMode && targetValue.trim() !== ""
                                    ? Number(targetValue)
                                    : null}
                                mode={mode}
                                practiceArray={currentArray}
                                selectedIndices={selectedIndices}
                                suggestedIndices={suggestedIndices}
                                feedbackIndices={feedbackIndices}
                                discardedIndices={autoDiscardedIndices}
                                feedbackTone={isCorrect === null ? null : (isCorrect ? "correct" : "incorrect")}
                                feedbackVersion={feedbackVersion}
                                hintMessage={mode === "practice" ? hintMessage : ""}
                                practiceCompleted={practiceCompleted}
                                isInteractionDisabled={mode !== "practice" || isValidatingStep || practiceCompleted}
                                onBarClick={algorithmType === "search" ? undefined : handlePracticeBarClick}
                                onSearchDecision={handleSearchDecision}
                            />
                            <CodePanel
                                snippets={codeSnippets}
                                activeLine={activeLine}
                                lineToStepIndexMap={lineToStepIndexMap}
                                onSeekToStep={handleStepChange}
                            />
                        </section>

                        <AlgorithmQuizCTA algorithm={presentationAlgorithm || algorithm} />
                    </>
                ) : null}
            </main>

            <AnimatePresence>
                {showCompletionToast ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed bottom-6 right-6 z-50 rounded-2xl border border-accent/20 bg-surface/95 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                    >
                        <p className="text-sm font-semibold text-white">
                            {mode === "practice" ? "Practice complete" : "Search complete"}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                            {mode === "practice"
                                ? (isSearchMode
                                    ? "You completed the search decisions."
                                    : "The backend confirmed the array is sorted.")
                                : "The backend simulation finished all steps."}
                        </p>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
