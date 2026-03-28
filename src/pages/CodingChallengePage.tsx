import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Editor from "@monaco-editor/react";
import { LoaderCircle, Play, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import LanguageSelector from "@/components/ui/LanguageSelector";
import ExecutionResultPanel from "@/components/ui/ExecutionResultPanel";
import {
    StudentCodingQuestionService,
    CodeExecutionApiService,
    type CodingQuestion,
    type SupportedLanguage,
    type CodeExecutionResult,
} from "@/lib/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const LANGUAGE_MAP: Record<number, string> = {
    71: "python",
    63: "javascript",
    62: "java",
    54: "cpp",
    50: "c",
};

const DEFAULT_STARTERS: Record<number, string> = {
    71: "# Python 3\n\n",
    63: "// JavaScript\n\n",
    62: "// Java\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n",
    54: "// C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n",
    50: "// C\n#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n",
};

const DIFFICULTY_COLOR: Record<string, string> = {
    easy:   "var(--lime)",
    medium: "var(--amber)",
    hard:   "var(--red)",
};

type ViewState = "idle" | "running" | "done" | "error";

// ── Component ─────────────────────────────────────────────────────────────────

export default function CodingChallengePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getToken } = useAuth();

    // Page-level loading
    const [pageView, setPageView]       = useState<"loading" | "ready" | "error">("loading");
    const [pageError, setPageError]     = useState("");
    const [question, setQuestion]       = useState<CodingQuestion | null>(null);
    const [languages, setLanguages]     = useState<SupportedLanguage[]>([]);

    // Editor state
    const [selectedLang, setSelectedLang] = useState<number>(71); // default: Python 3
    const [sourceCode, setSourceCode]     = useState<string>(DEFAULT_STARTERS[71]);
    const [stdin, setStdin]               = useState<string>("");
    const [stdinOpen, setStdinOpen]       = useState(false);

    // Execution state
    const [execView, setExecView]       = useState<ViewState>("idle");
    const [execResult, setExecResult]   = useState<CodeExecutionResult | null>(null);
    const [execError, setExecError]     = useState("");

    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // ── Load question + languages on mount ───────────────────────────────────

    const load = useCallback(async () => {
        setPageView("loading");
        setPageError("");

        try {
            const [questionRes, languagesRes] = await Promise.all([
                StudentCodingQuestionService.getById(Number(id), getToken),
                CodeExecutionApiService.getLanguages(getToken),
            ]);
            if (!isMounted.current) return;

            setQuestion(questionRes.data);
            setLanguages(languagesRes.data);
            // Pre-fill stdin with the question's input example
            setStdin(questionRes.data.inputExample ?? "");
            setPageView("ready");
        } catch (err) {
            if (!isMounted.current) return;
            const msg = err instanceof Error ? err.message : "Failed to load.";
            if (msg === "UNAUTHORIZED") { navigate("/login"); return; }
            setPageError(msg);
            setPageView("error");
        }
    }, [id, getToken, navigate]);

    useEffect(() => { load(); }, [load]);

    // ── Language change: reset editor to starter template ────────────────────

    function handleLanguageChange(langId: number) {
        setSelectedLang(langId);
        setSourceCode(DEFAULT_STARTERS[langId] ?? "");
        setExecView("idle");
        setExecResult(null);
    }

    // ── Run code ─────────────────────────────────────────────────────────────

    async function handleRun() {
        if (execView === "running") return;
        setExecView("running");
        setExecResult(null);
        setExecError("");

        try {
            const res = await CodeExecutionApiService.execute(
                { sourceCode, languageId: selectedLang, stdin: stdin || null },
                getToken,
            );
            if (!isMounted.current) return;
            setExecResult(res.data);
            setExecView("done");
        } catch (err) {
            if (!isMounted.current) return;
            const msg = err instanceof Error ? err.message : "Execution failed.";
            if (msg === "UNAUTHORIZED") { navigate("/login"); return; }
            setExecError(msg);
            setExecView("error");
        }
    }

    function handleReset() {
        setSourceCode(DEFAULT_STARTERS[selectedLang] ?? "");
        setExecView("idle");
        setExecResult(null);
        setExecError("");
    }

    // ── Render ────────────────────────────────────────────────────────────────

    const isRunning = execView === "running";

    return (
        <div className="min-h-screen bg-bg">
            <DashboardNav />

            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* Page loading */}
                {pageView === "loading" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--db-text2)", fontSize: 14, minHeight: 240 }}>
                        <LoaderCircle size={16} className="animate-spin" style={{ color: "var(--accent)" }} />
                        Loading challenge…
                    </div>
                )}

                {/* Page error */}
                {pageView === "error" && (
                    <div style={{ color: "var(--red)", fontSize: 14 }}>{pageError}</div>
                )}

                {/* Main layout */}
                {pageView === "ready" && question && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

                        {/* ── Left: Question panel ─────────────────────────── */}
                        <div style={{
                            background: "var(--db-bg2)",
                            border: "1px solid var(--db-border2)",
                            borderRadius: 12,
                            padding: "24px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}>
                            {/* Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--db-text)", margin: 0 }}>
                                    {question.title}
                                </h1>
                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                    color: DIFFICULTY_COLOR[question.difficulty] ?? "var(--db-text2)",
                                    padding: "3px 10px",
                                    borderRadius: 20,
                                    border: `1px solid ${DIFFICULTY_COLOR[question.difficulty] ?? "var(--db-border2)"}22`,
                                    background: `${DIFFICULTY_COLOR[question.difficulty] ?? "var(--db-border2)"}11`,
                                }}>
                                    {question.difficulty}
                                </span>
                            </div>

                            {/* Description */}
                            <p style={{ fontSize: 14, color: "var(--db-text2)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                                {question.description}
                            </p>

                            {/* Input example */}
                            {question.inputExample && (
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--db-text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                        Input Example
                                    </p>
                                    <pre style={{
                                        background: "var(--db-bg3)",
                                        border: "1px solid var(--db-border2)",
                                        borderRadius: 8,
                                        padding: "10px 12px",
                                        fontSize: 13,
                                        color: "var(--db-text)",
                                        fontFamily: "'Fira Code', monospace",
                                        whiteSpace: "pre-wrap",
                                        margin: 0,
                                    }}>
                                        {question.inputExample}
                                    </pre>
                                </div>
                            )}

                            {/* Expected output */}
                            {question.expectedOutput && (
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--db-text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                        Expected Output
                                    </p>
                                    <pre style={{
                                        background: "var(--db-bg3)",
                                        border: "1px solid var(--db-border2)",
                                        borderRadius: 8,
                                        padding: "10px 12px",
                                        fontSize: 13,
                                        color: "var(--lime)",
                                        fontFamily: "'Fira Code', monospace",
                                        whiteSpace: "pre-wrap",
                                        margin: 0,
                                    }}>
                                        {question.expectedOutput}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* ── Right: Editor + execution ────────────────────── */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                            {/* Toolbar */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <LanguageSelector
                                    languages={languages}
                                    value={selectedLang}
                                    onChange={handleLanguageChange}
                                    disabled={isRunning}
                                />
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        onClick={handleReset}
                                        disabled={isRunning}
                                        title="Reset to starter template"
                                        style={{
                                            display: "flex", alignItems: "center", gap: 6,
                                            background: "transparent",
                                            border: "1px solid var(--db-border2)",
                                            borderRadius: 8, padding: "6px 12px",
                                            color: "var(--db-text2)", fontSize: 13,
                                            cursor: isRunning ? "not-allowed" : "pointer",
                                            opacity: isRunning ? 0.5 : 1,
                                        }}
                                    >
                                        <RotateCcw size={13} />
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleRun}
                                        disabled={isRunning}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 6,
                                            background: isRunning ? "rgba(var(--lime-rgb),0.15)" : "var(--accent)",
                                            border: "none",
                                            borderRadius: 8, padding: "6px 16px",
                                            color: isRunning ? "var(--accent)" : "#0C0C0C",
                                            fontSize: 13, fontWeight: 600,
                                            cursor: isRunning ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        {isRunning
                                            ? <><LoaderCircle size={13} className="animate-spin" /> Running…</>
                                            : <><Play size={13} /> Run</>
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Monaco editor */}
                            <div style={{
                                borderRadius: 10,
                                overflow: "hidden",
                                border: "1px solid var(--db-border2)",
                            }}>
                                <Editor
                                    height="400px"
                                    language={LANGUAGE_MAP[selectedLang] ?? "plaintext"}
                                    value={sourceCode}
                                    onChange={v => setSourceCode(v ?? "")}
                                    theme="vs-dark"
                                    options={{
                                        minimap:         { enabled: false },
                                        fontSize:        13,
                                        lineNumbers:     "on",
                                        scrollBeyondLastLine: false,
                                        readOnly:        isRunning,
                                        fontFamily:      "'Fira Code', 'Courier New', monospace",
                                        padding:         { top: 12 },
                                    }}
                                />
                            </div>

                            {/* Stdin (collapsible) */}
                            <div style={{
                                background: "var(--db-bg2)",
                                border: "1px solid var(--db-border2)",
                                borderRadius: 10,
                                overflow: "hidden",
                            }}>
                                <button
                                    onClick={() => setStdinOpen(o => !o)}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center",
                                        justifyContent: "space-between",
                                        background: "transparent", border: "none",
                                        padding: "10px 14px", cursor: "pointer",
                                        color: "var(--db-text2)", fontSize: 13,
                                    }}
                                >
                                    <span>Standard Input (stdin)</span>
                                    {stdinOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                                {stdinOpen && (
                                    <textarea
                                        value={stdin}
                                        onChange={e => setStdin(e.target.value)}
                                        disabled={isRunning}
                                        placeholder="Enter stdin here…"
                                        rows={4}
                                        style={{
                                            width: "100%", boxSizing: "border-box",
                                            background: "var(--db-bg3)",
                                            border: "none",
                                            borderTop: "1px solid var(--db-border2)",
                                            padding: "10px 14px",
                                            color: "var(--db-text)",
                                            fontSize: 13,
                                            fontFamily: "'Fira Code', monospace",
                                            resize: "vertical",
                                            outline: "none",
                                            opacity: isRunning ? 0.5 : 1,
                                        }}
                                    />
                                )}
                            </div>

                            {/* Execution result */}
                            <ExecutionResultPanel
                                viewState={execView}
                                result={execResult}
                                errorMessage={execError}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
