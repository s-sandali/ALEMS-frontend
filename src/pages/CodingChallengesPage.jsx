import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { Code2, LoaderCircle, PlayCircle, TerminalSquare } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { StudentCodingQuestionService } from "@/lib/api";

const DIFFICULTY_STYLES = {
    easy: {
        color: "#c8ff3e",
        bg: "rgba(200,255,62,0.08)",
        border: "rgba(200,255,62,0.2)",
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
        color: "#8a8b8e",
        bg: "rgba(138,139,142,0.08)",
        border: "rgba(138,139,142,0.2)",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ borderColor: "rgba(200,255,62,0.28)" }}
            onClick={() => onOpen(challenge.id)}
            data-testid="coding-challenge-card"
            style={{
                background: "#131415",
                border: "1px solid #252627",
                borderRadius: 16,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                cursor: "pointer",
                transition: "border-color 0.2s",
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 11,
                        background: "rgba(200,255,62,0.1)",
                        border: "1px solid rgba(200,255,62,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Code2 size={18} color="#c8ff3e" />
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

            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <h3
                    style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#e4e5e6",
                        fontFamily: "'Poppins', sans-serif",
                        letterSpacing: "-0.3px",
                        lineHeight: 1.2,
                        margin: 0,
                    }}
                >
                    {challenge.title}
                </h3>

                <p
                    style={{
                        fontSize: 13,
                        color: "#8a8b8e",
                        lineHeight: 1.65,
                        margin: 0,
                    }}
                >
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
                            color: "#8a8b8e",
                            background: "#1a1b1c",
                            border: "1px solid #252627",
                            borderRadius: 20,
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
                            color: "#c8ff3e",
                            background: "rgba(200,255,62,0.08)",
                            border: "1px solid rgba(200,255,62,0.2)",
                            borderRadius: 20,
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
                    borderTop: "1px solid #252627",
                    paddingTop: 14,
                    marginTop: 2,
                }}
            >
                <span
                    style={{
                        fontSize: 11,
                        color: "#4a4b4e",
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                    }}
                >
                    Open Challenge
                </span>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#c8ff3e",
                        fontSize: 13,
                        fontWeight: 600,
                    }}
                >
                    <PlayCircle size={16} />
                    Solve
                </div>
            </div>
        </motion.div>
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
        <div style={{ minHeight: "100vh", background: "#0d0e0f" }}>
            <DashboardNav />

            <main style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 24px 60px" }}>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                    <p
                        style={{
                            fontSize: 11,
                            color: "#4a4b4e",
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            fontFamily: "'Poppins', sans-serif",
                            marginBottom: 8,
                        }}
                    >
                        Practice Lab
                    </p>

                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: "#e4e5e6",
                            fontFamily: "'Poppins', sans-serif",
                            letterSpacing: "-0.5px",
                            lineHeight: 1.1,
                            marginBottom: 8,
                        }}
                    >
                        Coding <span style={{ color: "#c8ff3e" }}>Challenges</span>
                    </h1>

                    <p style={{ fontSize: 14, color: "#8a8b8e", lineHeight: 1.7, maxWidth: 720 }}>
                        Pick a challenge, review the prompt, and run your solution against the live Judge0-backed execution flow.
                    </p>
                </motion.div>

                {loading ? (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            color: "#8a8b8e",
                            fontSize: 14,
                            minHeight: 200,
                        }}
                    >
                        <LoaderCircle size={16} color="#c8ff3e" style={{ animation: "spin 1s linear infinite" }} />
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
                            background: "#131415",
                            border: "1px dashed #2e2f30",
                            borderRadius: 16,
                            padding: "48px 24px",
                            textAlign: "center",
                            color: "#4a4b4e",
                            fontSize: 14,
                        }}
                    >
                        No coding challenges are available yet.
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: 16,
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
