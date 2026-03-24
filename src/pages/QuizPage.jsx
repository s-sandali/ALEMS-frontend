import { UserButton, useUser } from "@clerk/clerk-react";
import { ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function QuizPage() {
    const { algorithmId } = useParams();
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-bg">
            <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-bg/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img
                                src="/BIGO.png"
                                alt="BIGO Logo"
                                className="h-16 w-auto group-hover:scale-110 transition-transform"
                            />
                        </Link>
                        <div className="hidden items-center gap-2 text-sm text-text-secondary sm:flex">
                            <Link to="/algorithms" className="transition hover:text-white">
                                Algorithms
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-white">Quiz</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="hidden text-sm text-text-secondary md:inline">
                            {user?.primaryEmailAddress?.emailAddress}
                        </span>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-6 py-10">
                <section className="rounded-[2rem] border border-white/[0.06] bg-surface p-8 text-center sm:p-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                        Quiz
                    </p>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
                        Quiz route ready
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-text-secondary">
                        This placeholder route is set up for algorithm quiz flows. Current algorithm ID: {algorithmId}.
                    </p>
                </section>
            </main>
        </div>
    );
}
