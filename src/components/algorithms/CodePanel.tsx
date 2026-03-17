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
    const activeDisplayLines = useMemo(() => {
        if (!activeSnippet?.syncsWithTrace || activeLine <= 0) {
            return [];
        }

        const mappedLine = activeSnippet.traceLineMap?.[activeLine] ?? activeLine;
        return Array.isArray(mappedLine) ? mappedLine : [mappedLine];
    }, [activeLine, activeSnippet]);
    const displayLineToTraceLineMap = useMemo(() => {
        if (!activeSnippet?.syncsWithTrace || !activeSnippet.traceLineMap) {
            return {};
        }

        return Object.entries(activeSnippet.traceLineMap).reduce<Record<number, number>>((accumulator, [traceLine, displayLine]) => {
            const displayLines = Array.isArray(displayLine) ? displayLine : [displayLine];

            displayLines.forEach((lineNumber) => {
                accumulator[lineNumber] = Number(traceLine);
            });

            return accumulator;
        }, {});
    }, [activeSnippet]);

    useEffect(() => {
        if (!activeSnippet?.syncsWithTrace || activeDisplayLines.length === 0) {
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
        if (!activeSnippet?.syncsWithTrace || !onSeekToStep || !lineToStepIndexMap) {
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
                "overflow-hidden rounded-[2rem] border border-white/[0.06] bg-surface",
                className,
            )}
        >
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center gap-3">
                    <Code2 className="h-5 w-5 text-accent" />
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            {activeSnippet?.label || "Implementation"}
                        </h2>
                        
                    </div>
                </div>

                <Button variant="secondary" onClick={handleCopyCode} disabled={!activeSnippet}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy Code"}
                </Button>
            </div>

            <div className="border-b border-white/[0.06] px-4 py-3">
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
                                    : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white",
                            )}
                        >
                            {snippet.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative bg-[linear-gradient(180deg,rgba(12,12,12,0.96),rgba(21,21,21,0.98))]">
                <div className="max-h-[42rem] overflow-auto px-4 py-4 font-mono text-sm">
                    <div className="space-y-[2px]">
                        {codeLines.map((line, index) => {
                            const lineNumber = index + 1;
                            const isActive = Boolean(activeSnippet?.syncsWithTrace) && activeDisplayLines.includes(lineNumber);
                            const isClickable = Boolean(activeSnippet?.syncsWithTrace && typeof lineToStepIndexMap === "object" && onSeekToStep);

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
                                        isClickable && "cursor-pointer hover:bg-white/[0.04]",
                                        isActive && "bg-white/[0.05] shadow-[inset_0_0_0_1px_rgba(213,255,64,0.08)]",
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
                                        "whitespace-pre-wrap leading-7 text-slate-200 transition-colors duration-300",
                                        isActive && "text-white",
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
