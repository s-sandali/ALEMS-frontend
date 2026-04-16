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
import AdminReportsPage from "./pages/AdminReportsPage";
import CodingChallengesPage from "./pages/CodingChallengesPage";
import CodingChallengePage from "./pages/CodingChallengePage";
import AdminCodingQuestionListPage from "./pages/AdminCodingQuestionListPage";
import AdminCodingQuestionFormPage from "./pages/AdminCodingQuestionFormPage";
import ProtectedRoute from "./components/ProtectedRoute";
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
                    path="/admin/quizzes"
                    element={
                        <ProtectedRoute>
                            <AdminQuizListPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/quizzes/new"
                    element={
                        <ProtectedRoute>
                            <AdminQuizFormPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/quizzes/:id/edit"
                    element={
                        <ProtectedRoute>
                            <AdminQuizFormPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/coding-questions"
                    element={
                        <ProtectedRoute>
                            <AdminCodingQuestionListPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/coding-questions/new"
                    element={
                        <ProtectedRoute>
                            <AdminCodingQuestionFormPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/coding-questions/:id/edit"
                    element={
                        <ProtectedRoute>
                            <AdminCodingQuestionFormPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/reports"
                    element={
                        <ProtectedRoute>
                            <AdminReportsPage />
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
