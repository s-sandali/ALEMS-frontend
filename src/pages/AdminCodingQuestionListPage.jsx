import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { Code2, LoaderCircle, ShieldAlert, Plus, Edit2, Trash2 } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { CodingQuestionService } from "../lib/api";
import { useRole } from "../context/RoleContext";

const DIFFICULTY_STYLES = {
    easy:   { color: "var(--primary)", bg: "rgba(var(--primary-rgb),0.08)",  border: "rgba(var(--primary-rgb),0.2)"  },
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
                minHeight: "100vh", background: "var(--bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 12,
            }}>
                <ShieldAlert size={40} color="#ff5a5a" />
                <p style={{ color: "#ff9a9a", fontSize: 15 }}>Admin access required.</p>
                <Link to="/dashboard" style={{ color: "var(--primary)", fontSize: 13, textDecoration: "none" }}>
                    {"<- Back to Dashboard"}
                </Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <DashboardNav />

            <main style={{ maxWidth: 1160, margin: "0 auto", padding: "36px 24px 60px" }}>
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
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                            Admin Panel
                        </p>
                       <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                            Coding <span style={{ color: "var(--primary)" }}>Questions</span>
                        </h1>
                        <p className="mt-4 text-base leading-7 text-text-secondary">
                            All coding challenges available to students.
                        </p>
                    </div>
                    <button
                        data-testid="new-coding-question-button"
                        onClick={() => navigate("/admin/coding-questions/new")}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            background: "rgba(var(--primary-rgb),0.1)",
                            border: "1px solid rgba(var(--primary-rgb),0.3)",
                            borderRadius: 10, padding: "10px 18px",
                            color: "var(--primary)", fontSize: 13, fontWeight: 600,
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
                        gap: 10, color: "var(--text-secondary)", fontSize: 14, minHeight: 200,
                    }}>
                        <LoaderCircle size={16} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
                        Loading questions...
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
                        background: "var(--surface)", border: "1px dashed var(--db-border2)",
                        borderRadius: 16, padding: "48px 24px",
                        textAlign: "center", color: "var(--text-tertiary)", fontSize: 14,
                    }}>
                        No coding questions found.
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--db-border)",
                            borderRadius: 16,
                            overflow: "hidden",
                        }}
                    >
                        {/* Table header */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 120px 96px",
                            padding: "12px 20px",
                            borderBottom: "1px solid var(--db-border)",
                            background: "var(--db-bg3)",
                        }}>
                            {["Title", "Difficulty", "Actions"].map((col) => (
                                <span key={col} style={{
                                    fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)",
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
                                color: "var(--text-secondary)", bg: "rgba(255,255,255,0.04)", border: "var(--db-border2)",
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
                                        borderBottom: i < questions.length - 1 ? "1px solid var(--db-border2)" : "none",
                                        transition: "background 0.15s",
                                    }}
                                    whileHover={{ background: "var(--db-bg3)" }}
                                >
                                    {/* Title */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                            background: "rgba(var(--primary-rgb),0.08)",
                                            border: "1px solid rgba(var(--primary-rgb),0.15)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <Code2 size={14} color="var(--primary)" />
                                        </div>
                                        <span style={{
                                            fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
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
                                                color: "var(--text-secondary)", cursor: "pointer",
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
                    <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-tertiary)", textAlign: "right" }}>
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

