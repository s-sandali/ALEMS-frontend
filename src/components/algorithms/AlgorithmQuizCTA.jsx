import { ArrowRight, Clock3, HelpCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getAlgorithmQuizMetadata } from "../../lib/algorithmPresentation";

function QuizStat({ icon: Icon, value, label }) {
    return (
        <div className="flex min-w-[96px] flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/15 bg-accent/10 text-accent">
                <Icon className="h-4 w-4" />
            </div>
            <div className="text-center">
                <div className="text-3xl font-bold tracking-tight text-accent">
                    {value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-text-secondary">
                    {label}
                </div>
            </div>
        </div>
    );
}

export default function AlgorithmQuizCTA({ algorithm }) {
    const navigate = useNavigate();
    const quiz = getAlgorithmQuizMetadata(algorithm.name);
    const isQuizAvailable = typeof algorithm?.quizAvailable === "boolean"
        ? algorithm.quizAvailable
        : quiz.available;

    return (
        <section className="rounded-[2rem] border border-white/[0.06] bg-surface p-6 sm:p-8 lg:p-10">
            <div >
                <p className="text-s font-semibold uppercase tracking-[0.3em] text-accent">
                    05 - Challenge
                </p>

                <div className="mt-5 rounded-[1.75rem] border border-white/[0.08] bg-bg/40 px-6 py-8 text-center sm:px-10 sm:py-10">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Ready to test your <span className="text-accent">knowledge</span>?
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                        Take a short challenge for {algorithm.name} and Earn XP for each correct answer and track your mastery on your dashboard..
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
                        <QuizStat icon={HelpCircle} value={quiz.questionCount} label="Questions" />
                        <QuizStat icon={Zap} value={`+${quiz.xpReward}`} label="XP Reward" />
                        <QuizStat icon={Clock3} value={`~${quiz.timeMinutes}`} label="Minutes" />
                    </div>

                    {isQuizAvailable ? (
                        <button
                            type="button"
                            onClick={() => navigate(`/quiz/${algorithm.algorithmId}`)}
                            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-bg transition hover:shadow-lg hover:shadow-accent/20"
                        >
                            Start Quiz Challenge
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <div className="mt-8 inline-flex rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-3 text-sm font-semibold text-text-secondary">
                            Coming Soon
                        </div>
                    )}

                    <p className="mt-5 text-sm text-text-secondary">
                        {isQuizAvailable
                            ? "Challenge route is ready for the quiz experience."
                            : "This quiz has not been published yet."}
                    </p>
                </div>
            </div>
        </section>
    );
}
