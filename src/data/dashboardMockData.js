// Generate contribution data for the last 12 weeks (84 days)
function generateContributions() {
    const contributions = [];
    const today = new Date();

    for (let i = 83; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Simulate varying activity levels
        const rand = Math.random();
        let count = 0;
        if (rand > 0.4) count = Math.floor(Math.random() * 3) + 1;  // 1-3
        if (rand > 0.7) count = Math.floor(Math.random() * 4) + 3;  // 3-6
        if (rand > 0.9) count = Math.floor(Math.random() * 5) + 6;  // 6-10
        if (rand < 0.25) count = 0; // rest days

        contributions.push({
            date: date.toISOString().split("T")[0],
            count,
        });
    }
    return contributions;
}

export const mockDashboardData = {
    xpTotal: 420,
    modulesCompleted: 3,
    streak: 5,
    badges: [
        { id: 1, name: "First Login", icon: "🚀", earned: true },
        { id: 2, name: "Quick Learner", icon: "⚡", earned: true },
        { id: 3, name: "Algorithm Pro", icon: "🧠", earned: false },
        { id: 4, name: "Bug Hunter", icon: "🐛", earned: true },
        { id: 5, name: "Streak Master", icon: "🔥", earned: false },
        { id: 6, name: "Top Scorer", icon: "🏆", earned: false },
    ],
    contributions: generateContributions(),
};

// Empty state variant (0 modules)
export const mockEmptyState = {
    xpTotal: 0,
    modulesCompleted: 0,
    streak: 0,
    badges: [],
    contributions: Array.from({ length: 84 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (83 - i));
        return { date: date.toISOString().split("T")[0], count: 0 };
    }),
};
