import { useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/clerk-react"
import { motion } from "motion/react"
import { BookOpen, Calendar, Zap, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react"
import DashboardNav from "@/components/dashboard/DashboardNav"
import type { UserAttemptHistory } from "@/lib/api"
import { StudentService } from "@/lib/api"

export default function StudentAttemptHistoryPage() {
    const { getToken } = useAuth()
    const { user: clerkUser } = useUser()
    const [attempts, setAttempts] = useState<UserAttemptHistory[]>([])
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalAttempts, setTotalAttempts] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Extract numeric user ID from Clerk user ID
    const userId = clerkUser?.externalId ? parseInt(clerkUser.externalId, 10) : null

    useEffect(() => {
        if (!userId) return

        let isMounted = true

        async function loadAttempts() {
            try {
                setLoading(true)
                setError("")

                const response = await StudentService.getAttemptHistory(userId!, page, pageSize, getToken)
                if (isMounted) {
                    setAttempts(response.data.attempts)
                    setTotalPages(response.data.totalPages)
                    setTotalAttempts(response.data.totalAttempts)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load attempt history")
                    console.error("Error loading attempts:", err)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadAttempts()
        return () => {
            isMounted = false
        }
    }, [userId, page, pageSize, getToken])

    if (!userId) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "#0d0e0f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ff5a5a",
            }}>
                Loading user information...
            </div>
        )
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0d0e0f" }}>
            <DashboardNav />

            <main style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px 60px" }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 32 }}
                >
                    <p style={{
                        fontSize: 11,
                        color: "#4a4b4e",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        fontFamily: "'Poppins', sans-serif",
                        marginBottom: 8,
                    }}>
                        My Progress
                    </p>
                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#e4e5e6",
                        fontFamily: "'Poppins', sans-serif",
                        letterSpacing: "-0.5px",
                        lineHeight: 1.1,
                        marginBottom: 8,
                    }}>
                        Quiz <span style={{ color: "#c8ff3e" }}>Attempt History</span>
                    </h1>
                    <p style={{ fontSize: 14, color: "#8a8b8e" }}>
                        {totalAttempts === 0
                            ? "No attempts yet. Take a quiz to get started!"
                            : `${totalAttempts} attempt${totalAttempts !== 1 ? "s" : ""} total`}
                    </p>
                </motion.div>

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            background: "rgba(255,90,90,0.06)",
                            border: "1px solid rgba(255,90,90,0.2)",
                            borderRadius: 12,
                            padding: "16px 20px",
                            color: "#ff9a9a",
                            fontSize: 14,
                            marginBottom: 16,
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        color: "#8a8b8e",
                        fontSize: 14,
                        minHeight: 300,
                    }}>
                        <LoaderCircle size={16} color="#c8ff3e" style={{ animation: "spin 1s linear infinite" }} />
                        Loading your attempts...
                    </div>
                ) : attempts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            background: "#131415",
                            border: "1px dashed #2e2f30",
                            borderRadius: 16,
                            padding: "48px 24px",
                            textAlign: "center",
                            color: "#4a4b4e",
                            fontSize: 14,
                        }}
                    >
                        No quiz attempts yet. Visit the quizzes section to get started!
                    </motion.div>
                ) : (
                    <>
                        {/* Attempts List */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: "#131415",
                                border: "1px solid #252627",
                                borderRadius: 16,
                                overflow: "hidden",
                                marginBottom: 24,
                            }}
                        >
                            {attempts.map((attempt, index) => (
                                <motion.div
                                    key={attempt.attemptId}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{
                                        padding: "16px 20px",
                                        borderBottom: index < attempts.length - 1 ? "1px solid #1e1f20" : "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 16,
                                        justifyContent: "space-between",
                                        flexWrap: "wrap",
                                    }}
                                    whileHover={{ background: "#1a1b1c" }}
                                >
                                    {/* Left: Quiz Info */}
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                            <div style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                background: "rgba(200,255,62,0.08)",
                                                border: "1px solid rgba(200,255,62,0.15)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}>
                                                <BookOpen size={16} color="#c8ff3e" />
                                            </div>
                                            <div>
                                                <p style={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: "#e4e5e6",
                                                    margin: 0,
                                                }}>
                                                    {attempt.quizTitle}
                                                </p>
                                                <p style={{
                                                    fontSize: 12,
                                                    color: "#8a8b8e",
                                                    margin: "4px 0 0 0",
                                                }}>
                                                    {attempt.algorithmName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Score */}
                                    <div style={{ textAlign: "center", minWidth: 100 }}>
                                        <div style={{
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: attempt.passed ? "#22c55e" : "#fbbf24",
                                            fontFamily: "'Poppins', sans-serif",
                                        }}>
                                            {attempt.score}%
                                        </div>
                                        <div style={{
                                            fontSize: 11,
                                            color: "#8a8b8e",
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5,
                                            marginTop: 4,
                                        }}>
                                            {attempt.passed ? "✓ Passed" : "↻ Retake"}
                                        </div>
                                    </div>

                                    {/* Right: XP & Date */}
                                    <div style={{ display: "flex", gap: 16, alignItems: "center", minWidth: 200 }}>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                color: "#c8ff3e",
                                                fontWeight: 600,
                                                fontSize: 13,
                                                marginBottom: 4,
                                            }}>
                                                <Zap size={14} />
                                                +{attempt.xpEarned} XP
                                            </div>
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                color: "#8a8b8e",
                                                fontSize: 12,
                                            }}>
                                                <Calendar size={12} />
                                                {new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "16px 20px",
                                    background: "#131415",
                                    border: "1px solid #252627",
                                    borderRadius: 12,
                                }}
                            >
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    style={{
                                        background: page === 1 ? "transparent" : "rgba(200,255,62,0.1)",
                                        border: page === 1 ? "1px solid #2e2f30" : "1px solid rgba(200,255,62,0.3)",
                                        color: page === 1 ? "#636467" : "#c8ff3e",
                                        borderRadius: 8,
                                        padding: "8px 12px",
                                        cursor: page === 1 ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        opacity: page === 1 ? 0.5 : 1,
                                    }}
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <span style={{
                                    color: "#8a8b8e",
                                    fontSize: 13,
                                }}>
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    style={{
                                        background: page === totalPages ? "transparent" : "rgba(200,255,62,0.1)",
                                        border: page === totalPages ? "1px solid #2e2f30" : "1px solid rgba(200,255,62,0.3)",
                                        color: page === totalPages ? "#636467" : "#c8ff3e",
                                        borderRadius: 8,
                                        padding: "8px 12px",
                                        cursor: page === totalPages ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        opacity: page === totalPages ? 0.5 : 1,
                                    }}
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </motion.div>
                        )}
                    </>
                )}
            </main>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
