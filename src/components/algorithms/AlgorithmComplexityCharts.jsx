import { useMemo } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { getComplexityChartData, getSpaceComplexity } from "../../lib/algorithmPresentation";

const chartTheme = {
    accent: "var(--accent)",
    textPrimary: "var(--text-primary)",
    textSecondary: "var(--text-secondary)",
    border: "rgba(255,255,255,0.1)",
    surface: "var(--surface)",
    average: "#f59e0b",
    worst: "#f87171",
    info: "#60a5fa",
    success: "#a3e635",
};

function normalizeComplexityLabel(label) {
    return label
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace("Â²", "^2");
}

function ChartTooltip({ active, payload, label, labelFormatter, colors }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div
            className="rounded-2xl border px-4 py-3 shadow-xl"
            style={{
                background: colors.surface,
                borderColor: colors.border,
            }}
        >
            <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                n = {label}
            </p>
            <p className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                {labelFormatter}
            </p>
            <div className="mt-3 space-y-2">
                {payload.map((entry) => (
                    <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
                        <span style={{ color: entry.color }}>{entry.name}</span>
                        <span style={{ color: colors.textPrimary }}>{entry.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SummaryRows({ rows }) {
    return (
        <div className="mt-6 space-y-3">
            {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-text-secondary">{row.label}</span>
                    <span className={row.valueClassName}>{row.value}</span>
                </div>
            ))}
        </div>
    );
}

function ComplexityChartCard({
    eyebrow,
    title,
    description,
    data,
    lines,
    colors,
    footer,
    summaryRows,
}) {
    return (
        <article className="rounded-[2rem] border border-white/[0.06] bg-surface p-6 sm:p-7">
            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-secondary">
                    {eyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">
                    {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">
                    {description}
                </p>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
                        <CartesianGrid stroke={colors.border} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="n"
                            label={{
                                value: "n (input size)",
                                position: "insideBottom",
                                offset: -6,
                                fill: colors.textSecondary,
                                fontSize: 12,
                            }}
                            tick={{ fill: colors.textSecondary, fontSize: 12 }}
                            axisLine={{ stroke: colors.border }}
                            tickLine={{ stroke: colors.border }}
                        />
                        <YAxis
                            label={{
                                value: "operations",
                                angle: -90,
                                position: "insideLeft",
                                fill: colors.textSecondary,
                                fontSize: 12,
                            }}
                            tick={{ fill: colors.textSecondary, fontSize: 12 }}
                            axisLine={{ stroke: colors.border }}
                            tickLine={{ stroke: colors.border }}
                        />
                        <Tooltip content={<ChartTooltip colors={colors} labelFormatter={footer} />} />
                        <Legend
                            wrapperStyle={{
                                color: colors.textSecondary,
                                fontSize: "12px",
                                paddingTop: "16px",
                            }}
                        />
                        {lines.map((line) => (
                            <Line
                                key={line.dataKey}
                                type="monotone"
                                dataKey={line.dataKey}
                                name={line.name}
                                stroke={line.stroke}
                                strokeWidth={2.5}
                                strokeDasharray={line.strokeDasharray}
                                dot={{ r: 3, strokeWidth: 0, fill: line.stroke }}
                                activeDot={{ r: 5, strokeWidth: 0, fill: line.stroke }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <SummaryRows rows={summaryRows} />
        </article>
    );
}

function getAnalysisCopy(algorithm) {
    const normalizedName = algorithm.name.trim().toLowerCase();
    const best = algorithm.timeComplexityBest || "O(n)";
    const average = algorithm.timeComplexityAverage || algorithm.timeComplexityWorst || "O(n)";
    const worst = algorithm.timeComplexityWorst || algorithm.timeComplexityAverage || "O(n)";
    const space = getSpaceComplexity(algorithm.name);

    if (normalizedName === "bubble sort") {
        return {
            eyebrow: "02 - Analysis",
            title: "Time & Space Complexity",
            description:
                "For each pass, Bubble Sort compares adjacent values across the unsorted region. That leads to quadratic average and worst-case work, while an optimized early-exit version finishes in linear time when no swaps are needed.",
            timeCard: {
                eyebrow: "Time Complexity - Comparisons vs N",
                title: "Comparison growth",
                description: "The chart contrasts Bubble Sort's best-case linear pass against its quadratic average and worst-case behavior as the input grows.",
                footer: "Normalized comparisons by input size",
                summaryRows: [
                    { label: "Best case (already sorted)", value: best, valueClassName: "font-semibold text-accent" },
                    { label: "Average case", value: average, valueClassName: "font-semibold text-amber-300" },
                    { label: "Worst case (reverse order)", value: worst, valueClassName: "font-semibold text-red-300" },
                ],
            },
            spaceCard: {
                eyebrow: "Space Complexity - In-place Sort",
                title: "Memory profile",
                description: "Bubble Sort swaps values inside the original array, so its extra memory stays constant while the input itself grows linearly with n.",
                footer: "Auxiliary memory vs input footprint",
                summaryRows: [
                    { label: "Auxiliary space", value: space, valueClassName: "font-semibold text-accent" },
                    { label: "Algorithm type", value: "In-place", valueClassName: "font-semibold text-blue-300" },
                    { label: "Stability", value: "Stable", valueClassName: "font-semibold text-lime-300" },
                ],
            },
        };
    }

    const isInPlace = ["o(1)", "o(logn)"].includes(normalizeComplexityLabel(space));

    return {
        eyebrow: "02 - Analysis",
        title: "Time & Space Complexity",
        description:
            `${algorithm.name} can be compared across best, average, and worst-case growth. The charts below summarize how runtime scales with larger inputs and how much extra memory the algorithm typically needs.`,
        timeCard: {
            eyebrow: "Time Complexity - Growth vs N",
            title: "Runtime growth",
            description: "Best, average, and worst-case complexity curves are normalized to show how execution cost expands as input size increases.",
            footer: "Normalized runtime growth",
            summaryRows: [
                { label: "Best case", value: best, valueClassName: "font-semibold text-accent" },
                { label: "Average case", value: average, valueClassName: "font-semibold text-amber-300" },
                { label: "Worst case", value: worst, valueClassName: "font-semibold text-red-300" },
            ],
        },
        spaceCard: {
            eyebrow: "Space Complexity - Memory Use",
            title: "Memory profile",
            description: "The memory chart contrasts auxiliary storage against the input footprint so it is easier to read whether the algorithm works mostly in place or allocates extra room.",
            footer: "Auxiliary memory vs input footprint",
            summaryRows: [
                { label: "Auxiliary space", value: space, valueClassName: "font-semibold text-accent" },
                { label: "Algorithm type", value: isInPlace ? "Mostly in-place" : "Uses extra memory", valueClassName: "font-semibold text-blue-300" },
                { label: "Stability", value: normalizedName.includes("merge") ? "Stable" : "Depends on implementation", valueClassName: "font-semibold text-lime-300" },
            ],
        },
    };
}

export default function AlgorithmComplexityCharts({ algorithm }) {
    const colors = chartTheme;
    const chartData = useMemo(() => getComplexityChartData(algorithm), [algorithm]);
    const analysisCopy = useMemo(() => getAnalysisCopy(algorithm), [algorithm]);

    const timeLines = useMemo(() => ([
        {
            dataKey: "best",
            name: `${chartData.timeLabels.best} best`,
            stroke: colors.accent,
        },
        {
            dataKey: "average",
            name: `${chartData.timeLabels.average} avg`,
            stroke: colors.average,
        },
        {
            dataKey: "worst",
            name: `${chartData.timeLabels.worst} worst`,
            stroke: colors.worst,
        },
    ]), [chartData.timeLabels, colors.accent, colors.average, colors.worst]);

    const spaceLines = useMemo(() => ([
        {
            dataKey: "space",
            name: `${chartData.spaceLabel} auxiliary`,
            stroke: colors.accent,
        },
        {
            dataKey: "input",
            name: "O(n) input",
            stroke: colors.info,
            strokeDasharray: "4 4",
        },
    ]), [chartData.spaceLabel, colors.accent, colors.info]);

    const spaceData = useMemo(
        () => chartData.spaceData.map((entry) => ({
            ...entry,
            input: entry.n,
        })),
        [chartData.spaceData],
    );

    return (
        <section className="rounded-[2rem] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-6 sm:p-8 lg:p-10">
            <div className="max-w-4xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                    {analysisCopy.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {analysisCopy.title}
                </h2>
                <p className="mt-5 text-base leading-8 text-text-secondary">
                    {analysisCopy.description}
                </p>
            </div>

            <div className="mt-10 grid gap-6 xl:grid-cols-2">
                <ComplexityChartCard
                    eyebrow={analysisCopy.timeCard.eyebrow}
                    title={analysisCopy.timeCard.title}
                    description={analysisCopy.timeCard.description}
                    data={chartData.timeData}
                    lines={timeLines}
                    colors={colors}
                    footer={analysisCopy.timeCard.footer}
                    summaryRows={analysisCopy.timeCard.summaryRows}
                />

                <ComplexityChartCard
                    eyebrow={analysisCopy.spaceCard.eyebrow}
                    title={analysisCopy.spaceCard.title}
                    description={analysisCopy.spaceCard.description}
                    data={spaceData}
                    lines={spaceLines}
                    colors={colors}
                    footer={analysisCopy.spaceCard.footer}
                    summaryRows={analysisCopy.spaceCard.summaryRows}
                />
            </div>
        </section>
    );
}
