import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { AlgorithmService } from "../../lib/api";
import { cn } from "../../lib/utils";
import { getAlgorithmDifficulty, getAlgorithmIcon, getPrimaryComplexity } from "../../lib/algorithmPresentation";

function AlgorithmCard({ algorithm, onClick }) {
    const Icon = getAlgorithmIcon(algorithm.name);
    const difficulty = getAlgorithmDifficulty(algorithm.name);
    const complexity = getPrimaryComplexity(algorithm);

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "group algo-card relative overflow-hidden rounded-3xl border p-6 text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            )}
            style={{ borderColor: "var(--db-border)", background: "var(--surface)" }}
        >
            <div className="absolute inset-0 bg-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex h-full flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/15 bg-accent/10 text-accent">
                        <Icon className="h-5 w-5" />
                    </div>
                    <span
                        className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
                        style={{ border: "1px solid var(--db-border)", background: "var(--db-bg3)", color: "var(--db-text2)" }}
                    >
                        {algorithm.category}
                    </span>
                </div>

                <div className="space-y-2">
                    <h3
                        className="text-2xl font-bold tracking-tight transition-colors duration-300 group-hover:text-accent"
                        style={{ color: "var(--db-text)" }}
                    >
                        {algorithm.name}
                    </h3>
                    <p className="text-sm leading-6 text-text-secondary">
                        {algorithm.description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                        {complexity} avg
                    </span>
                    <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                        style={{ border: "1px solid var(--blue-dim)", background: "var(--blue-dim)", color: "var(--blue)" }}
                    >
                        {difficulty}
                    </span>
                </div>

                <div
                    className="mt-auto flex items-center justify-between pt-4"
                    style={{ borderTop: "1px solid var(--db-border)" }}
                >
                    <div className="text-xs uppercase tracking-[0.24em] text-text-secondary">
                        Explore Algorithm
                    </div>
                    <span
                        className="flex items-center gap-2 text-sm font-medium transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
                        style={{ color: "var(--db-text)" }}
                    >
                        View
                        <ArrowRight className="h-4 w-4" />
                    </span>
                </div>
            </div>
        </button>
    );
}

export default function ExploreAlgorithmsSection({
    title = "Explore Algorithms",
    description = "Browse the algorithm library, compare complexity, and jump into step-by-step simulations backed by the API.",
    limit,
    showViewAll = false,
    className,
}) {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [algorithms, setAlgorithms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadAlgorithms() {
            try {
                setLoading(true);
                setError("");

                const response = await AlgorithmService.getAll(getToken);
                if (!isMounted) {
                    return;
                }

                setAlgorithms(Array.isArray(response?.data) ? response.data : []);
            } catch (loadError) {
                if (!isMounted) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : "Failed to load algorithms.");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadAlgorithms();

        return () => {
            isMounted = false;
        };
    }, [getToken]);

    const visibleAlgorithms = useMemo(() => {
        const filteredAlgorithms = algorithms.filter((algorithm) => {
            const normalizedName = algorithm?.name?.trim().toLowerCase();
            return normalizedName !== "linear search" && normalizedName !== "linera search";
        });

        if (!limit) {
            return filteredAlgorithms;
        }

        return filteredAlgorithms.slice(0, limit);
    }, [algorithms, limit]);

    return (
        <section
            className={cn("rounded-[2rem] p-6 sm:p-8", className)}
            style={{ border: "1px solid var(--db-border)", background: "var(--db-bg2)" }}
        >
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                        Algorithm Library
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--db-text)" }}>
                        {title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-text-secondary sm:text-base">
                        {description}
                    </p>
                </div>

                {showViewAll && visibleAlgorithms.length > (limit || 0) && (
                    <button
                        type="button"
                        onClick={() => navigate("/algorithms")}
                        className="inline-flex items-center gap-2 self-start rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent/40 hover:bg-accent/15"
                    >
                        View All
                        <ArrowRight className="h-4 w-4" />
                    </button>
                )}
            </div>

            {loading ? (
                <div
                    className="flex min-h-56 items-center justify-center rounded-3xl border border-dashed px-4 text-sm text-text-secondary"
                    style={{ borderColor: "var(--db-border)", background: "var(--db-bg3)" }}
                >
                    <span className="inline-flex items-center gap-3">
                        <LoaderCircle className="h-4 w-4 animate-spin text-accent" />
                        Loading algorithm library
                    </span>
                </div>
            ) : error ? (
                <div
                    className="rounded-3xl p-6 text-sm"
                    style={{ border: "1px solid var(--red-dim)", background: "var(--red-dim)", color: "var(--red)" }}
                >
                    {error}
                </div>
            ) : visibleAlgorithms.length === 0 ? (
                <div
                    className="rounded-3xl border border-dashed p-6 text-sm text-text-secondary"
                    style={{ borderColor: "var(--db-border)", background: "var(--db-bg3)" }}
                >
                    No algorithms are available yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {visibleAlgorithms.map((algorithm) => (
                        <AlgorithmCard
                            key={algorithm.algorithmId}
                            algorithm={algorithm}
                            onClick={() => navigate(`/algorithms/${algorithm.algorithmId}`)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
