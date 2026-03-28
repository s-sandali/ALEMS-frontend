import { LoaderCircle } from "lucide-react";
import type { CodeExecutionResult } from "@/lib/api";

type ViewState = "idle" | "running" | "done" | "error";

type Props = {
    viewState: ViewState;
    result: CodeExecutionResult | null;
    errorMessage: string;
};

// Judge0 status ID reference:
// 3 = Accepted, 4 = Wrong Answer, 5 = TLE, 6 = Compile Error, 7–12 = Runtime Error

function OutputBlock({ label, content, color }: { label: string; content: string; color?: string }) {
    return (
        <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: color ?? "var(--db-text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {label}
            </p>
            <pre style={{
                background: "var(--db-bg3)",
                border: "1px solid var(--db-border2)",
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 13,
                color: "var(--db-text)",
                fontFamily: "'Fira Code', 'Courier New', monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
                minHeight: 40,
            }}>
                {content || "(empty)"}
            </pre>
        </div>
    );
}

function StatusBanner({ color, label, meta }: { color: string; label: string; meta?: string }) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            background: `rgba(${color}, 0.08)`,
            border: `1px solid rgba(${color}, 0.25)`,
            borderRadius: 8,
            padding: "10px 14px",
        }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: `rgb(${color})` }}>{label}</span>
            {meta && <span style={{ fontSize: 12, color: "var(--db-text2)" }}>{meta}</span>}
        </div>
    );
}

export default function ExecutionResultPanel({ viewState, result, errorMessage }: Props) {
    if (viewState === "idle") return null;

    if (viewState === "running") {
        return (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--db-text2)", fontSize: 13, padding: "16px 0" }}>
                <LoaderCircle size={15} className="animate-spin" style={{ color: "var(--accent)" }} />
                Running…
            </div>
        );
    }

    if (viewState === "error") {
        return (
            <StatusBanner color="204,0,0" label={`Error: ${errorMessage}`} />
        );
    }

    // viewState === "done"
    if (!result) return null;

    const { statusId, statusDescription, stdout, stderr, compileOutput, executionTime, memoryUsed } = result;

    const meta = [
        executionTime ? `${executionTime}s` : null,
        memoryUsed    ? `${memoryUsed} KB`  : null,
    ].filter(Boolean).join(" · ");

    // Accepted
    if (statusId === 3) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <StatusBanner color="var(--lime-rgb)" label="Accepted" meta={meta} />
                <OutputBlock label="Output" content={stdout ?? ""} color="var(--lime)" />
            </div>
        );
    }

    // Time Limit Exceeded
    if (statusId === 5) {
        return <StatusBanner color="204,136,0" label="Time Limit Exceeded" meta={meta} />;
    }

    // Compilation Error
    if (statusId === 6) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <StatusBanner color="204,136,0" label="Compilation Error" />
                <OutputBlock label="Compiler output" content={compileOutput ?? ""} color="var(--amber)" />
            </div>
        );
    }

    // Wrong Answer or Runtime Error (statusId 4 or 7–12)
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <StatusBanner color="204,0,0" label={statusDescription} meta={meta} />
            {stdout  && <OutputBlock label="stdout"  content={stdout}  />}
            {stderr  && <OutputBlock label="stderr"  content={stderr}  color="var(--red)" />}
        </div>
    );
}
