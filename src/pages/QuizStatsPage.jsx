import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { BarChart3, Users, TrendingUp, AlertCircle, ArrowLeft, LoaderCircle } from "lucide-react";
import { QuizService, AlgorithmService } from "../lib/api";
import { useRole } from "../context/RoleContext";

export default function QuizStatsPage() {
    const { quizId } = useParams();
    const { getToken } = useAuth();
    const role = useRole();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [algorithm, setAlgorithm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (role !== "Admin") return;

        let isMounted = true;

        async function load() {
            try {
                setLoading(true);
                setError("");

                const id = Number.parseInt(quizId, 10);
                if (isNaN(id)) {
                    setError("Invalid quiz ID");
                    setLoading(false);
                    return;
                }

                const [statsRes, quizRes] = await Promise.all([
                    QuizService.getStats(id, getToken),
                    QuizService.getById(id, getToken),
                ]);

                if (!isMounted) return;

                setStats(statsRes.data);
                setQuiz(quizRes.data);

                if (quizRes.data?.algorithmId) {
                    try {
                        const algoRes = await AlgorithmService.getById(quizRes.data.algorithmId, getToken);
                        if (isMounted) {
                            setAlgorithm(algoRes.data);
                        }
                    } catch (err) {
                        console.error("Failed to load algorithm:", err);
                    }
                }
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Failed to load quiz stats");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();
        return () => { isMounted = false; };
    }, [quizId, getToken, role]);

    if (role !== "Admin") {
        return (
            <div style={{
                minHeight: "100vh",
                background: "#0d0e0f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 12,
            }}>
                <AlertCircle size={40} color="#ff5a5a" />
                <p style={{ color: "#ff9a9a", fontSize: 15 }}>
                    Admin access required.
                </p>
                <Link to="/dashboard" style={{ color: "#c8ff3e", fontSize: 13, textDecoration: "none" }}>
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <main style={{ maxWidth: 1160, margin: "0 auto", padding: "36px 24px 60px" }}>
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate("/admin/quizzes")}
                    style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        marginBottom: 24,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--primary)",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to Quizzes
                </motion.button>

                {loading ? (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        color: "var(--text-secondary)",
                        fontSize: 14,
                        minHeight: 300,
                    }}>
                        <LoaderCircle size={16} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
                        Loading quiz statistics...
                    </div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            background: "rgba(255,90,90,0.06)",
                            border: "1px solid rgba(255,90,90,0.2)",
                            borderRadius: 12,
                            padding: "20px",
                            color: "#ff9a9a",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <AlertCircle size={20} style={{ flexShrink: 0 }} />
                        {error}
                    </motion.div>
                ) : !quiz ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--db-border)",
                            borderRadius: 12,
                            padding: "20px",
                            color: "var(--text-secondary)",
                            fontSize: 14,
                        }}
                    >
                        Quiz not found
                    </motion.div>
                ) : (
                    <>
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginBottom: 32,
                            }}
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent" style={{ marginBottom: 8 }}>
                                Quiz Statistics
                            </p>
                            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl" style={{ marginBottom: 8 }}>
                                {quiz.title}
                            </h1>
                            {algorithm && (
                                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                                    Algorithm: <span style={{ color: "var(--primary)" }}>{algorithm.name}</span>
                                </p>
                            )}
                        </motion.div>

                        {/* Stats Cards */}
                        {stats && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                    gap: 20,
                                    marginBottom: 32,
                                }}
                            >
                                {/* Attempt Count Card */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    style={{
                                        background: "linear-gradient(135deg, rgba(200,255,62,0.08), rgba(200,255,62,0.03))",
                                        border: "1px solid rgba(200,255,62,0.2)",
                                        borderRadius: 12,
                                        padding: 24,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 16,
                                    }}
                                >
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            background: "rgba(200,255,62,0.15)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}>
                                            <Users size={20} color="#c8ff3e" />
                                        </div>
                                        <span style={{
                                            fontSize: 12,
                                            color: "var(--text-secondary)",
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5,
                                            fontWeight: 600,
                                        }}>
                                            Total Attempts
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: 32,
                                        fontWeight: 700,
                                        color: "#c8ff3e",
                                    }}>
                                        {stats.attemptCount}
                                    </div>
                                    <p style={{
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                    }}>
                                        Unique student attempts at this quiz
                                    </p>
                                </motion.div>

                                {/* Average Score Card */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15 }}
                                    style={{
                                        background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.03))",
                                        border: "1px solid rgba(59,130,246,0.2)",
                                        borderRadius: 12,
                                        padding: 24,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 16,
                                    }}
                                >
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            background: "rgba(59,130,246,0.15)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}>
                                            <BarChart3 size={20} color="#3b82f6" />
                                        </div>
                                        <span style={{
                                            fontSize: 12,
                                            color: "var(--text-secondary)",
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5,
                                            fontWeight: 600,
                                        }}>
                                            Average Score
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: 32,
                                        fontWeight: 700,
                                        color: "#3b82f6",
                                    }}>
                                        {stats.averageScore.toFixed(1)}%
                                    </div>
                                    <p style={{
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                    }}>
                                        Mean score across all attempts
                                    </p>
                                </motion.div>

                                {/* Pass Rate Card */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    style={{
                                        background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
                                        border: "1px solid rgba(34,197,94,0.2)",
                                        borderRadius: 12,
                                        padding: 24,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 16,
                                    }}
                                >
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            background: "rgba(34,197,94,0.15)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}>
                                            <TrendingUp size={20} color="#22c55e" />
                                        </div>
                                        <span style={{
                                            fontSize: 12,
                                            color: "var(--text-secondary)",
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5,
                                            fontWeight: 600,
                                        }}>
                                            Pass Rate
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: 32,
                                        fontWeight: 700,
                                        color: "#22c55e",
                                    }}>
                                        {stats.passRate.toFixed(1)}%
                                    </div>
                                    <p style={{
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                    }}>
                                        Percentage of students who passed
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Additional Quiz Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--db-border)",
                                borderRadius: 12,
                                padding: 24,
                            }}
                        >
                            <h3 style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                marginBottom: 16,
                            }}>
                                Quiz Information
                            </h3>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: 16,
                            }}>
                                <div>
                                    <p style={{
                                        fontSize: 11,
                                        color: "var(--text-secondary)",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        marginBottom: 4,
                                    }}>
                                        Status
                                    </p>
                                    <p style={{
                                        fontSize: 13,
                                        color: quiz.isActive ? "var(--primary)" : "var(--text-secondary)",
                                        fontWeight: 600,
                                    }}>
                                        {quiz.isActive ? "Active" : "Inactive"}
                                    </p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: 11,
                                        color: "var(--text-secondary)",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        marginBottom: 4,
                                    }}>
                                        Pass Score
                                    </p>
                                    <p style={{
                                        fontSize: 13,
                                        color: "var(--text-primary)",
                                        fontWeight: 600,
                                    }}>
                                        {quiz.passScore}%
                                    </p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: 11,
                                        color: "var(--text-secondary)",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        marginBottom: 4,
                                    }}>
                                        Time Limit
                                    </p>
                                    <p style={{
                                        fontSize: 13,
                                        color: "var(--text-primary)",
                                        fontWeight: 600,
                                    }}>
                                        {quiz.timeLimitMins ? `${quiz.timeLimitMins} minutes` : "No limit"}
                                    </p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: 11,
                                        color: "var(--text-secondary)",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        marginBottom: 4,
                                    }}>
                                        Created
                                    </p>
                                    <p style={{
                                        fontSize: 13,
                                        color: "var(--text-primary)",
                                        fontWeight: 600,
                                    }}>
                                        {new Date(quiz.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </main>
        </div>
    );
}
