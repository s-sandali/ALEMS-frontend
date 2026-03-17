import { useEffect, useState } from "react";
import { UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import AlgorithmIntroductionSection from "../components/algorithms/AlgorithmIntroductionSection";
import AlgorithmVisualizer from "../components/algorithms/AlgorithmVisualizer";
import { AlgorithmService, SimulationService } from "../lib/api";
import {
    getAlgorithmDifficulty,
    getAlgorithmSampleInput,
    getPrimaryComplexity,
    getSimulationAlgorithmKey,
} from "../lib/algorithmPresentation";

export default function AlgorithmDetailPage() {
    const { id } = useParams();
    const { getToken } = useAuth();
    const { user } = useUser();
    const [algorithm, setAlgorithm] = useState(null);
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [simulationError, setSimulationError] = useState("");
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;

        async function loadAlgorithmDetails() {
            try {
                setLoading(true);
                setError("");
                setSimulationError("");

                const response = await AlgorithmService.getById(Number(id), getToken);
                if (!isMounted) {
                    return;
                }

                const algorithmRecord = response?.data ?? null;
                setAlgorithm(algorithmRecord);

                if (!algorithmRecord) {
                    setError("Algorithm not found.");
                    return;
                }

                try {
                    const simulationResponse = await SimulationService.runSimulation(
                        getSimulationAlgorithmKey(algorithmRecord.name),
                        getAlgorithmSampleInput(algorithmRecord.name),
                        getToken,
                    );

                    if (!isMounted) {
                        return;
                    }

                    setSteps(Array.isArray(simulationResponse?.steps) ? simulationResponse.steps : []);
                    setCurrentStepIndex(0);
                } catch (runError) {
                    if (!isMounted) {
                        return;
                    }

                    setSteps([]);
                    setCurrentStepIndex(0);
                    setSimulationError(runError instanceof Error ? runError.message : "Simulation trace is not available yet.");
                }
            } catch (loadError) {
                if (!isMounted) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : "Failed to load algorithm details.");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadAlgorithmDetails();

        return () => {
            isMounted = false;
        };
    }, [getToken, id]);

    const difficulty = algorithm ? getAlgorithmDifficulty(algorithm.name) : "";
    const primaryComplexity = algorithm ? getPrimaryComplexity(algorithm) : "";

    return (
        <div className="min-h-screen bg-bg">
            <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-bg/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="text-xl font-bold tracking-tight text-accent">
                            BigO
                        </Link>
                        <div className="hidden items-center gap-2 text-sm text-text-secondary sm:flex">
                            <Link to="/algorithms" className="transition hover:text-white">
                                Algorithms
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-white">{algorithm?.name || "Details"}</span>
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

            <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 sm:py-10">
                {loading ? (
                    <div className="flex min-h-[50vh] items-center justify-center rounded-[2rem] border border-white/[0.06] bg-surface/60">
                        <span className="inline-flex items-center gap-3 text-sm text-text-secondary">
                            <LoaderCircle className="h-4 w-4 animate-spin text-accent" />
                            Loading algorithm details
                        </span>
                    </div>
                ) : error ? (
                    <div className="rounded-[2rem] border border-red-400/20 bg-red-400/5 p-8 text-sm text-red-200">
                        {error}
                    </div>
                ) : algorithm ? (
                    <>
                        <section className="rounded-[2rem] border border-white/[0.06] bg-surface p-6 sm:p-8 lg:p-10">
                            <div className="max-w-4xl">
                                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                                    {algorithm.category}
                                </p>
                                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                    {algorithm.name}
                                </h1>
                                <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary sm:text-lg">
                                    {algorithm.description}
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
                                        {primaryComplexity} avg
                                    </span>
                                    <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                                        {algorithm.timeComplexityBest} best
                                    </span>
                                    <span className="inline-flex rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-200">
                                        {algorithm.timeComplexityWorst} worst
                                    </span>
                                    <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                                        {difficulty}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <AlgorithmIntroductionSection
                            algorithmName={algorithm.name}
                            steps={steps}
                            currentStepIndex={currentStepIndex}
                            onStepChange={setCurrentStepIndex}
                        />

                        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
                            <AlgorithmVisualizer steps={steps} currentStepIndex={currentStepIndex} />

                            <aside className="rounded-[2rem] border border-white/[0.06] bg-surface p-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                                    Backend Trace
                                </p>
                                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
                                    Simulation snapshot
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-text-secondary">
                                    The visualizer requests a step trace from the backend API for a sample input, so the frontend never reimplements algorithm execution rules.
                                </p>

                                <div className="mt-6 rounded-2xl border border-white/[0.06] bg-bg/60 p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-secondary">Sample input</span>
                                        <span className="font-medium text-white">
                                            [{getAlgorithmSampleInput(algorithm.name).join(", ")}]
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="text-text-secondary">Steps returned</span>
                                        <span className="font-medium text-white">{steps.length}</span>
                                    </div>
                                </div>

                                {simulationError ? (
                                    <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm leading-6 text-amber-100">
                                        {simulationError}
                                    </div>
                                ) : (
                                    <div className="mt-6 rounded-2xl border border-accent/15 bg-accent/5 p-4 text-sm leading-6 text-text-secondary">
                                        The current route is ready for backend-powered walkthroughs as more simulation engines are added.
                                    </div>
                                )}
                            </aside>
                        </section>
                    </>
                ) : null}
            </main>
        </div>
    );
}
