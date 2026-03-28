import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { UserButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "motion/react";
import {
    ChevronRight, ChevronLeft, Clock, Target, CheckCircle2,
    XCircle, LoaderCircle, Send, RotateCcw, Trophy,
} from "lucide-react";
import { StudentQuizService } from "../lib/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const OPTIONS = ["A", "B", "C", "D"];

const DIFFICULTY_STYLE = {
    easy:   { color: "#c8ff3e", bg: "rgba(200,255,62,0.08)", border: "rgba(200,255,62,0.2)" },
    medium: { color: "#ffb830", bg: "rgba(255,184,48,0.08)", border: "rgba(255,184,48,0.2)" },
    hard:   { color: "#ff5a5a", bg: "rgba(255,90,90,0.08)",  border: "rgba(255,90,90,0.2)"  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }) {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#8a8b8e" }}>
                <span>{current} of {total} answered</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#c8ff3e" }}>{pct}%</span>
            </div>
            <div style={{ height: 4, background: "#1e1f20", borderRadius: 2, overflow: "hidden" }}>
                <motion.div
                    style={{ height: "100%", background: "#c8ff3e", borderRadius: 2 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

function OptionButton({ label, text, selected, resultStyle, disabled, onSelect }) {
    let borderColor = "#2e2f30";
    let bgColor     = "transparent";
    let labelColor  = "#8a8b8e";
    let textColor   = "#8a8b8e";

    if (resultStyle === "correct") {
        borderColor = "rgba(200,255,62,0.5)"; bgColor = "rgba(200,255,62,0.08)";
        labelColor = "#c8ff3e"; textColor = "#e4e5e6";
    } else if (resultStyle === "wrong") {
        borderColor = "rgba(255,90,90,0.5)"; bgColor = "rgba(255,90,90,0.06)";
        labelColor = "#ff5a5a"; textColor = "#8a8b8e";
    } else if (selected) {
        borderColor = "rgba(200,255,62,0.5)"; bgColor = "rgba(200,255,62,0.06)";
        labelColor = "#c8ff3e"; textColor = "#e4e5e6";
    }

    return (
        <button
            disabled={disabled}
            onClick={onSelect}
            style={{
                width: "100%", display: "flex", alignItems: "flex-start", gap: 12,
                background: bgColor, border: `1px solid ${borderColor}`,
                borderRadius: 10, padding: "12px 16px",
                cursor: disabled ? "default" : "pointer",
                transition: "all 0.15s", textAlign: "left",
            }}
            onMouseEnter={e => { if (!disabled && !selected && !resultStyle) e.currentTarget.style.borderColor = "rgba(200,255,62,0.25)"; }}
            onMouseLeave={e => { if (!disabled && !selected && !resultStyle) e.currentTarget.style.borderColor = "#2e2f30"; }}
        >
            <span style={{
                flexShrink: 0, width: 24, height: 24, borderRadius: 6,
                border: `1px solid ${borderColor}`,
                background: selected || resultStyle ? bgColor : "#1a1b1c",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: labelColor,
                fontFamily: "'JetBrains Mono', monospace",
            }}>{label}</span>
            <span style={{ fontSize: 14, color: textColor, lineHeight: 1.5, paddingTop: 3, flex: 1 }}>{text}</span>
            {resultStyle === "correct" && <CheckCircle2 size={16} color="#c8ff3e" style={{ marginLeft: "auto", flexShrink: 0, marginTop: 3 }} />}
            {resultStyle === "wrong"   && <XCircle      size={16} color="#ff5a5a" style={{ marginLeft: "auto", flexShrink: 0, marginTop: 3 }} />}
        </button>
    );
}

function QuestionCard({ question, index, total, selectedOption, onSelect, questionResult, showResults }) {
    const diffStyle = DIFFICULTY_STYLE[question.difficulty] ?? DIFFICULTY_STYLE.easy;
    const optionTexts = { A: question.optionA, B: question.optionB, C: question.optionC, D: question.optionD };

    return (
        <motion.div
            key={question.questionId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{
                background: "#131415", border: "1px solid #252627",
                borderRadius: 16, padding: "28px",
                display: "flex", flexDirection: "column", gap: 20,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#4a4b4e", fontFamily: "'JetBrains Mono', monospace" }}>
                    Q{index + 1} / {total}
                </span>
                <div style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 20,
                    color: diffStyle.color, background: diffStyle.bg, border: `1px solid ${diffStyle.border}`,
                }}>
                    {question.difficulty}
                </div>
            </div>

            <p style={{ fontSize: 16, color: "#e4e5e6", lineHeight: 1.65, fontWeight: 500 }}>
                {question.questionText}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {OPTIONS.map(opt => {
                    let resultStyle = null;
                    if (showResults && questionResult) {
                        if (opt === questionResult.correctOption) resultStyle = "correct";
                        else if (opt === questionResult.selectedOption && !questionResult.isCorrect) resultStyle = "wrong";
                    }
                    return (
                        <OptionButton
                            key={opt}
                            label={opt}
                            text={optionTexts[opt]}
                            selected={selectedOption === opt}
                            resultStyle={resultStyle}
                            disabled={showResults}
                            onSelect={() => onSelect(opt)}
                        />
                    );
                })}
            </div>

            {showResults && questionResult?.explanation && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: "rgba(77,166,255,0.06)", border: "1px solid rgba(77,166,255,0.2)",
                        borderRadius: 10, padding: "12px 16px",
                        fontSize: 13, color: "#b0d4ff", lineHeight: 1.6,
                    }}
                >
                    <span style={{ color: "#4da6ff", fontWeight: 600, marginRight: 6 }}>Explanation:</span>
                    {questionResult.explanation}
                </motion.div>
            )}
        </motion.div>
    );
}

function ResultsSummary({ result, quiz, onRetry }) {
    const passed = result.passed;
    return (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
                background: "#131415", border: `1px solid ${passed ? "rgba(200,255,62,0.3)" : "rgba(255,90,90,0.3)"}`,
                borderRadius: 16, padding: "32px 28px", textAlign: "center",
            }}>
                <Trophy size={32} color={passed ? "#c8ff3e" : "#ff5a5a"} style={{ margin: "0 auto 12px" }} />
                <div style={{
                    fontSize: 56, fontWeight: 700, lineHeight: 1,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: passed ? "#c8ff3e" : "#ff5a5a", marginBottom: 8,
                }}>
                    {result.score}%
                </div>
                <p style={{ fontSize: 16, color: "#e4e5e6", fontWeight: 600, marginBottom: 4 }}>
                    {passed ? "Quiz Passed!" : "Quiz Failed"}
                </p>
                <p style={{ fontSize: 13, color: "#8a8b8e" }}>
                    {result.correctCount} / {result.totalQuestions} correct · Pass score: {quiz.passScore}%
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 12, color: "#4a4b4e", textTransform: "uppercase", letterSpacing: "1.2px" }}>
                    Question Breakdown
                </p>
                {result.results.map((qr, i) => (
                    <div key={qr.questionId} style={{
                        background: "#131415", border: "1px solid #252627",
                        borderRadius: 12, padding: "14px 16px",
                        display: "flex", alignItems: "center", gap: 12,
                    }}>
                        {qr.isCorrect
                            ? <CheckCircle2 size={18} color="#c8ff3e" style={{ flexShrink: 0 }} />
                            : <XCircle      size={18} color="#ff5a5a" style={{ flexShrink: 0 }} />
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, color: "#e4e5e6", marginBottom: 2 }}>Question {i + 1}</p>
                            {qr.explanation && (
                                <p style={{ fontSize: 12, color: "#8a8b8e", lineHeight: 1.5 }}>{qr.explanation}</p>
                            )}
                        </div>
                        <span style={{ fontSize: 11, color: qr.isCorrect ? "#c8ff3e" : "#ff5a5a", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                            {qr.isCorrect ? "✓ Correct" : `✗ ${qr.selectedOption} → ${qr.correctOption}`}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
                <button onClick={onRetry} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: "rgba(200,255,62,0.1)", border: "1px solid rgba(200,255,62,0.25)",
                    color: "#c8ff3e", cursor: "pointer",
                }}>
                    <RotateCcw size={14} /> Retry Quiz
                </button>
                <Link to="/quizzes" style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: "#1a1b1c", border: "1px solid #2e2f30",
                    color: "#8a8b8e", textDecoration: "none",
                }}>
                    All Quizzes
                </Link>
            </div>
        </motion.div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function QuizPage() {
    const { quizId } = useParams();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [quiz, setQuiz]           = useState(null);
    const [questions, setQuestions] = useState([]);
    const [view, setView]           = useState("loading");   // loading | error | quiz | submitting | submit-error | results
    const [error, setError]         = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers]     = useState({});          // questionId → "A"|"B"|"C"|"D"
    const [result, setResult]       = useState(null);

    const load = useCallback(async () => {
        let isMounted = true;
        setView("loading");
        setError("");
        setAnswers({});
        setCurrentIndex(0);
        setResult(null);

        try {
            const [quizRes, questionsRes] = await Promise.all([
                StudentQuizService.getActiveQuizById(Number(quizId), getToken),
                StudentQuizService.getQuizQuestions(Number(quizId), getToken),
            ]);
            if (!isMounted) return;
            setQuiz(quizRes.data);
            setQuestions(questionsRes.data ?? []);
            setView("quiz");
        } catch (err) {
            if (!isMounted) return;
            const msg = err instanceof Error ? err.message : "Failed to load quiz.";
            if (msg === "UNAUTHORIZED") { navigate("/login"); return; }
            setError(msg);
            setView("error");
        }
        return () => { isMounted = false; };
    }, [quizId, getToken, navigate]);

    useEffect(() => { load(); }, [load]);

    async function handleSubmit() {
        setView("submitting");
        const payload = {
            answers: questions.map(q => ({
                questionId: q.questionId,
                selectedOption: answers[q.questionId] ?? "A",
            })),
        };
        try {
            const res = await StudentQuizService.submitAttempt(Number(quizId), payload, getToken);
            setResult(res.data);
            setView("results");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Submission failed.");
            setView("submit-error");
        }
    }

    const answeredCount = Object.keys(answers).length;
    const allAnswered   = answeredCount === questions.length && questions.length > 0;
    const currentQ      = questions[currentIndex];

    return (
        <div style={{ minHeight: "100vh", background: "#0d0e0f" }}>
            {/* Header */}
            <header style={{
                position: "sticky", top: 0, zIndex: 40, height: 56,
                display: "flex", alignItems: "center", padding: "0 24px", gap: 8,
                background: "rgba(13,14,15,0.85)", backdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}>
                <Link to="/" style={{ textDecoration: "none" }}>
                    <img src="/BIGO.png" alt="BigO" style={{ height: 44, width: "auto" }} />
                </Link>
                <div style={{ width: 1, height: 16, background: "#2e2f30", margin: "0 4px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#8a8b8e" }}>
                    <Link to="/quizzes" style={{ color: "#8a8b8e", textDecoration: "none" }}>Quizzes</Link>
                    <ChevronRight size={14} />
                    <span style={{ color: "#e4e5e6" }}>{quiz?.title ?? "Quiz"}</span>
                </div>
                <div style={{ marginLeft: "auto" }}>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            <main style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px 60px" }}>

                {/* Loading */}
                {view === "loading" && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#8a8b8e", fontSize: 14, minHeight: 240 }}>
                        <LoaderCircle size={16} color="#c8ff3e" className="animate-spin" />
                        Loading quiz…
                    </div>
                )}

                {/* Load error */}
                {view === "error" && (
                    <div style={{
                        background: "rgba(255,90,90,0.06)", border: "1px solid rgba(255,90,90,0.2)",
                        borderRadius: 12, padding: "16px 20px", color: "#ff9a9a", fontSize: 14,
                    }}>
                        {error}
                    </div>
                )}

                {/* Submit error */}
                {view === "submit-error" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{
                            background: "rgba(255,90,90,0.06)", border: "1px solid rgba(255,90,90,0.2)",
                            borderRadius: 12, padding: "16px 20px", color: "#ff9a9a", fontSize: 14,
                        }}>
                            Submission failed — the grading endpoint is not yet available.
                        </div>
                        <button onClick={() => setView("quiz")} style={{
                            padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                            background: "#131415", border: "1px solid #2e2f30", color: "#8a8b8e",
                            cursor: "pointer", alignSelf: "flex-start",
                        }}>
                            Back to Quiz
                        </button>
                    </motion.div>
                )}

                {/* Quiz player */}
                {(view === "quiz" || view === "submitting") && quiz && currentQ && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Quiz meta */}
                        <div>
                            <p style={{ fontSize: 11, color: "#4a4b4e", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                                Quiz
                            </p>
                            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e4e5e6", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.3px", marginBottom: 6 }}>
                                {quiz.title}
                            </h1>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                {quiz.timeLimitMins && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8a8b8e" }}>
                                        <Clock size={12} /> {quiz.timeLimitMins} min
                                    </span>
                                )}
                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8a8b8e" }}>
                                    <Target size={12} /> Pass: {quiz.passScore}%
                                </span>
                            </div>
                        </div>

                        <ProgressBar current={answeredCount} total={questions.length} />

                        <AnimatePresence mode="wait">
                            <QuestionCard
                                key={currentQ.questionId}
                                question={currentQ}
                                index={currentIndex}
                                total={questions.length}
                                selectedOption={answers[currentQ.questionId]}
                                onSelect={(opt) => setAnswers(prev => ({ ...prev, [currentQ.questionId]: opt }))}
                                questionResult={null}
                                showResults={false}
                            />
                        </AnimatePresence>

                        {/* Navigation */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                            <button
                                disabled={currentIndex === 0}
                                onClick={() => setCurrentIndex(i => i - 1)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "10px 16px", borderRadius: 8, fontSize: 13,
                                    background: "#131415", border: "1px solid #2e2f30",
                                    color: currentIndex === 0 ? "#3a3b3c" : "#8a8b8e",
                                    cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                                }}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>

                            {/* Dot nav */}
                            <div style={{ display: "flex", gap: 6 }}>
                                {questions.map((q, i) => (
                                    <button key={q.questionId} onClick={() => setCurrentIndex(i)} style={{
                                        width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer",
                                        background: i === currentIndex ? "#c8ff3e" : answers[q.questionId] ? "rgba(200,255,62,0.3)" : "#2e2f30",
                                    }} />
                                ))}
                            </div>

                            {currentIndex < questions.length - 1 ? (
                                <button onClick={() => setCurrentIndex(i => i + 1)} style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "10px 16px", borderRadius: 8, fontSize: 13,
                                    background: "#131415", border: "1px solid #2e2f30",
                                    color: "#8a8b8e", cursor: "pointer",
                                }}>
                                    Next <ChevronRight size={14} />
                                </button>
                            ) : (
                                <button
                                    disabled={!allAnswered || view === "submitting"}
                                    onClick={handleSubmit}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                                        background: allAnswered ? "rgba(200,255,62,0.12)" : "#1a1b1c",
                                        border: `1px solid ${allAnswered ? "rgba(200,255,62,0.35)" : "#2e2f30"}`,
                                        color: allAnswered ? "#c8ff3e" : "#3a3b3c",
                                        cursor: allAnswered && view !== "submitting" ? "pointer" : "not-allowed",
                                    }}
                                >
                                    {view === "submitting"
                                        ? <><LoaderCircle size={14} className="animate-spin" /> Submitting…</>
                                        : <><Send size={14} /> Submit</>
                                    }
                                </button>
                            )}
                        </div>

                        {!allAnswered && (
                            <p style={{ fontSize: 12, color: "#4a4b4e", textAlign: "center" }}>
                                Answer all {questions.length} questions to enable submit.
                            </p>
                        )}
                    </motion.div>
                )}

                {/* Results */}
                {view === "results" && result && quiz && (
                    <ResultsSummary result={result} quiz={quiz} onRetry={load} />
                )}
            </main>
        </div>
    );
}
