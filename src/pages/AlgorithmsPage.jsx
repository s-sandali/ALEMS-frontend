import { UserButton, useUser } from "@clerk/clerk-react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import ExploreAlgorithmsSection from "../components/algorithms/ExploreAlgorithmsSection";

export default function AlgorithmsPage() {
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
                            <Link to="/dashboard" className="transition hover:text-white">
                                Dashboard
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-white">Algorithms</span>
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

            <main className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
                <div className="mb-8 max-w-3xl">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                        Explore
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Related algorithms to keep learning momentum
                    </h1>
                    <p className="mt-4 text-base leading-7 text-text-secondary">
                        Review the library, compare time complexity, and open a dedicated route for each algorithm to inspect backend-powered simulation traces.
                    </p>
                </div>

                <ExploreAlgorithmsSection
                    title="Algorithm Collection"
                    description="Each card surfaces the essentials first: name, average complexity, and difficulty. Open a route to continue into the algorithm detail view."
                />
            </main>
        </div>
    );
}
