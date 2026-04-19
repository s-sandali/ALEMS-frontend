import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { ChevronLeft, LoaderCircle, ShieldAlert } from "lucide-react";
import { CodingQuestionService } from "../lib/api";
import { useRole } from "../context/RoleContext";

// --- Shared style tokens (same as AdminQuizFormPage) ------------------------
const INPUT = {
    width: "100%",
    background: "var(--db-bg3)",
    border: "1px solid var(--db-border2)",
    borderRadius: 8,
    padding: "10px 12px",
    color: "var(--db-text)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
};

const LABEL = {
    fontSize: 12,
    color: "var(--db-text2)",
    marginBottom: 6,
    display: "block",
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: "0.5px",
};

function FieldError({ msg }) {
    if (!msg) return null;
    return <p style={{ fontSize: 11, color: "#ff9a9a", marginTop: 4 }}>{msg}</p>;
}

function SectionCard({ children }) {
    return (
        <div style={{
            background: "var(--surface)",
            border: "1px solid var(--db-border)",
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 18,
        }}>
            {children}
        </div>
    );
}

const EMPTY_FORM = {
    title: "",
    description: "",
    inputExample: "",
    expectedOutput: "",
    difficulty: "easy",
};

export default function AdminCodingQuestionFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { getToken } = useAuth();
    const role = useRole();
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState("");

    // Load existing question when editing
    useEffect(() => {
        if (!isEdit) return;

        let isMounted = true;

        async function load() {
            try {
                setLoading(true);
                setLoadError("");
                const res = await CodingQuestionService.getById(Number(id), getToken);
                if (!isMounted) return;
                const q = res.data;
                setForm({
                    title:          q.title,
                    description:    q.description,
                    inputExample:   q.inputExample ?? "",
                    expectedOutput: q.expectedOutput ?? "",
                    difficulty:     q.difficulty,
                });
            } catch (err) {
                if (!isMounted) return;
                setLoadError(err instanceof Error ? err.message : "Failed to load question.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();
        return () => { isMounted = false; };
    }, [id, isEdit, getToken]);

    function validate() {
        const e = {};
        if (!form.title.trim()) {
            e.title = "Title is required.";
        } else if (form.title.trim().length < 3 || form.title.trim().length > 255) {
            e.title = "Title must be between 3 and 255 characters.";
        }
        if (!form.description.trim()) {
            e.description = "Description is required.";
        }
        if (!["easy", "medium", "hard"].includes(form.difficulty)) {
            e.difficulty = "Difficulty must be easy, medium, or hard.";
        }
        return e;
    }

    async function handleSave() {
        const e = validate();
        if (Object.keys(e).length > 0) {
            setErrors(e);
            return;
        }
        setErrors({});

        const payload = {
            title:          form.title.trim(),
            description:    form.description.trim(),
            inputExample:   form.inputExample.trim() || null,
            expectedOutput: form.expectedOutput.trim() || null,
            difficulty:     form.difficulty,
        };

        setSaving(true);
        try {
            if (isEdit) {
                await CodingQuestionService.update(Number(id), payload, getToken);
            } else {
                await CodingQuestionService.create(payload, getToken);
            }
            navigate("/admin/coding-questions");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to save coding question.");
        } finally {
            setSaving(false);
        }
    }

    function set(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
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
            <main style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px 60px" }}>
                {/* Back link */}
                <Link
                    to="/admin/coding-questions"
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        color: "var(--text-secondary)", fontSize: 13, textDecoration: "none", marginBottom: 24,
                    }}
                >
                    <ChevronLeft size={14} />
                    Back to Coding Questions
                </Link>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                        Admin Panel
                    </p>
                     <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                        {isEdit ? "Edit" : "New"} <span style={{ color: "var(--primary)" }}>Coding Question</span>
                    </h1>
                </motion.div>

                {/* Load error */}
                {loadError && (
                    <div style={{
                        background: "rgba(255,90,90,0.06)", border: "1px solid rgba(255,90,90,0.2)",
                        borderRadius: 12, padding: "14px 18px", color: "#ff9a9a", fontSize: 14, marginBottom: 20,
                    }}>
                        {loadError}
                    </div>
                )}

                {/* Loading spinner for edit mode */}
                {loading ? (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        color: "var(--text-secondary)", fontSize: 14, minHeight: 120,
                    }}>
                        <LoaderCircle size={16} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
                        Loading question...
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: "flex", flexDirection: "column", gap: 20 }}
                    >
                        <SectionCard>
                            {/* Title */}
                            <div>
                                <label style={LABEL}>Title *</label>
                                <input
                                    style={{ ...INPUT, borderColor: errors.title ? "rgba(255,90,90,0.5)" : "var(--db-border2)" }}
                                    value={form.title}
                                    onChange={e => set("title", e.target.value)}
                                    placeholder="e.g. Two Sum"
                                    maxLength={255}
                                />
                                <FieldError msg={errors.title} />
                            </div>

                            {/* Description */}
                            <div>
                                <label style={LABEL}>Description *</label>
                                <textarea
                                    style={{
                                        ...INPUT,
                                        minHeight: 120, resize: "vertical",
                                        borderColor: errors.description ? "rgba(255,90,90,0.5)" : "var(--db-border2)",
                                    }}
                                    value={form.description}
                                    onChange={e => set("description", e.target.value)}
                                    placeholder="Describe the problem clearly..."
                                />
                                <FieldError msg={errors.description} />
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label style={LABEL}>Difficulty *</label>
                                <select
                                    style={{ ...INPUT, borderColor: errors.difficulty ? "rgba(255,90,90,0.5)" : "var(--db-border2)" }}
                                    value={form.difficulty}
                                    onChange={e => set("difficulty", e.target.value)}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                                <FieldError msg={errors.difficulty} />
                            </div>
                        </SectionCard>

                        <SectionCard>
                            {/* Input Example */}
                            <div>
                                <label style={LABEL}>Input Example</label>
                                <textarea
                                    style={{ ...INPUT, minHeight: 80, resize: "vertical", fontFamily: "'Fira Code', monospace" }}
                                    value={form.inputExample}
                                    onChange={e => set("inputExample", e.target.value)}
                                    placeholder="e.g. nums = [2,7,11,15], target = 9"
                                />
                            </div>

                            {/* Expected Output */}
                            <div>
                                <label style={LABEL}>Expected Output</label>
                                <textarea
                                    style={{ ...INPUT, minHeight: 80, resize: "vertical", fontFamily: "'Fira Code', monospace" }}
                                    value={form.expectedOutput}
                                    onChange={e => set("expectedOutput", e.target.value)}
                                    placeholder="e.g. [0, 1]"
                                />
                            </div>
                        </SectionCard>

                        {/* Save button */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    background: saving ? "var(--surface-2)" : "rgba(var(--primary-rgb),0.12)",
                                    border: "1px solid rgba(var(--primary-rgb),0.3)",
                                    borderRadius: 8, padding: "10px 24px",
                                    color: saving ? "var(--text-secondary)" : "var(--primary)",
                                    fontSize: 13, fontWeight: 600,
                                    cursor: saving ? "not-allowed" : "pointer",
                                    display: "inline-flex", alignItems: "center", gap: 8,
                                }}
                            >
                                {saving
                                    ? <><LoaderCircle size={14} style={{ animation: "spin 1s linear infinite" }} />Saving...</>
                                    : isEdit ? "Save Changes" : "Create Question"
                                }
                            </button>
                        </div>
                    </motion.div>
                )}
            </main>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

