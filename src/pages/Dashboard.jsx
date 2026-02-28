import { useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Zap, BookOpen, Flame, ArrowRight } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import ContributionGrid from "../components/dashboard/ContributionGrid";
import BadgeSection from "../components/dashboard/BadgeSection";
import { mockDashboardData } from "../data/dashboardMockData";

export default function Dashboard() {
    const { user } = useUser();
    const navigate = useNavigate();
    const data = mockDashboardData;

    const firstName = user?.firstName || user?.username || "Learner";
    const hasModules = data.modulesCompleted > 0;

    return (
        <div className="min-h-screen bg-bg">
            {/* Top nav bar */}
            <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-bg/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-accent tracking-tight">
                            BigO
                        </span>
                        <span className="text-sm text-text-secondary hidden sm:inline">
                            / Dashboard
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-text-secondary hidden md:inline">
                            {user?.primaryEmailAddress?.emailAddress}
                        </span>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Welcome back,{" "}
                        <span className="text-accent">{firstName}</span>
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Here&apos;s your learning progress at a glance.
                    </p>
                </div>

                {/* Empty state */}
                {!hasModules && (
                    <div className="mb-8 rounded-xl border border-accent/20 bg-accent/5 p-8 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-accent" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            You haven&apos;t started learning yet.
                        </h2>
                        <p className="text-text-secondary mb-6 max-w-md mx-auto">
                            Begin your journey into algorithms and data structures.
                            Track your progress and earn badges along the way!
                        </p>
                        <button
                            onClick={() => navigate("/algorithms")}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-bg font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Start Learning
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats cards row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <StatsCard
                        title="Total XP"
                        value={data.xpTotal.toLocaleString()}
                        icon={<Zap className="w-5 h-5" />}
                        subtitle="Experience points earned"
                    />
                    <StatsCard
                        title="Modules Completed"
                        value={data.modulesCompleted}
                        icon={<BookOpen className="w-5 h-5" />}
                        subtitle={`${data.modulesCompleted} of 12 modules`}
                    />
                    <StatsCard
                        title="Current Streak"
                        value={`${data.streak} days`}
                        icon={<Flame className="w-5 h-5" />}
                        subtitle="Keep it going!"
                    />
                </div>

                {/* Contribution heatmap */}
                <div className="mb-8">
                    <ContributionGrid contributions={data.contributions} />
                </div>

                {/* Badges section */}
                <BadgeSection badges={data.badges} />
            </main>
        </div>
    );
}
