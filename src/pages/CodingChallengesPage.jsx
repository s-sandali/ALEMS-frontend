import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { Code2, LoaderCircle, PlayCircle, TerminalSquare } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { StudentCodingQuestionService } from "@/lib/api";

const DIFFICULTY_STYLES = {
    easy: {
        color: "var(--primary)",
        bg: "rgba(var(--primary-rgb),0.08)",
        border: "rgba(var(--primary-rgb),0.2)",
    },
    medium: {
        color: "#ffb830",
        bg: "rgba(255,184,48,0.08)",
        border: "rgba(255,184,48,0.2)",
    },
    hard: {
        color: "#ff5a5a",
        bg: "rgba(255,90,90,0.08)",
        border: "rgba(255,90,90,0.2)",
    },
};

function CodingChallengeCard({ challenge, onOpen }) {
    const difficultyStyle = DIFFICULTY_STYLES[challenge.difficulty] ?? {
        color: "var(--text-secondary)",
        bg: "rgba(138,139,142,0.08)",
        border: "rgba(138,139,142,0.2)",
    };

    return (
        <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onOpen(challenge.id)}
            data-testid="coding-challenge-card"
            className="group algo-card relative overflow-hidden rounded-3xl border p-6 text-left"
            style={{
                background: "var(--surface)",
                border: "1px solid var(--db-border)",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                cursor: "pointer",
            }}
        >
            <div className="absolute inset-0 bg-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex h-full flex-col gap-4">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "rgba(var(--accent-rgb),0.1)",
                        border: "1px solid rgba(var(--accent-rgb),0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Code2 size={20} color="var(--accent)" />
                </div>

                <div
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "capitalize",
                        color: difficultyStyle.color,
                        background: difficultyStyle.bg,
                        border: `1px solid ${difficultyStyle.border}`,
                        borderRadius: 999,
                        padding: "4px 10px",
                    }}
                >
                    {challenge.difficulty}
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h3
                        className="text-2xl font-bold tracking-tight transition-colors duration-300 group-hover:text-accent"
                        style={{ color: "var(--db-text)" }}
                    >
                    {challenge.title}
                </h3>

                <p className="text-sm leading-6 text-text-secondary">
                    {challenge.description}
                </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {challenge.inputExample && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 11,
                            color: "var(--db-text2)",
                            background: "var(--db-bg3)",
                            border: "1px solid var(--db-border)",
                            borderRadius: 999,
                            padding: "4px 10px",
                        }}
                    >
                        <TerminalSquare size={11} />
                        Has sample input
                    </div>
                )}

                {challenge.expectedOutput && (
                    <div
                        style={{
                            fontSize: 11,
                            color: "var(--accent)",
                            background: "rgba(var(--accent-rgb),0.1)",
                            border: "1px solid rgba(var(--accent-rgb),0.2)",
                            borderRadius: 999,
                            padding: "4px 10px",
                        }}
                    >
                        Includes expected output
                    </div>
                )}
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid var(--db-border)",
                    paddingTop: 14,
                    marginTop: 2,
                }}
            >
                <span
                    style={{
                        fontSize: 11,
                        color: "var(--db-text3)",
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                    }}
                >
                    Open Challenge
                </span>

                <div
                    className="flex items-center gap-1.5 text-sm font-medium transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
                    style={{ color: "var(--db-text)" }}
                >
                    <PlayCircle size={16} />
                    Solve
                </div>
            </div>
            </div>
        </motion.button>
    );
}

export default function CodingChallengesPage() {
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadChallenges() {
            try {
                setLoading(true);
                setError("");
                const response = await StudentCodingQuestionService.getAll(getToken);
                if (!isMounted) return;
                setChallenges(Array.isArray(response?.data) ? response.data : []);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Failed to load coding challenges.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadChallenges();
        return () => { isMounted = false; };
    }, [getToken]);

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <DashboardNav />

            <main style={{ maxWidth: 1160, margin: "0 auto", padding: "36px 24px 60px" }}>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                   <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                        Practise Lab
                    </p>

                    <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                        Coding <span style={{ color: "var(--primary)" }}>Challenges</span>
                    </h1>

                     <p className="mt-4 text-base leading-7 text-text-secondary">
                        Pick a challenge, and try to solve it.
                    </p>
                </motion.div>

                {loading ? (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            color: "var(--text-secondary)",
                            fontSize: 14,
                            minHeight: 200,
                        }}
                    >
                        <LoaderCircle size={16} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
                        Loading coding challenges...
                    </div>
                ) : error ? (
                    <div
                        style={{
                            background: "rgba(255,90,90,0.06)",
                            border: "1px solid rgba(255,90,90,0.2)",
                            borderRadius: 12,
                            padding: "16px 20px",
                            color: "#ff9a9a",
                            fontSize: 14,
                        }}
                    >
                        {error}
                    </div>
                ) : challenges.length === 0 ? (
                    <div
                        style={{
                            background: "var(--surface)",
                            border: "1px dashed var(--db-border2)",
                            borderRadius: 16,
                            padding: "48px 24px",
                            textAlign: "center",
                            color: "var(--text-tertiary)",
                            fontSize: 14,
                        }}
                    >
                        No coding challenges are available yet.
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: 18,
                            alignItems: "start",
                        }}
                    >
                        {challenges.map((challenge, index) => (
                            <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <CodingChallengeCard
                                    challenge={challenge}
                                    onOpen={(id) => navigate(`/coding-challenges/${id}`)}
                                />
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

