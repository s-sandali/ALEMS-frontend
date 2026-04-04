import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CodeSnippet = {
    id: string;
    label: string;
    language: string;
    syncsWithTrace?: boolean;
    traceLineMap?: Record<number, number | number[]>;
    code: string;
};

type CodePanelProps = {
    snippets: CodeSnippet[];
    activeLine?: number;
    lineToStepIndexMap?: Record<number, number>;
    onSeekToStep?: (stepIndex: number) => void;
    className?: string;
};

export default function CodePanel({
    snippets,
    activeLine = 0,
    lineToStepIndexMap,
    onSeekToStep,
    className,
}: CodePanelProps) {
    const [activeSnippetId, setActiveSnippetId] = useState(snippets[0]?.id ?? "");
    const [copied, setCopied] = useState(false);
    const lineRefs = useRef<Array<HTMLButtonElement | null>>([]);

    useEffect(() => {
        if (!snippets.some((snippet) => snippet.id === activeSnippetId)) {
            setActiveSnippetId(snippets[0]?.id ?? "");
        }
    }, [activeSnippetId, snippets]);

    const activeSnippet = useMemo(
        () => snippets.find((snippet) => snippet.id === activeSnippetId) ?? snippets[0],
        [activeSnippetId, snippets],
    );

    const codeLines = useMemo(
        () => activeSnippet?.code.split("\n") ?? [],
        [activeSnippet],
    );
    const availableTraceLines = useMemo(() => {
        if (!lineToStepIndexMap) {
            return [];
        }

        return Object.keys(lineToStepIndexMap)
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value))
            .sort((left, right) => left - right);
    }, [lineToStepIndexMap]);

    const maxTraceLine = useMemo(
        () => availableTraceLines[availableTraceLines.length - 1] ?? 0,
        [availableTraceLines],
    );

    function mapTraceToDisplayLine(traceLine: number) {
        if (codeLines.length === 0) {
            return 1;
        }

        if (maxTraceLine <= 1) {
            return 1;
        }

        const ratio = Math.min(Math.max(traceLine, 1), maxTraceLine) / maxTraceLine;
        return Math.min(codeLines.length, Math.max(1, Math.round(ratio * codeLines.length)));
    }

    function mapDisplayToTraceLine(displayLine: number) {
        if (availableTraceLines.length === 0 || codeLines.length === 0) {
            return displayLine;
        }

        const normalizedDisplay = Math.min(Math.max(displayLine, 1), codeLines.length);
        const ratio = normalizedDisplay / Math.max(codeLines.length, 1);
        const targetIndex = Math.min(
            availableTraceLines.length - 1,
            Math.max(0, Math.round(ratio * (availableTraceLines.length - 1))),
        );

        return availableTraceLines[targetIndex];
    }

    const activeDisplayLines = useMemo(() => {
        if (!activeSnippet || activeLine <= 0) {
            return [];
        }

        if (activeSnippet.syncsWithTrace) {
            const mappedLine = activeSnippet.traceLineMap?.[activeLine] ?? activeLine;
            return Array.isArray(mappedLine) ? mappedLine : [mappedLine];
        }

        if (availableTraceLines.length === 0) {
            return [];
        }

        const mappedLine = mapTraceToDisplayLine(activeLine);
        return Array.isArray(mappedLine) ? mappedLine : [mappedLine];
    }, [activeLine, activeSnippet, availableTraceLines.length, codeLines.length, maxTraceLine]);

    const displayLineToTraceLineMap = useMemo(() => {
        if (!activeSnippet) {
            return {};
        }

        if (activeSnippet.syncsWithTrace && activeSnippet.traceLineMap) {
            return Object.entries(activeSnippet.traceLineMap).reduce<Record<number, number>>((accumulator, [traceLine, displayLine]) => {
                const displayLines = Array.isArray(displayLine) ? displayLine : [displayLine];

                displayLines.forEach((lineNumber) => {
                    accumulator[lineNumber] = Number(traceLine);
                });

                return accumulator;
            }, {});
        }

        if (availableTraceLines.length === 0 || codeLines.length === 0) {
            return {};
        }

        return codeLines.reduce<Record<number, number>>((accumulator, _line, index) => {
            const displayLine = index + 1;
            accumulator[displayLine] = mapDisplayToTraceLine(displayLine);
            return accumulator;
        }, {});
    }, [activeSnippet, availableTraceLines, codeLines]);

    useEffect(() => {
        if (activeDisplayLines.length === 0) {
            return;
        }

        const activeElement = lineRefs.current[activeDisplayLines[0] - 1];
        activeElement?.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
        });
    }, [activeDisplayLines, activeSnippet]);

    useEffect(() => {
        if (!copied) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => setCopied(false), 1600);
        return () => window.clearTimeout(timeoutId);
    }, [copied]);

    async function handleCopyCode() {
        if (!activeSnippet?.code) {
            return;
        }

        await navigator.clipboard.writeText(activeSnippet.code);
        setCopied(true);
    }

    function handleLineClick(displayLineNumber: number) {
        if (!onSeekToStep || !lineToStepIndexMap) {
            return;
        }

        const traceLineNumber = displayLineToTraceLineMap[displayLineNumber] ?? displayLineNumber;
        const nextStepIndex = lineToStepIndexMap[traceLineNumber];

        if (typeof nextStepIndex === "number") {
            onSeekToStep(nextStepIndex);
        }
    }

    return (
        <section
            className={cn(
                "overflow-hidden rounded-[2rem] bg-surface",
                className,
            )}
            style={{ border: "1px solid var(--db-border)" }}
        >
            <div className="flex items-center justify-between gap-4 px-5 py-4" style={{ borderBottom: "1px solid var(--db-border)" }}>
                <div className="flex items-center gap-3">
                    <Code2 className="h-5 w-5 text-accent" />
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text-primary">
                            {activeSnippet?.label || "Implementation"}
                        </h2>
                        
                    </div>
                </div>

                <Button variant="secondary" onClick={handleCopyCode} disabled={!activeSnippet}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy Code"}
                </Button>
            </div>

            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--db-border)" }}>
                <div className="flex flex-wrap gap-2">
                    {snippets.map((snippet) => (
                        <button
                            key={snippet.id}
                            type="button"
                            onClick={() => setActiveSnippetId(snippet.id)}
                            className={cn(
                                "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                                snippet.id === activeSnippet?.id
                                    ? "border-accent/20 bg-accent/10 text-accent"
                                    : "text-text-secondary hover:text-text-primary",
                            )}
                        >
                            {snippet.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative" style={{ background: "var(--db-bg3)" }}>
                <div className="max-h-[42rem] overflow-auto px-4 py-4 text-sm">
                    <div className="space-y-[2px]">
                        {codeLines.map((line, index) => {
                            const lineNumber = index + 1;
                            const isActive = activeDisplayLines.includes(lineNumber);
                            const isClickable = Boolean(typeof lineToStepIndexMap === "object" && onSeekToStep);

                            return (
                                <button
                                    key={`${activeSnippet?.id}-${lineNumber}`}
                                    type="button"
                                    ref={(element) => {
                                        lineRefs.current[index] = element;
                                    }}
                                    onClick={() => handleLineClick(lineNumber)}
                                    className={cn(
                                        "relative flex w-full items-start gap-4 rounded-lg px-3 py-1.5 text-left transition-[background-color,color,box-shadow] duration-300 ease-out",
                                        isClickable && "cursor-pointer hover:bg-accent/5",
                                        isActive && "bg-accent/[0.07]",
                                    )}
                                    disabled={!isClickable}
                                >
                                    <span
                                        className={cn(
                                            "absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full bg-transparent transition-colors duration-300",
                                            isActive && "bg-accent/80",
                                        )}
                                    />
                                    <span className={cn(
                                        "w-8 shrink-0 select-none text-right text-xs leading-7 text-text-secondary/60 transition-colors duration-300",
                                        isActive && "text-accent",
                                    )}>
                                        {lineNumber}
                                    </span>
                                    <span className={cn(
                                        "whitespace-pre-wrap leading-7 text-text-secondary transition-colors duration-300",
                                        isActive && "text-text-primary",
                                    )}>
                                        {line || " "}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {activeSnippet ? (
                    <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-white/10 bg-bg/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        {activeSnippet.language}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
