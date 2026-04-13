import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { Clock, Target, PlayCircle, LoaderCircle, BookOpen } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { StudentQuizService } from "../lib/api";

function QuizCard({ quiz, onStart }) {
    return (
        <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="group algo-card relative overflow-hidden rounded-3xl border p-6 text-left"
            style={{
                background: "var(--surface)",
                border: "1px solid var(--db-border)",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                cursor: "pointer",
            }}
            onClick={() => onStart(quiz.quizId)}
        >
            <div className="absolute inset-0 bg-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex h-full flex-col gap-4">
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div
                    style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: "rgba(var(--accent-rgb),0.1)",
                        border: "1px solid rgba(var(--accent-rgb),0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <BookOpen size={20} color="var(--accent)" />
                </div>
                {quiz.timeLimitMins && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 11,
                        color: "var(--db-text2)",
                        background: "var(--db-bg3)",
                        borderRadius: 999,
                        padding: "4px 10px",
                        border: "1px solid var(--db-border)",
                    }}>
                        <Clock size={10} />
                        {quiz.timeLimitMins} min
                    </div>
                )}
            </div>

            {/* Title + description */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h3
                        className="text-2xl font-bold tracking-tight transition-colors duration-300 group-hover:text-accent"
                        style={{ color: "var(--db-text)" }}
                    >
                    {quiz.title}
                </h3>
                {quiz.description && (
                     <p className="text-sm leading-6 text-text-secondary">
                        {quiz.description}
                    </p>
                )}
            </div>

            {/* Meta row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 11,
                    color: "var(--accent)",
                    background: "rgba(var(--accent-rgb),0.1)",
                    borderRadius: 999,
                    padding: "4px 10px",
                    border: "1px solid rgba(var(--accent-rgb),0.2)",
                }}>
                    <Target size={10} />
                    Pass: {quiz.passScore}%
                </div>
            </div>

            {/* Start button */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderTop: "1px solid var(--db-border)", paddingTop: 14, marginTop: 2,
            }}>
                <span style={{ fontSize: 11, color: "var(--db-text3)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                    Start Quiz
                </span>
                <div
                    className="flex items-center gap-1.5 text-sm font-medium transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
                    style={{ color: "var(--db-text)" }}
                >
                    <PlayCircle size={16} />
                    Play
                </div>
            </div>
            </div>
        </motion.button>
    );
}

export default function QuizzesPage() {
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadQuizzes() {
            try {
                setLoading(true);
                setError("");
                const response = await StudentQuizService.getActiveQuizzes(getToken);
                if (!isMounted) return;
                setQuizzes(Array.isArray(response?.data) ? response.data : []);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Failed to load quizzes.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadQuizzes();
        return () => { isMounted = false; };
    }, [getToken]);

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <DashboardNav />

            {/* Main */}
            <main style={{ maxWidth: 1160, margin: "0 auto", padding: "36px 24px 60px" }}>
                {/* Page title */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                        Student Portal
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                        Available <span style={{ color: "var(--primary)" }}>Quizzes</span>
                    </h1>
                    <p className="mt-4 text-base leading-7 text-text-secondary">
                        Test your knowledge on algorithms. Pass score and time limit are shown on each card.
                    </p>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 10, color: "var(--text-secondary)", fontSize: 14,
                        minHeight: 200,
                    }}>
                        <LoaderCircle size={16} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
                        Loading quizzes...
                    </div>
                ) : error ? (
                    <div style={{
                        background: "rgba(255,90,90,0.06)", border: "1px solid rgba(255,90,90,0.2)",
                        borderRadius: 12, padding: "16px 20px", color: "#ff9a9a", fontSize: 14,
                    }}>
                        {error}
                    </div>
                ) : quizzes.length === 0 ? (
                    <div style={{
                        background: "var(--surface)", border: "1px dashed var(--db-border2)",
                        borderRadius: 16, padding: "48px 24px",
                        textAlign: "center", color: "var(--text-tertiary)", fontSize: 14,
                    }}>
                        No quizzes are available yet.
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: 18,
                        alignItems: "start",
                    }}>
                        {quizzes.map((quiz, i) => (
                            <motion.div
                                key={quiz.quizId}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <QuizCard quiz={quiz} onStart={(id) => navigate(`/quiz/${id}`)} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

