import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { UserButton } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { BookOpen, LoaderCircle, ShieldAlert, Plus, Edit2, Trash2 } from "lucide-react";
import { QuizService, AlgorithmService } from "../lib/api";
import { useRole } from "../context/RoleContext";

export default function AdminQuizListPage() {
    const { getToken } = useAuth();
    const role = useRole();
    const navigate = useNavigate();

    const [quizzes, setQuizzes]       = useState([]);
    const [algoMap, setAlgoMap]       = useState({});   // algorithmId → name
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (role !== "Admin") return;

        let isMounted = true;

        async function load() {
            try {
                setLoading(true);
                setError("");

                // Fetch quizzes and algorithms in parallel
                const [quizRes, algoRes] = await Promise.all([
                    QuizService.getAll(getToken),
                    AlgorithmService.getAll(getToken),
                ]);

                if (!isMounted) return;

                // Build lookup map: algorithmId → name
                const map = {};
                (algoRes?.data ?? []).forEach((a) => {
                    map[a.algorithmId] = a.name;
                });

                setAlgoMap(map);
                setQuizzes(Array.isArray(quizRes?.data) ? quizRes.data : []);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Failed to load quizzes.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();
        return () => { isMounted = false; };
    }, [getToken, role]);

    async function handleDelete(quizId) {
        if (!window.confirm("Delete this quiz? All its questions will also be removed.")) return;
        setDeletingId(quizId);
        try {
            await QuizService.delete(quizId, getToken);
            setQuizzes(prev => prev.filter(q => q.quizId !== quizId));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete quiz.");
        } finally {
            setDeletingId(null);
        }
    }

    // Access denied for non-admins
    if (role !== "Admin") {
        return (
            <div style={{
                minHeight: "100vh", background: "#0d0e0f",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 12,
            }}>
                <ShieldAlert size={40} color="#ff5a5a" />
                <p style={{ color: "#ff9a9a", fontSize: 15 }}>
                    Admin access required.
                </p>
                <Link to="/dashboard" style={{ color: "#c8ff3e", fontSize: 13, textDecoration: "none" }}>
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0d0e0f" }}>
            {/* Header */}
            <header style={{
                position: "sticky", top: 0, zIndex: 40,
                height: 56, display: "flex", alignItems: "center",
                padding: "0 24px", gap: 8,
                background: "rgba(13,14,15,0.85)",
                backdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}>
                <Link to="/" style={{ textDecoration: "none" }}>
                    <img src="/BIGO.png" alt="BigO" style={{ height: 44, width: "auto" }} />
                </Link>

                <div style={{ width: 1, height: 16, background: "#2e2f30", margin: "0 4px" }} />

                <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {[
                        { label: "Dashboard", path: "/dashboard" },
                        { label: "Algorithms", path: "/algorithms" },
                        { label: "Quizzes", path: "/quizzes" },
                    ].map(({ label, path }) => (
                        <Link key={path} to={path} style={{
                            padding: "5px 10px", borderRadius: 7, fontSize: 13,
                            color: "#8a8b8e", textDecoration: "none",
                            border: "1px solid transparent",
                        }}>
                            {label}
                        </Link>
                    ))}
                    <span style={{
                        padding: "5px 10px", borderRadius: 7, fontSize: 13,
                        color: "#c8ff3e", background: "rgba(200,255,62,0.1)",
                        border: "1px solid rgba(200,255,62,0.25)",
                    }}>
                        Admin
                    </span>
                </nav>

                <div style={{ marginLeft: "auto" }}>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            {/* Main */}
            <main style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px 60px" }}>
                {/* Page title */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div>
                        <p style={{
                            fontSize: 11, color: "#4a4b4e",
                            letterSpacing: "1.5px", textTransform: "uppercase",
                            fontFamily: "'Poppins', sans-serif", marginBottom: 8,
                        }}>
                            Admin Panel
                        </p>
                        <h1 style={{
                            fontSize: 28, fontWeight: 700, color: "#e4e5e6",
                            fontFamily: "'Poppins', sans-serif",
                            letterSpacing: "-0.5px", lineHeight: 1.1, marginBottom: 8,
                        }}>
                            Quiz <span style={{ color: "#c8ff3e" }}>Management</span>
                        </h1>
                        <p style={{ fontSize: 14, color: "#8a8b8e" }}>
                            All quizzes — active and inactive.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/admin/quizzes/new")}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            background: "rgba(200,255,62,0.1)",
                            border: "1px solid rgba(200,255,62,0.3)",
                            borderRadius: 10, padding: "10px 18px",
                            color: "#c8ff3e", fontSize: 13, fontWeight: 600, cursor: "pointer",
                            flexShrink: 0,
                        }}
                    >
                        <Plus size={15} />
                        New Quiz
                    </button>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 10, color: "#8a8b8e", fontSize: 14, minHeight: 200,
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
                        No quizzes found.
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: "#131415",
                            border: "1px solid #252627",
                            borderRadius: 16,
                            overflow: "hidden",
                        }}
                    >
                        {/* Table header */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 180px 100px 96px",
                            padding: "12px 20px",
                            borderBottom: "1px solid #252627",
                            background: "#0f1011",
                        }}>
                            {["Title", "Algorithm", "Status", "Actions"].map((col) => (
                                <span key={col} style={{
                                    fontSize: 11, fontWeight: 600, color: "#4a4b4e",
                                    textTransform: "uppercase", letterSpacing: "1.2px",
                                    fontFamily: "'Poppins', sans-serif",
                                }}>
                                    {col}
                                </span>
                            ))}
                        </div>

                        {/* Rows */}
                        {quizzes.map((quiz, i) => {
                            const isDeleting = deletingId === quiz.quizId;
                            return (
                                <motion.div
                                    key={quiz.quizId}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 180px 100px 96px",
                                        padding: "14px 20px",
                                        alignItems: "center",
                                        borderBottom: i < quizzes.length - 1 ? "1px solid #1e1f20" : "none",
                                        transition: "background 0.15s",
                                    }}
                                    whileHover={{ background: "#1a1b1c" }}
                                >
                                    {/* Title */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                            background: "rgba(200,255,62,0.08)",
                                            border: "1px solid rgba(200,255,62,0.15)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <BookOpen size={14} color="#c8ff3e" />
                                        </div>
                                        <span style={{
                                            fontSize: 14, fontWeight: 600, color: "#e4e5e6",
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        }}>
                                            {quiz.title}
                                        </span>
                                    </div>

                                    {/* Algorithm name */}
                                    <span style={{
                                        fontSize: 13, color: "#8a8b8e",
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    }}>
                                        {algoMap[quiz.algorithmId] ?? `Algorithm #${quiz.algorithmId}`}
                                    </span>

                                    {/* Status badge */}
                                    <span style={{
                                        display: "inline-flex", alignItems: "center", gap: 5,
                                        fontSize: 11, fontWeight: 600,
                                        padding: "3px 10px", borderRadius: 20,
                                        ...(quiz.isActive
                                            ? {
                                                color: "#c8ff3e",
                                                background: "rgba(200,255,62,0.08)",
                                                border: "1px solid rgba(200,255,62,0.2)",
                                              }
                                            : {
                                                color: "#8a8b8e",
                                                background: "rgba(255,255,255,0.04)",
                                                border: "1px solid #2e2f30",
                                              }),
                                    }}>
                                        <span style={{
                                            width: 5, height: 5, borderRadius: "50%",
                                            background: quiz.isActive ? "#c8ff3e" : "#4a4b4e",
                                            flexShrink: 0,
                                        }} />
                                        {quiz.isActive ? "Active" : "Inactive"}
                                    </span>

                                    {/* Action buttons */}
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button
                                            onClick={() => navigate(`/admin/quizzes/${quiz.quizId}/edit`)}
                                            title="Edit quiz"
                                            style={{
                                                background: "transparent",
                                                border: "1px solid #2e2f30",
                                                borderRadius: 6, padding: "5px 9px",
                                                color: "#8a8b8e", cursor: "pointer",
                                                display: "inline-flex", alignItems: "center",
                                            }}
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(quiz.quizId)}
                                            disabled={isDeleting}
                                            title="Delete quiz"
                                            style={{
                                                background: "transparent",
                                                border: "1px solid rgba(255,90,90,0.25)",
                                                borderRadius: 6, padding: "5px 9px",
                                                color: "#ff5a5a",
                                                cursor: isDeleting ? "not-allowed" : "pointer",
                                                display: "inline-flex", alignItems: "center",
                                                opacity: isDeleting ? 0.5 : 1,
                                            }}
                                        >
                                            {isDeleting
                                                ? <LoaderCircle size={13} style={{ animation: "spin 1s linear infinite" }} />
                                                : <Trash2 size={13} />
                                            }
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Row count */}
                {!loading && !error && quizzes.length > 0 && (
                    <p style={{ marginTop: 12, fontSize: 12, color: "#4a4b4e", textAlign: "right" }}>
                        {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}
                    </p>
                )}
            </main>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
