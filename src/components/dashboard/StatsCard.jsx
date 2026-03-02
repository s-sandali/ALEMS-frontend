import { cn } from "../../lib/utils";

/**
 * A single stat card for the top row of the dashboard.
 * @param {{ title: string, value: string|number, icon: React.ReactNode, subtitle?: string, className?: string }} props
 */
export default function StatsCard({ title, value, icon, subtitle, className }) {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl border border-white/[0.06] bg-surface p-6",
                "transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
                className
            )}
        >
            {/* Subtle gradient glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-white tracking-tight">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-text-secondary mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                    {icon}
                </div>
            </div>
        </div>
    );
}
