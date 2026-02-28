import { cn } from "../../lib/utils";

/**
 * Displays earned and locked badges in a responsive grid.
 * @param {{ badges: Array<{ id: number, name: string, icon: string, earned: boolean }> }} props
 */
export default function BadgeSection({ badges }) {
    if (!badges || badges.length === 0) {
        return (
            <div className="rounded-xl border border-white/[0.06] bg-surface p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Badges</h3>
                <p className="text-sm text-text-secondary">
                    Complete modules to earn your first badge!
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/[0.06] bg-surface p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Badges</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-300",
                            badge.earned
                                ? "border-accent/20 bg-accent/5 hover:border-accent/40 hover:shadow-md hover:shadow-accent/10"
                                : "border-white/[0.04] bg-white/[0.02] opacity-40 grayscale"
                        )}
                    >
                        <span className="text-2xl">{badge.icon}</span>
                        <span
                            className={cn(
                                "text-xs font-medium text-center leading-tight",
                                badge.earned ? "text-white" : "text-text-secondary"
                            )}
                        >
                            {badge.name}
                        </span>
                        {badge.earned && (
                            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                                Earned
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
