import { cn } from "../../lib/utils";

/**
 * Displays earned and locked badges in a responsive grid.
 * @param {{ badges: Array<{ id: number, name: string, icon: string, earned: boolean, awardDate?: string }> }} props
 */
export default function BadgeSection({ badges }) {
    if (!badges || badges.length === 0) {
        return (
            <div className="rounded-xl border border-white/[0.06] bg-surface p-6">
                 <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">Badges</h1>
                <p className="text-sm text-text-secondary">
                    Complete modules to earn your first badge!
                </p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch {
            return null;
        }
    };

    return (
        <div className="rounded-xl border border-white/[0.06] bg-surface p-6">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">Badges</h1>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {badges.map((badge) => {
                    const awardedDate = formatDate(badge.awardDate);
                    
                    return (
                        <div
                            key={badge.id}
                            className={cn(
                                "min-w-0 flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all duration-300",
                                badge.earned
                                    ? "border-accent/20 bg-accent/5 hover:border-accent/40 hover:shadow-md hover:shadow-accent/10"
                                    : "border-white/[0.06] bg-white/[0.01] grayscale"
                            )}
                            title={badge.earned && awardedDate ? `Earned on ${awardedDate}` : undefined}
                        >
                            <span className="text-2xl">{badge.icon}</span>
                            <span
                                className={cn(
                                    "break-words text-xs font-medium leading-tight",
                                    badge.earned ? "text-white" : "text-text-secondary"
                                )}
                                style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                            >
                                {badge.name}
                            </span>
                            {badge.earned && (
                                <>
                                    <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                                        Earned
                                    </span>
                                    {awardedDate && (
                                        <span className="text-[9px] text-text-secondary">
                                            {awardedDate}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
