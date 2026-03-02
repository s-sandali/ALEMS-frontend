import { Routes, Route } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
        <div className="min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route
                    path="/login/*"
                    element={
                        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0C0C0C" }}>
                            <SignIn routing="path" path="/login" fallbackRedirectUrl="/dashboard" />
                        </div>
                    }
                />

                <Route
                    path="/register/*"
                    element={
                        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0C0C0C" }}>
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
            </Routes>
        </div>
    );
}
