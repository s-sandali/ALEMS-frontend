import DashboardNav from "@/components/dashboard/DashboardNav";
import ExploreAlgorithmsSection from "../components/algorithms/ExploreAlgorithmsSection";

export default function AlgorithmsPage() {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg)" }}>
            <DashboardNav />

            <main className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
                <div className="mb-8 max-w-3xl">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                        Explore
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                       Algorithm <span className="text-accent">Collection</span>
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
