import { Pause, Play, RotateCcw, Shuffle, SkipBack, SkipForward, WandSparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type LearningMode = "auto" | "practice";

type SimulationControlsProps = {
    mode: LearningMode;
    algorithmType?: "sort" | "search";
    isPlaying: boolean;
    speed: number;
    speeds: number[];
    currentStepIndex: number;
    totalSteps: number;
    arraySize: number;
    elementsText: string;
    targetValue: string;
    sampleInput: number[];
    simulationError: string;
    feedbackMessage: string;
    hintMessage: string;
    isCorrect: boolean | null;
    isValidatingStep: boolean;
    practiceCompleted: boolean;
    onModeChange: (mode: LearningMode) => void;
    onTogglePlayback: () => void;
    onStepBackward: () => void;
    onStepForward: () => void;
    onReset: () => void;
    onSpeedChange: (speed: number) => void;
    onArraySizeChange: (size: number) => void;
    onElementsChange: (value: string) => void;
    onTargetChange: (value: string) => void;
    onApplyInput: () => void;
    onGenerateRandomArray: () => void;
    className?: string;
};

function getFeedbackClassName(isCorrect: boolean | null) {
    if (isCorrect === true) {
        return "border-emerald-400/20 bg-emerald-400/5 text-emerald-100";
    }

    if (isCorrect === false) {
        return "border-red-400/20 bg-red-400/5 text-red-100";
    }

    return "border-white/[0.06] bg-bg/60 text-text-secondary";
}

export default function SimulationControls({
    mode,
    algorithmType = "sort",
    isPlaying,
    speed,
    speeds,
    currentStepIndex,
    totalSteps,
    arraySize,
    elementsText,
    targetValue,
    sampleInput,
    simulationError,
    feedbackMessage,
    hintMessage,
    isCorrect,
    isValidatingStep,
    practiceCompleted,
    onModeChange,
    onTogglePlayback,
    onStepBackward,
    onStepForward,
    onReset,
    onSpeedChange,
    onArraySizeChange,
    onElementsChange,
    onTargetChange,
    onApplyInput,
    onGenerateRandomArray,
    className,
}: SimulationControlsProps) {
    const speedIndex = Math.max(speeds.indexOf(speed), 0);
    const canStepBackward = totalSteps > 0 && currentStepIndex > 0 && mode === "auto";
    const canStepForward = totalSteps > 1 && currentStepIndex < totalSteps - 1 && mode === "auto";
    const canControlPlayback = totalSteps > 1 && mode === "auto";
    const isPracticeMode = mode === "practice";
    const isPracticeBusy = isPracticeMode && isValidatingStep;

    return (
        <section
            className={cn(
                "rounded-[2rem] border border-white/[0.06] bg-surface p-6",
                className,
            )}
        >
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-s font-semibold uppercase tracking-[0.28em] text-accent">
                            03- Simulation
                        </p>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
                            Simulation controls
                        </h2>
                        
                    </div>

                    <div className="flex flex-col gap-3">
                        {isPracticeMode ? (
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                {isValidatingStep ? (
                                    <Badge variant="secondary">Validating step</Badge>
                                ) : null}
                                {practiceCompleted ? (
                                    <Badge variant="secondary">Practice complete</Badge>
                                ) : null}
                            </div>
                        ) : null}
                        
                        <div className="inline-flex rounded-full border border-white/10 bg-bg/60 p-1">
                            <Button
                                variant={isPracticeMode ? "ghost" : "default"}
                                size="sm"
                                onClick={() => onModeChange("auto")}
                                className="rounded-full"
                            >
                                Auto Mode
                            </Button>
                            <Button
                                variant={isPracticeMode ? "default" : "ghost"}
                                size="sm"
                                onClick={() => onModeChange("practice")}
                                className="rounded-full"
                            >
                                Practice Mode
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-bg/50 p-4 sm:p-5">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                variant="default"
                                onClick={onTogglePlayback}
                                disabled={!canControlPlayback}
                            >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                {isPlaying ? "Pause" : currentStepIndex >= totalSteps - 1 ? "Replay" : "Play"}
                            </Button>

                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={onStepBackward}
                                disabled={!canStepBackward}
                                aria-label="Step backward"
                            >
                                <SkipBack className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={onStepForward}
                                disabled={!canStepForward}
                                aria-label="Step forward"
                            >
                                <SkipForward className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                onClick={onReset}
                                disabled={isPracticeMode
                                    ? sampleInput.length === 0 || isPracticeBusy
                                    : totalSteps === 0 || currentStepIndex === 0}
                            >
                                <RotateCcw className="h-4 w-4" />
                                {isPracticeMode ? "Reset practice" : "Reset"}
                            </Button>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                            <div className="min-w-0 md:w-52">
                                <p className="text-sm font-semibold text-white">
                                    Playback speed
                                </p>
                                
                            </div>

                            <div className="flex-1">
                                <Slider
                                    value={[speedIndex]}
                                    min={0}
                                    max={speeds.length - 1}
                                    step={1}
                                    disabled={isPracticeMode}
                                    onValueChange={([nextIndex]) => {
                                        const nextSpeed = speeds[nextIndex] ?? speeds[0];
                                        onSpeedChange(nextSpeed);
                                    }}
                                    aria-label="Simulation playback speed"
                                />
                                <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                                    {speeds.map((value) => (
                                        <span key={value}>{value}x</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
                            <div className="rounded-2xl border border-white/[0.06] bg-surface/60 p-4">
                                <div className={cn(
                                    "grid gap-4",
                                    algorithmType === "search"
                                        ? "lg:grid-cols-[100px_minmax(0,2.2fr)_100px_auto]"
                                        : "lg:grid-cols-[100px_minmax(0,2fr)_auto]",
                                )}>
                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-white">Array size</span>
                                        <input
                                            type="number"
                                            min="2"
                                            max="16"
                                            value={arraySize}
                                            onChange={(event) => onArraySizeChange(Number(event.target.value))}
                                        />
                                    </label>

                                    <label className="flex min-w-0 flex-col gap-2 text-sm">
                                        <span className="font-medium text-white">Elements</span>
                                        <input
                                            type="text"
                                            value={elementsText}
                                            onChange={(event) => onElementsChange(event.target.value)}
                                            placeholder="8, 3, 5, 1, 9, 2"
                                            className="w-full min-w-0"
                                        />
                                    </label>

                                    {algorithmType === "search" ? (
                                        <label className="flex flex-col gap-2 text-sm">
                                            <span className="font-medium text-white">Target</span>
                                            <input
                                                type="number"
                                                value={targetValue}
                                                onChange={(event) => onTargetChange(event.target.value)}
                                                placeholder="42"
                                            />
                                        </label>
                                    ) : null}

                                    <div className="flex items-end">
                                        <div className="flex w-full flex-col gap-2 lg:w-auto">
                                            <Button
                                                variant="secondary"
                                                onClick={onGenerateRandomArray}
                                                className="w-full lg:w-auto"
                                                disabled={isPracticeBusy}
                                            >
                                                <Shuffle className="h-4 w-4" />
                                                Random array
                                            </Button>
                                            <Button
                                                variant="default"
                                                onClick={onApplyInput}
                                                className="w-full lg:w-auto"
                                                disabled={isPracticeBusy}
                                            >
                                                <WandSparkles className="h-4 w-4" />
                                                Run trace
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-white/[0.06] bg-bg/60 p-4">
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <span className="text-text-secondary">Sample input</span>
                                        <span className="font-medium text-white">
                                            [{sampleInput.join(", ")}]
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                                        <span className="text-text-secondary">Steps returned</span>
                                        <span className="font-medium text-white">{totalSteps}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className={cn(
                                    "rounded-2xl border p-4 text-sm leading-6",
                                    getFeedbackClassName(isCorrect),
                                )}>
                                    <p className="font-semibold text-white">
                                        {isPracticeMode ? "Practice feedback" : "Current mode"}
                                    </p>
                                    <p className="mt-2">
                                        {isPracticeMode
                                            ? feedbackMessage || (algorithmType === "search"
                                                ? "Choose Go Left, Go Right, or Found based on the midpoint."
                                                : "Select two bars to attempt the next swap.")
                                            : (algorithmType === "search"
                                                ? "Watch the search window shrink around the target."
                                                : "Watch as Auto Mode swaps the elements.")}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/[0.06] bg-bg/60 p-4 text-sm leading-6 text-text-secondary">
                                    <p className="font-semibold text-white">Current hint</p>
                                    <p className="mt-2">
                                        {isPracticeMode
                                            ? hintMessage || (algorithmType === "search"
                                                ? "Use a sorted list, compare the midpoint to the target, then choose which half to discard."
                                                : "Select two bars and BigO will validate the swap.")
                                            : "Use the transport controls to inspect each step at your own pace."}
                                    </p>
                                </div>

                                {simulationError ? (
                                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm leading-6 text-amber-100">
                                        {simulationError}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
