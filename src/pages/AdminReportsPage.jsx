import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { Download, FileDown, LoaderCircle, ShieldAlert, Table2 } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/button";
import { useRole } from "../context/RoleContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5181/api";

function formatDateInput(date) {
    return date.toLocaleDateString("en-CA");
}

function subtractDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() - days);
    return nextDate;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
    const { getToken } = useAuth();
    const role = useRole();
    const navigate = useNavigate();

    const today = useMemo(() => new Date(), []);
    const [startDate, setStartDate] = useState(formatDateInput(subtractDays(today, 30)));
    const [endDate, setEndDate] = useState(formatDateInput(today));
    const [format, setFormat] = useState("csv");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (role !== "Admin") {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate, role]);

    async function handleDownload() {
        setError("");
        setSuccessMessage("");

        if (!startDate || !endDate) {
            setError("Please select both start and end dates.");
            return;
        }

        if (startDate > endDate) {
            setError("Invalid date range. Start date must be on or before end date.");
            return;
        }

        setLoading(true);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("No valid session token found. User might be signed out.");
            }

            const params = new URLSearchParams({
                format,
                startDate,
                endDate,
            });

            const response = await fetch(`${API_BASE_URL}/admin/reports?${params.toString()}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                let message = `Failed to download report (${response.status})`;

                try {
                    const data = await response.json();
                    message = data?.error || data?.message || message;
                } catch {
                    const text = await response.text();
                    if (text) message = text;
                }

                throw new Error(message);
            }

            const blob = await response.blob();
            const filename = `admin-report-${startDate}-${endDate}.${format}`;
            downloadBlob(blob, filename);
            setSuccessMessage(`Your ${format.toUpperCase()} report has been downloaded.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to download report.");
        } finally {
            setLoading(false);
        }
    }

    if (role !== "Admin") {
        return (
            <div style={{
                minHeight: "100vh",
                background: "var(--bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 12,
                padding: 24,
            }}>
                <ShieldAlert size={40} color="#ff5a5a" />
                <p style={{ color: "#ff9a9a", fontSize: 15 }}>Admin access required.</p>
                <Link to="/dashboard" style={{ color: "var(--primary)", fontSize: 13, textDecoration: "none" }}>
                    Back to Dashboard
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
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
                        gap: 24,
                        alignItems: "start",
                    }}
                >
                    <section style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                                Admin Panel
                            </p>
                            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                                Report <span style={{ color: "var(--primary)" }}>Export</span>
                            </h1>
                            <p className="mt-4 text-base leading-7 text-text-secondary">
                                Choose a date range and download a formatted report in CSV or PDF.
                            </p>
                        </div>

                        {error ? (
                            <div style={{
                                background: "rgba(255,90,90,0.06)",
                                border: "1px solid rgba(255,90,90,0.2)",
                                borderRadius: 12,
                                padding: "16px 20px",
                                color: "#ff9a9a",
                                fontSize: 14,
                            }}>
                                {error}
                            </div>
                        ) : null}

                        {successMessage ? (
                            <div style={{
                                background: "rgba(var(--primary-rgb),0.08)",
                                border: "1px solid rgba(var(--primary-rgb),0.2)",
                                borderRadius: 12,
                                padding: "16px 20px",
                                color: "#dfff7b",
                                fontSize: 14,
                            }}>
                                {successMessage}
                            </div>
                        ) : null}

                        <div
                            className="rounded-3xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--db-border)",
                            }}
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                                    <FileDown className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">Export Controls</p>
                                    <p className="text-sm text-text-secondary">Download a CSV or PDF copy of the report.</p>
                                </div>
                            </div>

                            <div style={{ display: "grid", gap: 16 }}>
                                <label style={{ display: "grid", gap: 8 }}>
                                    <span className="text-sm font-medium text-text-secondary">Start date</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        max={endDate}
                                        onChange={(event) => setStartDate(event.target.value)}
                                        style={{
                                            width: "100%",
                                            background: "var(--db-bg3)",
                                            border: "1px solid var(--db-border2)",
                                            borderRadius: 12,
                                            padding: "12px 14px",
                                            color: "var(--db-text)",
                                            fontSize: 14,
                                            outline: "none",
                                        }}
                                    />
                                </label>

                                <label style={{ display: "grid", gap: 8 }}>
                                    <span className="text-sm font-medium text-text-secondary">End date</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        min={startDate}
                                        onChange={(event) => setEndDate(event.target.value)}
                                        style={{
                                            width: "100%",
                                            background: "var(--db-bg3)",
                                            border: "1px solid var(--db-border2)",
                                            borderRadius: 12,
                                            padding: "12px 14px",
                                            color: "var(--db-text)",
                                            fontSize: 14,
                                            outline: "none",
                                        }}
                                    />
                                </label>

                                <label style={{ display: "grid", gap: 8 }}>
                                    <span className="text-sm font-medium text-text-secondary">Format</span>
                                    <select
                                        value={format}
                                        onChange={(event) => setFormat(event.target.value)}
                                        style={{
                                            width: "100%",
                                            background: "var(--db-bg3)",
                                            border: "1px solid var(--db-border2)",
                                            borderRadius: 12,
                                            padding: "12px 14px",
                                            color: "var(--db-text)",
                                            fontSize: 14,
                                            outline: "none",
                                        }}
                                    >
                                        <option value="csv">CSV</option>
                                        <option value="pdf">PDF</option>
                                    </select>
                                </label>

                                <div className="flex flex-wrap gap-3 pt-2">
                                    <Button
                                        onClick={handleDownload}
                                        disabled={loading}
                                        className="min-w-[180px]"
                                    >
                                        {loading ? (
                                            <>
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                Preparing download...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4" />
                                                Download report
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside
                        className="rounded-3xl p-6"
                        style={{
                            background: "linear-gradient(180deg, color-mix(in srgb, var(--accent) 12%, transparent), color-mix(in srgb, var(--surface) 92%, transparent))",
                            border: "1px solid color-mix(in srgb, var(--accent) 20%, var(--border))",
                        }}
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-accent">
                                <Table2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-text-primary">Download Notes</p>
                                <p className="text-sm text-text-secondary">Use the same date range for both formats.</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm leading-6 text-text-secondary">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                CSV is ideal for spreadsheets and quick analysis.
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                PDF is formatted for sharing or printing.
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                Empty results still download as a valid empty file.
                            </div>
                        </div>
                    </aside>
                </motion.div>
            </main>
        </div>
    );
}
