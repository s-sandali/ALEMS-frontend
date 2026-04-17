import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import AlgorithmsPage from "./pages/AlgorithmsPage";
import AlgorithmDetailPage from "./pages/AlgorithmDetailPage";
import QuizPage from "./pages/QuizPage";
import QuizzesPage from "./pages/QuizzesPage";
import AdminQuizListPage from "./pages/AdminQuizListPage";
import AdminQuizFormPage from "./pages/AdminQuizFormPage";
import CodingChallengesPage from "./pages/CodingChallengesPage";
import CodingChallengePage from "./pages/CodingChallengePage";
import AdminCodingQuestionListPage from "./pages/AdminCodingQuestionListPage";
import AdminCodingQuestionFormPage from "./pages/AdminCodingQuestionFormPage";
import AdminLeaderboardPage from "./pages/AdminLeaderboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminStudentProfilePage from "./pages/AdminStudentProfilePage";
import QuizStatsPage from "./pages/QuizStatsPage";
import StudentAttemptHistoryPage from "./pages/StudentAttemptHistoryPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import { initializeTheme } from "./hooks/useTheme";

export default function App() {
    useEffect(() => {
        initializeTheme();
    }, []);

    return (
        <div className="min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route
                    path="/login/*"
                    element={
                        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
                            <SignIn routing="path" path="/login" fallbackRedirectUrl="/dashboard" />
                        </div>
                    }
                />

                <Route
                    path="/register/*"
                    element={
                        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
                            <SignUp routing="path" path="/register" fallbackRedirectUrl="/dashboard" />
                        </div>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/algorithms"
                    element={
                        <ProtectedRoute>
                            <AlgorithmsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/algorithms/:id"
                    element={
                        <ProtectedRoute>
                            <AlgorithmDetailPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/quizzes"
                    element={
                        <ProtectedRoute>
                            <QuizzesPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/quiz/:quizId"
                    element={
                        <ProtectedRoute>
                            <QuizPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-attempts"
                    element={
                        <ProtectedRoute>
                            <StudentAttemptHistoryPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes with Shared Layout */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute>
                            <AdminLayout>
                                <Routes>
                                    <Route path="/" element={<AdminDashboard />} />
                                    <Route path="/analytics" element={<AdminAnalyticsPage />} />
                                    <Route path="/users" element={<AdminUsersPage />} />
                                    <Route path="/students/:id" element={<AdminStudentProfilePage />} />
                                    <Route path="/quizzes" element={<AdminQuizListPage />} />
                                    <Route path="/quizzes/new" element={<AdminQuizFormPage />} />
                                    <Route path="/quizzes/:id/edit" element={<AdminQuizFormPage />} />
                                    <Route path="/quizzes/:quizId/stats" element={<QuizStatsPage />} />
                                    <Route path="/leaderboard" element={<AdminLeaderboardPage />} />
                                    <Route path="/coding-questions" element={<AdminCodingQuestionListPage />} />
                                    <Route path="/coding-questions/new" element={<AdminCodingQuestionFormPage />} />
                                    <Route path="/coding-questions/:id/edit" element={<AdminCodingQuestionFormPage />} />
                                </Routes>
                            </AdminLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/coding-challenges"
                    element={
                        <ProtectedRoute>
                            <CodingChallengesPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/coding-challenges/:id"
                    element={
                        <ProtectedRoute>
                            <CodingChallengePage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
}
