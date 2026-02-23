import {
    Play,
    Code2,
    Zap,
    Trophy,
    BarChart3,
    Bubbles,
    Rewind,
    Star,
    Award,
    TrendingUp,
    Users,
    Shield,
    Activity,
    BookOpen,
    Cpu,
    Circle,
    Search,
    GitMerge,
    FileQuestionMark,
    Code,
} from "lucide-react";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const ACCENT = "#D5FF40";

// ─── Navigation ───────────────────────────────────────────────────────────────
export const NAV_LINKS = ["Features", "Algorithms", "How It Works", "Leaderboard"];

// ─── Algorithms ───────────────────────────────────────────────────────────────
export const ALGORITHMS = [
    {
        name: "Bubble Sort",
        desc: "Repeatedly swaps adjacent elements until sorted",
        complexity: "O(n²)",
        tag: "Beginner",
        accentColor: ACCENT,
        icon: Bubbles,
    },
    {
        name: "Binary Search",
        desc: "Halves the search space with each comparison",
        complexity: "O(log n)",
        tag: "Intermediate",
        accentColor: ACCENT,
        icon: Search,
    },
    {
        name: "Quick Sort",
        desc: "Partition-based divide-and-conquer sorting",
        complexity: "O(n log n)",
        tag: "Intermediate",
        accentColor: ACCENT,
        icon: Zap,
    },
    {
        name: "Merge Sort",
        desc: "Stable sort by recursive merging of halves",
        complexity: "O(n log n)",
        tag: "Advanced",
        accentColor: ACCENT,
        icon: GitMerge,
    },
];

// ─── Features ─────────────────────────────────────────────────────────────────
export const FEATURES = [
    {
        Icon: Play,
        title: "Step-by-Step Visualisation",
        desc: "Watch each algorithm execute, one step at a time",
        color: ACCENT,
    },
    {
        Icon: Code2,
        title: "Code Sync Panel",
        desc: "Pseudocode highlights in sync with every animation frame",
        color: ACCENT,
    },
    {
        Icon: Zap,
        title: "Gamified Quizzes",
        desc: "Predict the next step. Earn XP. Unlock badges.",
        color: ACCENT,
    },
    {
        Icon: Trophy,
        title: "XP & Badge System",
        desc: "Earn XP for Every Correct Answer",
        color: ACCENT,
    },
    {
        Icon: BarChart3,
        title: "Performance Analytics",
        desc: "Track Your Algorithm Mastery",
        color: ACCENT,
    },
    {
        Icon: Rewind,
        title: "Playback Controls",
        desc: "Speed slider, step-forward, step-backward, and replay",
        color: ACCENT,
    },
];

// ─── How It Works Steps ───────────────────────────────────────────────────────
export const STEPS = [
    {
        num: "01",
        title: "Register & Choose",
        desc: "Pick an algorithm to explore from our curated library of core algorithms",
        color: ACCENT,
    },
    {
        num: "02",
        title: "Visualise & Sync",
        desc: "Watch it execute step-by-step with live pseudocode highlighting",
        color: ACCENT,
    },
    {
        num: "03",
        title: "Quiz & Earn XP",
        desc: "Test yourself, earn experience points, and track your leaderboard rank",
        color: ACCENT,
    },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
export const STATS = [
    { label: "Algorithms. More to come!", value: 5, suffix: "+", icon: Code },
    { label: "Autograded quizzes", value: 10, suffix: "+", icon: FileQuestionMark },
    { label: "XP badge system", value: 12, suffix: " level", icon: Shield },
    { label: "Concurrent Users Supported", value: 100, suffix: "+", icon: Users },
];

// ─── Dashboard Preview ───────────────────────────────────────────────────────
export const BADGES = [
    { icon: Star, label: "First Sort", awarded: true, color: ACCENT },
    { icon: Zap, label: "Speed Run", awarded: true, color: ACCENT },
    { icon: Trophy, label: "Quiz Master", awarded: true, color: ACCENT },
    { icon: BookOpen, label: "Bookworm", awarded: false, color: "#3a3a3a" },
    { icon: TrendingUp, label: "Top 10%", awarded: false, color: "#3a3a3a" },
    { icon: Award, label: "Perfectionist", awarded: false, color: "#3a3a3a" },
];

export const QUIZ_SCORES = [
    { algo: "Bubble Sort", score: 95, color: ACCENT },
    { algo: "Binary Search", score: 80, color: "#a8e600" },
    { algo: "Quick Sort", score: 65, color: ACCENT },
    { algo: "Merge Sort", score: 40, color: "#a8e600" },
];

// ─── Sort Bar Colors for Hero Animation ───────────────────────────────────────
export const BAR_COLORS = [
    "#D5FF40",
    "#b8e030",
    "#a8e600",
    "#c4f020",
    "#D5FF40",
    "#deff66",
    "#e8ff80",
];
