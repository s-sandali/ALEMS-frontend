import { useState } from "react";
import { cn } from "../../lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS = 12;

/**
 * Returns the Tailwind background class based on activity count.
 */
function getCellColor(count) {
    if (count === 0) return "bg-white/[0.04]";
    if (count <= 2) return "bg-accent/20";
    if (count <= 5) return "bg-accent/50";
    return "bg-accent";
}

/**
 * GitHub-style contribution heatmap grid.
 * 7 rows (days) × 12 columns (weeks).
 * @param {{ contributions: Array<{ date: string, count: number }> }} props
 */
export default function ContributionGrid({ contributions }) {
    const [tooltip, setTooltip] = useState(null);

    // Arrange data into a 7×12 grid (columns = weeks, rows = days)
    const grid = [];
    for (let week = 0; week < WEEKS; week++) {
        const weekData = [];
        for (let day = 0; day < 7; day++) {
            const index = week * 7 + day;
            weekData.push(contributions[index] || { date: "", count: 0 });
        }
        grid.push(weekData);
    }

    return (
        <div className="rounded-xl border border-white/[0.06] bg-surface p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-lg font-semibold text-white">Activity</h3>
                    <p className="text-sm text-text-secondary mt-0.5">
                        Daily contribution heatmap
                    </p>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-white/[0.04]" />
                    <div className="w-3 h-3 rounded-sm bg-accent/20" />
                    <div className="w-3 h-3 rounded-sm bg-accent/50" />
                    <div className="w-3 h-3 rounded-sm bg-accent" />
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-1">
                {/* Day labels column */}
                <div className="flex flex-col gap-1 mr-2 pt-0.5">
                    {DAYS.map((day) => (
                        <div
                            key={day}
                            className="h-[14px] flex items-center text-[10px] text-text-secondary leading-none"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid columns (weeks) */}
                {grid.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((cell, dayIndex) => (
                            <div
                                key={`${weekIndex}-${dayIndex}`}
                                className={cn(
                                    "w-[14px] h-[14px] rounded-sm cursor-pointer transition-all duration-200",
                                    "hover:ring-1 hover:ring-accent/60 hover:scale-125",
                                    getCellColor(cell.count)
                                )}
                                onMouseEnter={(e) => {
                                    const rect = e.target.getBoundingClientRect();
                                    setTooltip({
                                        date: cell.date,
                                        count: cell.count,
                                        x: rect.left + rect.width / 2,
                                        y: rect.top - 8,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 border border-white/10 rounded-lg shadow-xl pointer-events-none -translate-x-1/2 -translate-y-full"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <span className="text-accent font-semibold">{tooltip.count}</span>{" "}
                    {tooltip.count === 1 ? "activity" : "activities"} on{" "}
                    <span className="text-white/70">{tooltip.date}</span>
                </div>
            )}
        </div>
    );
}
