import { Routes, Route } from "react-router-dom";
import {
    SignIn,
    SignUp,
    SignedIn,
    SignedOut,
    RedirectToSignIn,
} from "@clerk/clerk-react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
    return (
        <div className="min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route
                    path="/login/*"
                    element={
                        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0C0C0C" }}>
                            <SignIn routing="path" path="/login" />
                        </div>
                    }
                />

                <Route
                    path="/register/*"
                    element={
                        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0C0C0C" }}>
                            <SignUp routing="path" path="/register" />
                        </div>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <>
                            <SignedIn>
                                <Dashboard />
                            </SignedIn>
                            <SignedOut>
                                <RedirectToSignIn />
                            </SignedOut>
                        </>
                    }
                />
            </Routes>
        </div>
    );
}
