import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { UserButton } from "@clerk/clerk-react";
import { motion } from "motion/react";
import {
    Plus, Trash2, Edit2, Check, LoaderCircle, ShieldAlert, ChevronLeft,
} from "lucide-react";
import { QuizService, QuizQuestionService, AlgorithmService } from "../lib/api";
import { useRole } from "../context/RoleContext";

// ─── Shared style tokens ────────────────────────────────────────────────────
const INPUT = {
    width: "100%",
    background: "#0f1011",
    border: "1px solid #2e2f30",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#e4e5e6",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
};

const LABEL = {
    fontSize: 12,
    color: "#8a8b8e",
    marginBottom: 6,
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.5px",
};

const DIFF_COLORS = {
    easy:   { color: "#c8ff3e", bg: "rgba(200,255,62,0.08)",  border: "rgba(200,255,62,0.2)"  },
    medium: { color: "#ffb830", bg: "rgba(255,184,48,0.08)",  border: "rgba(255,184,48,0.2)"  },
    hard:   { color: "#ff5a5a", bg: "rgba(255,90,90,0.08)",   border: "rgba(255,90,90,0.2)"   },
};

// ─── Small components ────────────────────────────────────────────────────────
function FieldError({ msg }) {
    if (!msg) return null;
    return <p style={{ fontSize: 11, color: "#ff9a9a", marginTop: 4 }}>{msg}</p>;
}

function SectionCard({ children, style }) {
    return (
        <div style={{
            background: "#131415",
            border: "1px solid #252627",
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            ...style,
        }}>
            {children}
        </div>
    );
}

function SaveBtn({ onClick, disabled, saving, label, savingLabel }) {
    return (
        <button onClick={onClick} disabled={disabled || saving} style={{
            background: (disabled || saving) ? "#1a1b1c" : "rgba(200,255,62,0.12)",
            border: "1px solid rgba(200,255,62,0.3)",
            borderRadius: 8,
            padding: "10px 20px",
            color: (disabled || saving) ? "#8a8b8e" : "#c8ff3e",
            fontSize: 13,
            fontWeight: 600,
            cursor: (disabled || saving) ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
        }}>
            {saving
                ? <><LoaderCircle size={14} style={{ animation: "spin 1s linear infinite" }} />{savingLabel}</>
                : <><Check size={14} />{label}</>
            }
        </button>
    );
}

// ─── Question form ───────────────────────────────────────────────────────────
const EMPTY_Q = {
    questionType: "MCQ",
    questionText: "",
    optionA: "", optionB: "", optionC: "", optionD: "",
    correctOption: "A",
    difficulty: "easy",
    explanation: "",
    orderIndex: 0,
};

function QuestionForm({ initial, onSave, onCancel, saving }) {
    const [f, setF] = useState(initial ?? EMPTY_Q);
    const [errors, setErrors] = useState({});

    const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));

    function validate() {
        const e = {};
        if (!f.questionText.trim() || f.questionText.trim().length < 5)
            e.questionText = "Minimum 5 characters.";
        ["A", "B", "C", "D"].forEach(o => {
            if (!f[`option${o}`].trim()) e[`option${o}`] = "Required.";
        });
        return e;
    }

    function handleSave() {
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length === 0) onSave(f);
    }

    return (
        <div style={{
            background: "#0f1011",
            border: "1px solid rgba(200,255,62,0.2)",
            borderRadius: 12,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 12,
        }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#c8ff3e", margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                {initial ? "Edit Question" : "New Question"}
            </h3>

            {/* Type / difficulty / correct option */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                    <label style={LABEL}>Type</label>
                    <select value={f.questionType} onChange={e => set("questionType", e.target.value)}
                        style={{ ...INPUT, cursor: "pointer" }}>
                        <option value="MCQ">MCQ</option>
                        <option value="PREDICT_STEP">Predict Step</option>
                    </select>
                </div>
                <div>
                    <label style={LABEL}>Difficulty</label>
                    <select value={f.difficulty} onChange={e => set("difficulty", e.target.value)}
                        style={{ ...INPUT, cursor: "pointer" }}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div>
                    <label style={LABEL}>Correct Option</label>
                    <select value={f.correctOption} onChange={e => set("correctOption", e.target.value)}
                        style={{ ...INPUT, cursor: "pointer" }}>
                        {["A", "B", "C", "D"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
            </div>

            {/* Question text */}
            <div>
                <label style={LABEL}>Question Text *</label>
                <textarea
                    value={f.questionText}
                    onChange={e => set("questionText", e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Enter the question…"
                    style={{ ...INPUT, resize: "vertical", minHeight: 72 }}
                />
                <FieldError msg={errors.questionText} />
            </div>

            {/* Options A–D */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {["A", "B", "C", "D"].map(opt => (
                    <div key={opt}>
                        <label style={LABEL}>Option {opt} *</label>
                        <input
                            value={f[`option${opt}`]}
                            onChange={e => set(`option${opt}`, e.target.value)}
                            maxLength={500}
                            placeholder={`Option ${opt}`}
                            style={INPUT}
                        />
                        <FieldError msg={errors[`option${opt}`]} />
                    </div>
                ))}
            </div>

            {/* Order index + explanation */}
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
                <div>
                    <label style={LABEL}>Order Index</label>
                    <input
                        type="number" min={0} max={9999}
                        value={f.orderIndex}
                        onChange={e => set("orderIndex", parseInt(e.target.value, 10) || 0)}
                        style={INPUT}
                    />
                </div>
                <div>
                    <label style={LABEL}>Explanation (optional)</label>
                    <input
                        value={f.explanation}
                        onChange={e => set("explanation", e.target.value)}
                        maxLength={2000}
                        placeholder="Why is this answer correct?"
                        style={INPUT}
                    />
                </div>
            </div>

            {/* Form actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={onCancel} style={{
                    background: "transparent", border: "1px solid #2e2f30",
                    borderRadius: 8, padding: "8px 16px",
                    color: "#8a8b8e", fontSize: 13, cursor: "pointer",
                }}>
                    Cancel
                </button>
                <SaveBtn
                    onClick={handleSave}
                    saving={saving}
                    label="Save Question"
                    savingLabel="Saving…"
                />
            </div>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AdminQuizFormPage() {
    const { id } = useParams();          // undefined = create mode, string = edit mode
    const isEdit = Boolean(id);
    const quizId = isEdit ? parseInt(id, 10) : null;

    const { getToken } = useAuth();
    const role = useRole();
    const navigate = useNavigate();

    // ── Algorithms for dropdown
    const [algorithms, setAlgorithms] = useState([]);

    // ── Quiz form state
    const [qf, setQf] = useState({
        algorithmId: "",
        title: "",
        description: "",
        timeLimitMins: "",
        passScore: "70",
        isActive: true,
    });
    const [qfErrors, setQfErrors] = useState({});
    const [qfSaving, setQfSaving] = useState(false);
    const [qfError, setQfError] = useState("");

    // ── Questions state
    const [questions, setQuestions] = useState([]);
    const [showQForm, setShowQForm] = useState(false);
    const [editingQ, setEditingQ] = useState(null);      // null = add new, obj = editing existing
    const [qSaving, setQSaving] = useState(false);
    const [qError, setQError] = useState("");
    const [deletingQId, setDeletingQId] = useState(null);

    // ── Page loading
    const [pageLoading, setPageLoading] = useState(isEdit);
    const [pageError, setPageError] = useState("");

    const setField = (k, v) => setQf(prev => ({ ...prev, [k]: v }));

    // ── Load data on mount
    useEffect(() => {
        if (role !== "Admin") return;
        let alive = true;

        async function load() {
            try {
                const algoRes = await AlgorithmService.getAll(getToken);
                if (!alive) return;
                setAlgorithms(algoRes?.data ?? []);

                if (isEdit) {
                    const [quizRes, questRes] = await Promise.all([
                        QuizService.getById(quizId, getToken),
                        QuizQuestionService.getByQuiz(quizId, getToken),
                    ]);
                    if (!alive) return;
                    const q = quizRes.data;
                    setQf({
                        algorithmId: String(q.algorithmId),
                        title: q.title,
                        description: q.description ?? "",
                        timeLimitMins: q.timeLimitMins != null ? String(q.timeLimitMins) : "",
                        passScore: String(q.passScore),
                        isActive: q.isActive,
                    });
                    setQuestions(Array.isArray(questRes?.data) ? questRes.data : []);
                }
            } catch (err) {
                if (alive) setPageError(err instanceof Error ? err.message : "Failed to load.");
            } finally {
                if (alive) setPageLoading(false);
            }
        }

        load();
        return () => { alive = false; };
    }, [getToken, role, quizId, isEdit]);

    // ── Quiz form validation
    function validateQuiz() {
        const e = {};
        if (!qf.title.trim() || qf.title.trim().length < 3)
            e.title = "Title must be at least 3 characters.";
        if (!isEdit && !qf.algorithmId)
            e.algorithmId = "Select an algorithm.";
        const ps = parseInt(qf.passScore, 10);
        if (isNaN(ps) || ps < 0 || ps > 100)
            e.passScore = "Must be 0–100.";
        if (qf.timeLimitMins) {
            const tl = parseInt(qf.timeLimitMins, 10);
            if (isNaN(tl) || tl < 1 || tl > 300)
                e.timeLimitMins = "Must be 1–300 minutes.";
        }
        return e;
    }

    async function handleSaveQuiz() {
        const e = validateQuiz();
        setQfErrors(e);
        if (Object.keys(e).length > 0) return;

        setQfSaving(true);
        setQfError("");
        try {
            if (isEdit) {
                await QuizService.update(quizId, {
                    title: qf.title.trim(),
                    description: qf.description.trim() || null,
                    timeLimitMins: qf.timeLimitMins ? parseInt(qf.timeLimitMins, 10) : null,
                    passScore: parseInt(qf.passScore, 10),
                    isActive: qf.isActive,
                }, getToken);
            } else {
                const res = await QuizService.create({
                    algorithmId: parseInt(qf.algorithmId, 10),
                    title: qf.title.trim(),
                    description: qf.description.trim() || null,
                    timeLimitMins: qf.timeLimitMins ? parseInt(qf.timeLimitMins, 10) : null,
                    passScore: parseInt(qf.passScore, 10),
                }, getToken);
                // Redirect to edit page so questions can be added
                navigate(`/admin/quizzes/${res.data.quizId}/edit`, { replace: true });
            }
        } catch (err) {
            setQfError(err instanceof Error ? err.message : "Failed to save quiz.");
        } finally {
            setQfSaving(false);
        }
    }

    // ── Question save (add or edit)
    async function handleSaveQuestion(fields) {
        setQSaving(true);
        setQError("");
        try {
            const payload = {
                questionType: fields.questionType,
                questionText: fields.questionText.trim(),
                optionA: fields.optionA.trim(),
                optionB: fields.optionB.trim(),
                optionC: fields.optionC.trim(),
                optionD: fields.optionD.trim(),
                correctOption: fields.correctOption,
                difficulty: fields.difficulty,
                explanation: fields.explanation?.trim() || null,
                orderIndex: fields.orderIndex,
            };

            if (editingQ) {
                await QuizQuestionService.update(quizId, editingQ.questionId, {
                    ...payload,
                    isActive: editingQ.isActive,
                }, getToken);
            } else {
                await QuizQuestionService.create(quizId, payload, getToken);
            }

            // Reload questions list
            const res = await QuizQuestionService.getByQuiz(quizId, getToken);
            setQuestions(Array.isArray(res?.data) ? res.data : []);
            setShowQForm(false);
            setEditingQ(null);
        } catch (err) {
            setQError(err instanceof Error ? err.message : "Failed to save question.");
        } finally {
            setQSaving(false);
        }
    }

    // ── Question delete
    async function handleDeleteQuestion(questionId) {
        if (!window.confirm("Delete this question? This cannot be undone.")) return;
        setDeletingQId(questionId);
        try {
            await QuizQuestionService.delete(quizId, questionId, getToken);
            setQuestions(prev => prev.filter(q => q.questionId !== questionId));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete question.");
        } finally {
            setDeletingQId(null);
        }
    }

    function openAddQuestion() {
        setEditingQ(null);
        setQError("");
        setShowQForm(true);
    }

    function openEditQuestion(q) {
        setEditingQ(q);
        setQError("");
        setShowQForm(true);
    }

    function closeQForm() {
        setShowQForm(false);
        setEditingQ(null);
        setQError("");
    }

    // ── Guards ────────────────────────────────────────────────────────────────
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

    if (pageLoading) {
        return (
            <div style={{
                minHeight: "100vh", background: "#0d0e0f",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, color: "#8a8b8e", fontSize: 14,
            }}>
                <LoaderCircle size={16} color="#c8ff3e" style={{ animation: "spin 1s linear infinite" }} />
                Loading…
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (pageError) {
        return (
            <div style={{
                minHeight: "100vh", background: "#0d0e0f",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 12,
            }}>
                <p style={{ color: "#ff9a9a", fontSize: 15 }}>{pageError}</p>
                <Link to="/admin/quizzes" style={{ color: "#c8ff3e", fontSize: 13, textDecoration: "none" }}>
                    ← Back to Quizzes
                </Link>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
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
            <main style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 80px" }}>

                {/* Back link + page title */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
                    <Link to="/admin/quizzes" style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: 13, color: "#8a8b8e", textDecoration: "none", marginBottom: 16,
                    }}>
                        <ChevronLeft size={14} />
                        Back to Quiz Management
                    </Link>
                    <p style={{
                        fontSize: 11, color: "#4a4b4e",
                        letterSpacing: "1.5px", textTransform: "uppercase",
                        fontFamily: "'JetBrains Mono', monospace", marginBottom: 8,
                    }}>
                        Admin Panel
                    </p>
                    <h1 style={{
                        fontSize: 28, fontWeight: 700, color: "#e4e5e6",
                        fontFamily: "'Space Grotesk', sans-serif",
                        letterSpacing: "-0.5px", lineHeight: 1.1,
                    }}>
                        {isEdit ? "Edit" : "New"}{" "}
                        <span style={{ color: "#c8ff3e" }}>Quiz</span>
                    </h1>
                </motion.div>

                {/* ── Quiz details card ─────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <SectionCard>
                        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e4e5e6", margin: 0 }}>
                            Quiz Details
                        </h2>

                        {/* Algorithm selector — create only */}
                        {!isEdit && (
                            <div>
                                <label style={LABEL}>Algorithm *</label>
                                <select
                                    value={qf.algorithmId}
                                    onChange={e => setField("algorithmId", e.target.value)}
                                    style={{ ...INPUT, cursor: "pointer" }}
                                >
                                    <option value="">Select an algorithm…</option>
                                    {algorithms.map(a => (
                                        <option key={a.algorithmId} value={a.algorithmId}>
                                            {a.name}
                                        </option>
                                    ))}
                                </select>
                                <FieldError msg={qfErrors.algorithmId} />
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label style={LABEL}>Title *</label>
                            <input
                                value={qf.title}
                                onChange={e => setField("title", e.target.value)}
                                maxLength={255}
                                placeholder="e.g. Bubble Sort Fundamentals"
                                style={INPUT}
                            />
                            <FieldError msg={qfErrors.title} />
                        </div>

                        {/* Description */}
                        <div>
                            <label style={LABEL}>Description (optional)</label>
                            <textarea
                                value={qf.description}
                                onChange={e => setField("description", e.target.value)}
                                rows={3}
                                maxLength={2000}
                                placeholder="Briefly describe what this quiz covers…"
                                style={{ ...INPUT, resize: "vertical", minHeight: 72 }}
                            />
                        </div>

                        {/* Pass score + time limit */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label style={LABEL}>Pass Score % *</label>
                                <input
                                    type="number" min={0} max={100}
                                    value={qf.passScore}
                                    onChange={e => setField("passScore", e.target.value)}
                                    style={INPUT}
                                />
                                <FieldError msg={qfErrors.passScore} />
                            </div>
                            <div>
                                <label style={LABEL}>Time Limit (minutes, optional)</label>
                                <input
                                    type="number" min={1} max={300}
                                    value={qf.timeLimitMins}
                                    onChange={e => setField("timeLimitMins", e.target.value)}
                                    placeholder="e.g. 15"
                                    style={INPUT}
                                />
                                <FieldError msg={qfErrors.timeLimitMins} />
                            </div>
                        </div>

                        {/* Is Active toggle — edit only */}
                        {isEdit && (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <button
                                    onClick={() => setField("isActive", !qf.isActive)}
                                    style={{
                                        width: 40, height: 22, borderRadius: 11, padding: 0,
                                        background: qf.isActive ? "rgba(200,255,62,0.2)" : "#1e1f20",
                                        border: `1px solid ${qf.isActive ? "rgba(200,255,62,0.4)" : "#2e2f30"}`,
                                        cursor: "pointer", position: "relative",
                                        transition: "background 0.2s, border-color 0.2s",
                                    }}
                                >
                                    <span style={{
                                        position: "absolute",
                                        top: 3, left: qf.isActive ? 20 : 3,
                                        width: 14, height: 14, borderRadius: "50%",
                                        background: qf.isActive ? "#c8ff3e" : "#4a4b4e",
                                        transition: "left 0.2s, background 0.2s",
                                    }} />
                                </button>
                                <span style={{ fontSize: 13, color: qf.isActive ? "#c8ff3e" : "#8a8b8e" }}>
                                    {qf.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        )}

                        {/* API error */}
                        {qfError && (
                            <div style={{
                                background: "rgba(255,90,90,0.06)", border: "1px solid rgba(255,90,90,0.2)",
                                borderRadius: 8, padding: "10px 14px", color: "#ff9a9a", fontSize: 13,
                            }}>
                                {qfError}
                            </div>
                        )}

                        {/* Save button */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <SaveBtn
                                onClick={handleSaveQuiz}
                                saving={qfSaving}
                                label={isEdit ? "Save Changes" : "Create Quiz & Add Questions →"}
                                savingLabel="Saving…"
                            />
                        </div>
                    </SectionCard>
                </motion.div>

                {/* ── Questions section (edit mode only) ───────────────── */}
                {isEdit && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ marginTop: 24 }}
                    >
                        {/* Section header */}
                        <div style={{
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between", marginBottom: 16,
                        }}>
                            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e4e5e6", margin: 0 }}>
                                Questions{" "}
                                <span style={{ color: "#4a4b4e", fontWeight: 400, fontSize: 13 }}>
                                    ({questions.length})
                                </span>
                            </h2>
                            {!showQForm && (
                                <button onClick={openAddQuestion} style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    background: "rgba(200,255,62,0.1)",
                                    border: "1px solid rgba(200,255,62,0.25)",
                                    borderRadius: 8, padding: "7px 14px",
                                    color: "#c8ff3e", fontSize: 13, fontWeight: 600, cursor: "pointer",
                                }}>
                                    <Plus size={14} />
                                    Add Question
                                </button>
                            )}
                        </div>

                        {/* Question API error */}
                        {qError && (
                            <div style={{
                                background: "rgba(255,90,90,0.06)", border: "1px solid rgba(255,90,90,0.2)",
                                borderRadius: 8, padding: "10px 14px", color: "#ff9a9a",
                                fontSize: 13, marginBottom: 12,
                            }}>
                                {qError}
                            </div>
                        )}

                        {/* Questions table */}
                        {questions.length > 0 && (
                            <SectionCard style={{ padding: 0, gap: 0, marginBottom: 0 }}>
                                {/* Table header */}
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 100px 90px 50px 88px",
                                    padding: "10px 20px",
                                    borderBottom: "1px solid #252627",
                                    background: "#0f1011",
                                    borderRadius: "16px 16px 0 0",
                                }}>
                                    {["Question", "Type", "Difficulty", "Ans", "Actions"].map(col => (
                                        <span key={col} style={{
                                            fontSize: 11, fontWeight: 600, color: "#4a4b4e",
                                            textTransform: "uppercase", letterSpacing: "1.2px",
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}>
                                            {col}
                                        </span>
                                    ))}
                                </div>

                                {questions.map((q, i) => {
                                    const dc = DIFF_COLORS[q.difficulty] ?? DIFF_COLORS.easy;
                                    const isDeleting = deletingQId === q.questionId;
                                    return (
                                        <motion.div
                                            key={q.questionId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 100px 90px 50px 88px",
                                                padding: "14px 20px",
                                                alignItems: "center",
                                                borderBottom: i < questions.length - 1 ? "1px solid #1e1f20" : "none",
                                                borderRadius: i === questions.length - 1 ? "0 0 16px 16px" : 0,
                                            }}
                                        >
                                            {/* Question text (truncated) */}
                                            <span style={{
                                                fontSize: 13, color: "#e4e5e6",
                                                overflow: "hidden", textOverflow: "ellipsis",
                                                whiteSpace: "nowrap", paddingRight: 12,
                                            }}>
                                                {q.questionText}
                                            </span>

                                            {/* Type */}
                                            <span style={{ fontSize: 11, color: "#8a8b8e" }}>
                                                {q.questionType === "PREDICT_STEP" ? "Predict" : "MCQ"}
                                            </span>

                                            {/* Difficulty badge */}
                                            <span style={{
                                                display: "inline-flex", alignItems: "center",
                                                fontSize: 11, fontWeight: 600,
                                                padding: "2px 9px", borderRadius: 20,
                                                color: dc.color, background: dc.bg, border: `1px solid ${dc.border}`,
                                            }}>
                                                {q.difficulty}
                                            </span>

                                            {/* Correct option */}
                                            <span style={{
                                                fontSize: 12, fontWeight: 700, color: "#c8ff3e",
                                                fontFamily: "'JetBrains Mono', monospace",
                                            }}>
                                                {q.correctOption}
                                            </span>

                                            {/* Action buttons */}
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button
                                                    onClick={() => openEditQuestion(q)}
                                                    title="Edit"
                                                    style={{
                                                        background: "transparent",
                                                        border: "1px solid #2e2f30",
                                                        borderRadius: 6, padding: "5px 8px",
                                                        color: "#8a8b8e", cursor: "pointer",
                                                        display: "inline-flex", alignItems: "center",
                                                    }}
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQuestion(q.questionId)}
                                                    disabled={isDeleting}
                                                    title="Delete"
                                                    style={{
                                                        background: "transparent",
                                                        border: "1px solid rgba(255,90,90,0.25)",
                                                        borderRadius: 6, padding: "5px 8px",
                                                        color: "#ff5a5a",
                                                        cursor: isDeleting ? "not-allowed" : "pointer",
                                                        display: "inline-flex", alignItems: "center",
                                                        opacity: isDeleting ? 0.5 : 1,
                                                    }}
                                                >
                                                    {isDeleting
                                                        ? <LoaderCircle size={12} style={{ animation: "spin 1s linear infinite" }} />
                                                        : <Trash2 size={12} />
                                                    }
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </SectionCard>
                        )}

                        {/* Empty state */}
                        {questions.length === 0 && !showQForm && (
                            <div style={{
                                background: "#131415", border: "1px dashed #2e2f30",
                                borderRadius: 16, padding: "36px 24px",
                                textAlign: "center", color: "#4a4b4e", fontSize: 14,
                            }}>
                                No questions yet — add the first one above.
                            </div>
                        )}

                        {/* Question form (add / edit) */}
                        {showQForm && (
                            <QuestionForm
                                initial={editingQ ? {
                                    questionType: editingQ.questionType,
                                    questionText: editingQ.questionText,
                                    optionA: editingQ.optionA,
                                    optionB: editingQ.optionB,
                                    optionC: editingQ.optionC,
                                    optionD: editingQ.optionD,
                                    correctOption: editingQ.correctOption,
                                    difficulty: editingQ.difficulty,
                                    explanation: editingQ.explanation ?? "",
                                    orderIndex: editingQ.orderIndex,
                                } : null}
                                onSave={handleSaveQuestion}
                                onCancel={closeQForm}
                                saving={qSaving}
                            />
                        )}
                    </motion.div>
                )}
            </main>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
