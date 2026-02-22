import {
    Play,
    Code2,
    Zap,
    Trophy,
    BarChart3,
    Rewind,
    Star,
    Award,
    TrendingUp,
    Users,
    Shield,
    Activity,
    BookOpen,
    Cpu,
} from "lucide-react";

// ─── Navigation ───────────────────────────────────────────────────────────────
export const NAV_LINKS = ["Features", "Algorithms", "How It Works", "Leaderboard"];

// ─── Algorithms ───────────────────────────────────────────────────────────────
export const ALGORITHMS = [
    {
        name: "Bubble Sort",
        desc: "Repeatedly swaps adjacent elements until sorted",
        complexity: "O(n²)",
        tag: "Beginner",
        tagColor: "from-green-500 to-emerald-400",
        accentColor: "#10b981",
        icon: "🔵",
    },
    {
        name: "Binary Search",
        desc: "Halves the search space with each comparison",
        complexity: "O(log n)",
        tag: "Intermediate",
        tagColor: "from-blue-500 to-cyan-400",
        accentColor: "#3b82f6",
        icon: "🔍",
    },
    {
        name: "Quick Sort",
        desc: "Partition-based divide-and-conquer sorting",
        complexity: "O(n log n)",
        tag: "Intermediate",
        tagColor: "from-violet-500 to-purple-400",
        accentColor: "#7c3aed",
        icon: "⚡",
    },
    {
        name: "Merge Sort",
        desc: "Stable sort by recursive merging of halves",
        complexity: "O(n log n)",
        tag: "Advanced",
        tagColor: "from-orange-500 to-red-400",
        accentColor: "#f97316",
        icon: "🔀",
    },
];

// ─── Features ─────────────────────────────────────────────────────────────────
export const FEATURES = [
    {
        Icon: Play,
        title: "Step-by-Step Visualisation",
        desc: "Watch each algorithm execute, one step at a time",
        color: "#3b82f6",
    },
    {
        Icon: Code2,
        title: "Code Sync Panel",
        desc: "Pseudocode highlights in sync with every animation frame",
        color: "#7c3aed",
    },
    {
        Icon: Zap,
        title: "Gamified Quizzes",
        desc: "Predict the next step. Earn XP. Unlock badges.",
        color: "#06b6d4",
    },
    {
        Icon: Trophy,
        title: "XP & Badge System",
        desc: "Progress milestones keep students motivated",
        color: "#f59e0b",
    },
    {
        Icon: BarChart3,
        title: "Performance Analytics",
        desc: "Instructors get full dashboards and exportable reports",
        color: "#10b981",
    },
    {
        Icon: Rewind,
        title: "Playback Controls",
        desc: "Speed slider, step-forward, step-backward, and replay",
        color: "#f97316",
    },
];

// ─── How It Works Steps ───────────────────────────────────────────────────────
export const STEPS = [
    {
        num: "01",
        title: "Register & Choose",
        desc: "Pick an algorithm to explore from our curated library of 4 core algorithms",
        color: "#3b82f6",
    },
    {
        num: "02",
        title: "Visualise & Sync",
        desc: "Watch it execute step-by-step with live pseudocode highlighting",
        color: "#7c3aed",
    },
    {
        num: "03",
        title: "Quiz & Earn XP",
        desc: "Test yourself, earn experience points, and track your leaderboard rank",
        color: "#06b6d4",
    },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
export const STATS = [
    { label: "Algorithms", value: 4, suffix: "", icon: Cpu },
    { label: "Concurrent Users Supported", value: 100, suffix: "+", icon: Users },
    { label: "Test Coverage", value: 70, suffix: "%", icon: Shield },
    { label: "Uptime SLA", value: 99, suffix: "%", icon: Activity },
];

// ─── Dashboard Preview ───────────────────────────────────────────────────────
export const BADGES = [
    { icon: Star, label: "First Sort", awarded: true, color: "#f59e0b" },
    { icon: Zap, label: "Speed Run", awarded: true, color: "#3b82f6" },
    { icon: Trophy, label: "Quiz Master", awarded: true, color: "#7c3aed" },
    { icon: BookOpen, label: "Bookworm", awarded: false, color: "#6b7280" },
    { icon: TrendingUp, label: "Top 10%", awarded: false, color: "#6b7280" },
    { icon: Award, label: "Perfectionist", awarded: false, color: "#6b7280" },
];

export const QUIZ_SCORES = [
    { algo: "Bubble Sort", score: 95, color: "#10b981" },
    { algo: "Binary Search", score: 80, color: "#3b82f6" },
    { algo: "Quick Sort", score: 65, color: "#7c3aed" },
    { algo: "Merge Sort", score: 40, color: "#f97316" },
];

// ─── Sort Bar Colors for Hero Animation ───────────────────────────────────────
export const BAR_COLORS = [
    "#3b82f6", // blue
    "#7c3aed", // violet
    "#06b6d4", // cyan
    "#10b981", // green
    "#f59e0b", // amber
    "#f97316", // orange
    "#ec4899", // pink
];
