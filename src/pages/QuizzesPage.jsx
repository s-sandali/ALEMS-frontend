import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { Clock, Target, PlayCircle, LoaderCircle, BookOpen } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { StudentQuizService } from "../lib/api";

const DIFFICULTY_COLORS = {
    easy: { color: "#c8ff3e", bg: "rgba(200,255,62,0.08)", border: "rgba(200,255,62,0.2)" },
    medium: { color: "#ffb830", bg: "rgba(255,184,48,0.08)", border: "rgba(255,184,48,0.2)" },
    hard: { color: "#ff5a5a", bg: "rgba(255,90,90,0.08)", border: "rgba(255,90,90,0.2)" },
};

function QuizCard({ quiz, onStart }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: "#131415",
                border: "1px solid #252627",
                borderRadius: 16,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                transition: "border-color 0.2s",
                cursor: "pointer",
            }}
            whileHover={{ borderColor: "rgba(200,255,62,0.3)" }}
            onClick={() => onStart(quiz.quizId)}
        >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div
                    style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: "rgba(200,255,62,0.1)",
                        border: "1px solid rgba(200,255,62,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <BookOpen size={18} color="#c8ff3e" />
                </div>
                {quiz.timeLimitMins && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 11, color: "#8a8b8e",
                        background: "#1a1b1c", borderRadius: 20,
                        padding: "3px 10px", border: "1px solid #252627",
                    }}>
                        <Clock size={10} />
                        {quiz.timeLimitMins} min
                    </div>
                )}
            </div>

            {/* Title + description */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
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
                    fontSize: 11, color: "#c8ff3e",
                    background: "rgba(200,255,62,0.08)", borderRadius: 20,
                    padding: "3px 10px", border: "1px solid rgba(200,255,62,0.2)",
                }}>
                    <Target size={10} />
                    Pass: {quiz.passScore}%
                </div>
            </div>

            {/* Start button */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderTop: "1px solid #252627", paddingTop: 14, marginTop: 4,
            }}>
                <span style={{ fontSize: 11, color: "#4a4b4e", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                    Start Quiz
                </span>
                <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    color: "#c8ff3e", fontSize: 13, fontWeight: 600,
                }}>
                    <PlayCircle size={16} />
                    Play
                </div>
            </div>
        </motion.div>
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
        <div style={{ minHeight: "100vh", background: "#0d0e0f" }}>
            <DashboardNav />

            {/* Main */}
            <main style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px 60px" }}>
                {/* Page title */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                        Student Portal
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                        Available <span style={{ color: "#c8ff3e" }}>Quizzes</span>
                    </h1>
                    <p className="mt-4 text-base leading-7 text-text-secondary">
                        Test your knowledge on algorithms. Pass score and time limit are shown on each card.
                    </p>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 10, color: "#8a8b8e", fontSize: 14,
                        minHeight: 200,
                    }}>
                        <LoaderCircle size={16} color="#c8ff3e" style={{ animation: "spin 1s linear infinite" }} />
                        Loading quizzes…
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
                        background: "#131415", border: "1px dashed #2e2f30",
                        borderRadius: 16, padding: "48px 24px",
                        textAlign: "center", color: "#4a4b4e", fontSize: 14,
                    }}>
                        No quizzes are available yet.
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 16,
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
