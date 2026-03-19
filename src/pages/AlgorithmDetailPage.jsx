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

    return [
        {
            stepNumber: 1,
            arrayState: values,
            activeIndices: [midIndex],
            lineNumber: 4,
            actionLabel: "compare",
        },
        {
            stepNumber: 2,
            arrayState: values,
            activeIndices: [midIndex],
            lineNumber: 7,
            actionLabel: "discard_left",
        },
        {
            stepNumber: 3,
            arrayState: values,
            activeIndices: [rightMidIndex],
            lineNumber: 4,
            actionLabel: "compare",
        },
        {
            stepNumber: 4,
            arrayState: values,
            activeIndices: [rightMidIndex],
            lineNumber: 5,
            actionLabel: "found",
        },
        {
            stepNumber: 5,
            arrayState: values,
            activeIndices: [],
            lineNumber: 8,
            actionLabel: "not_found",
        },
    ];
}

function getFallbackStepsForAlgorithm(algorithmName, inputArray) {
    if (algorithmName?.trim().toLowerCase() === "binary search") {
        return buildMockBinarySearchSteps(inputArray);
    }

    return [];
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
    const [mode, setMode] = useState("auto");
    const [practiceSessionId, setPracticeSessionId] = useState("");
    const [currentArray, setCurrentArray] = useState([]);
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [feedbackIndices, setFeedbackIndices] = useState([]);
    const [feedbackMessage, setFeedbackMessage] = useState("Select one bar as the midpoint.");
    const [hintMessage, setHintMessage] = useState("Each midpoint pick is validated by the backend before the search window updates.");
    const [isCorrect, setIsCorrect] = useState(null);
    const [suggestedIndices, setSuggestedIndices] = useState([]);
    const [isValidatingStep, setIsValidatingStep] = useState(false);
    const [practiceCompleted, setPracticeCompleted] = useState(false);
    const [feedbackVersion, setFeedbackVersion] = useState(0);
    const [showCompletionToast, setShowCompletionToast] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function runSimulationTrace(algorithmRecord, inputArray) {
            const simulationResponse = await SimulationService.runSimulation(
                getSimulationAlgorithmKey(algorithmRecord.name),
                inputArray,
                getToken,
            );

            if (!isMounted) {
                return;
            }

            setSampleInput(inputArray);
            setArraySize(inputArray.length);
            setElementsText(inputArray.join(", "));
            setSteps(Array.isArray(simulationResponse?.steps) ? simulationResponse.steps : []);
            setIsPlaying(false);
            setShowCompletionToast(false);
            setSimulationError("");
            resetPracticeState(inputArray, 0);
            await startPracticeSession(inputArray);
        }

        async function loadAlgorithmDetails() {
            try {
                setLoading(true);
                setError("");
                setSimulationError("");

                const response = await AlgorithmService.getById(Number(id), getToken);
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
                    await runSimulationTrace(algorithmRecord, initialInput);
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

    const difficulty = algorithm ? getAlgorithmDifficulty(algorithm.name) : "";
    const primaryComplexity = algorithm ? getPrimaryComplexity(algorithm) : "";
    const codeSnippets = algorithm ? getAlgorithmCodeSnippets(algorithm.name) : [];
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

    function resetPracticeState(inputArray, nextStepIndex = 0) {
        setCurrentArray(inputArray);
        setPracticeSessionId("");
        setSelectedIndices([]);
        setFeedbackIndices([]);
        setFeedbackMessage(
            isSearchMode
                ? "Select one bar as the midpoint."
                : "Select two bars to attempt the next swap.",
        );
        setHintMessage(
            isSearchMode
                ? "Each midpoint pick is validated by the backend before the search window updates."
                : "Each swap is validated by the backend before the array updates.",
        );
        setIsCorrect(null);
        setSuggestedIndices([]);
        setIsValidatingStep(false);
        setPracticeCompleted(false);
        setFeedbackVersion((previousValue) => previousValue + 1);
        setCurrentStepIndex(nextStepIndex);
    }

    async function startPracticeSession(inputArray) {
        if (!algorithm) {
            return null;
        }

        const session = await SimulationService.startSession(
            simulationAlgorithmKey,
            inputArray,
            getToken,
        );

        setPracticeSessionId(session?.sessionId ?? "");
        setCurrentStepIndex(typeof session?.currentStepIndex === "number" ? session.currentStepIndex : 0);

        if (Array.isArray(session?.steps) && session.steps.length > 0) {
            setSteps(session.steps);
        }

        const sessionStep = Array.isArray(session?.steps)
            ? session.steps[session.currentStepIndex]
            : null;
        const isComplete = sessionStep?.actionLabel?.trim().toLowerCase() === "complete"
            || sessionStep?.actionLabel?.trim().toLowerCase() === "early_exit";

        setPracticeCompleted(isComplete);
        setHintMessage(isComplete
            ? "No more actions are needed."
            : (isSearchMode
                ? "Each midpoint pick is validated by the backend before the search window updates."
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
            void startPracticeSession(sampleInput);
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
            void startPracticeSession(sampleInput);
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

            const isComplete = nextExpectedAction === "complete";
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

            const isComplete = nextExpectedAction === "complete";
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

    async function runSimulationForInput(inputArray) {
        if (!algorithm) {
            return;
        }

        const simulationResponse = await SimulationService.runSimulation(
            simulationAlgorithmKey,
            inputArray,
            getToken,
        );

        setSampleInput(inputArray);
        setArraySize(inputArray.length);
        setElementsText(inputArray.join(", "));
        setSteps(Array.isArray(simulationResponse?.steps) ? simulationResponse.steps : []);
        setIsPlaying(false);
        setShowCompletionToast(false);
        setSimulationError("");
        resetPracticeState(inputArray, 0);
        await startPracticeSession(inputArray);
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

        try {
            await runSimulationForInput(parsedValues);
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
            await runSimulationForInput(randomInput);
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

    return (
        <div className="min-h-screen bg-bg">
            <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-bg/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="text-xl font-bold tracking-tight text-accent">
                            BigO
                        </Link>
                        <div className="hidden items-center gap-2 text-sm text-text-secondary sm:flex">
                            <Link to="/algorithms" className="transition hover:text-white">
                                Algorithms
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-white">{algorithm?.name || "Details"}</span>
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
                                    {algorithm.category}
                                </p>
                                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                    {algorithm.name}
                                </h1>
                                <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary sm:text-lg">
                                    {algorithm.description}
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
                                        {primaryComplexity} avg
                                    </span>
                                    <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                                        {algorithm.timeComplexityBest} best
                                    </span>
                                    <span className="inline-flex rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-200">
                                        {algorithm.timeComplexityWorst} worst
                                    </span>
                                    <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                                        {difficulty}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <AlgorithmIntroductionSection
                            algorithmName={algorithm.name}
                            steps={steps}
                            currentStepIndex={currentStepIndex}
                            onStepChange={handleStepChange}
                        />

                        <AlgorithmComplexityCharts algorithm={algorithm} />

                        <SimulationControls
                            mode={mode}
                            isPlaying={isPlaying}
                            speed={playbackSpeed}
                            speeds={playbackSpeeds}
                            currentStepIndex={currentStepIndex}
                            totalSteps={steps.length}
                            arraySize={arraySize}
                            elementsText={elementsText}
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
                            onApplyInput={handleApplyInput}
                            onGenerateRandomArray={handleGenerateRandomArray}
                        />

                        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
                            <AlgorithmVisualizer
                                steps={steps}
                                currentStepIndex={currentStepIndex}
                                algorithmType={algorithmType}
                                mode={mode}
                                practiceArray={currentArray}
                                selectedIndices={selectedIndices}
                                suggestedIndices={suggestedIndices}
                                feedbackIndices={feedbackIndices}
                                feedbackTone={isCorrect === null ? null : (isCorrect ? "correct" : "incorrect")}
                                feedbackVersion={feedbackVersion}
                                hintMessage={mode === "practice" ? hintMessage : ""}
                                practiceCompleted={practiceCompleted}
                                isInteractionDisabled={mode !== "practice" || isValidatingStep || practiceCompleted}
                                onBarClick={handlePracticeBarClick}
                            />
                            <CodePanel
                                snippets={codeSnippets}
                                activeLine={activeLine}
                                lineToStepIndexMap={lineToStepIndexMap}
                                onSeekToStep={handleStepChange}
                            />
                        </section>

                        <AlgorithmQuizCTA algorithm={algorithm} />
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
                                ? "The backend confirmed the array is sorted."
                                : "The backend simulation finished all steps."}
                        </p>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
