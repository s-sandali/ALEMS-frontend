import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { Code2, LoaderCircle, ShieldAlert, Plus, Edit2, Trash2 } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { CodingQuestionService } from "../lib/api";
import { useRole } from "../context/RoleContext";

const DIFFICULTY_STYLES = {
    easy:   { color: "#c8ff3e", bg: "rgba(200,255,62,0.08)",  border: "rgba(200,255,62,0.2)"  },
    medium: { color: "#ffb830", bg: "rgba(255,184,48,0.08)",  border: "rgba(255,184,48,0.2)"  },
    hard:   { color: "#ff5a5a", bg: "rgba(255,90,90,0.08)",   border: "rgba(255,90,90,0.2)"   },
};

export default function AdminCodingQuestionListPage() {
    const { getToken } = useAuth();
    const role = useRole();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (role !== "Admin") return;

        let isMounted = true;

        async function load() {
            try {
                setLoading(true);
                setError("");
                const res = await CodingQuestionService.getAll(getToken);
                if (!isMounted) return;
                setQuestions(Array.isArray(res?.data) ? res.data : []);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Failed to load coding questions.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();
        return () => { isMounted = false; };
    }, [getToken, role]);

    async function handleDelete(id) {
        if (!window.confirm("Delete this coding question?")) return;
        setDeletingId(id);
        try {
            await CodingQuestionService.delete(id, getToken);
            setQuestions(prev => prev.filter(q => q.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete coding question.");
        } finally {
            setDeletingId(null);
        }
    }

    if (role !== "Admin") {
        return (
            <div style={{
                minHeight: "100vh", background: "#0d0e0f",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 12,
            }}>
                <ShieldAlert size={40} color="#ff5a5a" />
                <p style={{ color: "#ff9a9a", fontSize: 15 }}>Admin access required.</p>
                <Link to="/dashboard" style={{ color: "#c8ff3e", fontSize: 13, textDecoration: "none" }}>
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0d0e0f" }}>
            <DashboardNav />

            <main style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px 60px" }}>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        marginBottom: 32,
                        display: "flex", alignItems: "flex-start",
                        justifyContent: "space-between", gap: 16, flexWrap: "wrap",
                    }}
                >
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
                            Coding <span style={{ color: "#c8ff3e" }}>Questions</span>
                        </h1>
                        <p style={{ fontSize: 14, color: "#8a8b8e" }}>
                            All coding challenges available to students.
                        </p>
                    </div>
                    <button
                        data-testid="new-coding-question-button"
                        onClick={() => navigate("/admin/coding-questions/new")}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            background: "rgba(200,255,62,0.1)",
                            border: "1px solid rgba(200,255,62,0.3)",
                            borderRadius: 10, padding: "10px 18px",
                            color: "#c8ff3e", fontSize: 13, fontWeight: 600,
                            cursor: "pointer", flexShrink: 0,
                        }}
                    >
                        <Plus size={15} />
                        New Question
                    </button>
                </motion.div>

                {loading ? (
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 10, color: "#8a8b8e", fontSize: 14, minHeight: 200,
                    }}>
                        <LoaderCircle size={16} color="#c8ff3e" style={{ animation: "spin 1s linear infinite" }} />
                        Loading questions…
                    </div>
                ) : error ? (
                    <div style={{
                        background: "rgba(255,90,90,0.06)", border: "1px solid rgba(255,90,90,0.2)",
                        borderRadius: 12, padding: "16px 20px", color: "#ff9a9a", fontSize: 14,
                    }}>
                        {error}
                    </div>
                ) : questions.length === 0 ? (
                    <div style={{
                        background: "#131415", border: "1px dashed #2e2f30",
                        borderRadius: 16, padding: "48px 24px",
                        textAlign: "center", color: "#4a4b4e", fontSize: 14,
                    }}>
                        No coding questions found.
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
                            gridTemplateColumns: "1fr 120px 96px",
                            padding: "12px 20px",
                            borderBottom: "1px solid #252627",
                            background: "#0f1011",
                        }}>
                            {["Title", "Difficulty", "Actions"].map((col) => (
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
                        {questions.map((q, i) => {
                            const isDeleting = deletingId === q.id;
                            const diffStyle = DIFFICULTY_STYLES[q.difficulty] ?? {
                                color: "#8a8b8e", bg: "rgba(255,255,255,0.04)", border: "#2e2f30",
                            };
                            return (
                                <motion.div
                                    key={q.id}
                                    data-testid="admin-coding-row"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 120px 96px",
                                        padding: "14px 20px",
                                        alignItems: "center",
                                        borderBottom: i < questions.length - 1 ? "1px solid #1e1f20" : "none",
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
                                            <Code2 size={14} color="#c8ff3e" />
                                        </div>
                                        <span style={{
                                            fontSize: 14, fontWeight: 600, color: "#e4e5e6",
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        }}>
                                            {q.title}
                                        </span>
                                    </div>

                                    {/* Difficulty badge */}
                                    <span style={{
                                        display: "inline-flex", alignItems: "center",
                                        fontSize: 11, fontWeight: 600,
                                        textTransform: "capitalize",
                                        padding: "3px 10px", borderRadius: 20,
                                        color: diffStyle.color,
                                        background: diffStyle.bg,
                                        border: `1px solid ${diffStyle.border}`,
                                        width: "fit-content",
                                    }}>
                                        {q.difficulty}
                                    </span>

                                    {/* Actions */}
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button
                                            onClick={() => navigate(`/admin/coding-questions/${q.id}/edit`)}
                                            title="Edit"
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
                                            onClick={() => handleDelete(q.id)}
                                            disabled={isDeleting}
                                            title="Delete"
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

                {!loading && !error && questions.length > 0 && (
                    <p style={{ marginTop: 12, fontSize: 12, color: "#4a4b4e", textAlign: "right" }}>
                        {questions.length} question{questions.length !== 1 ? "s" : ""}
                    </p>
                )}
            </main>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
