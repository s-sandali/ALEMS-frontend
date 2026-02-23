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
                    element={<SignIn routing="path" path="/login" />}
                />

                <Route
                    path="/register/*"
                    element={<SignUp routing="path" path="/register" />}
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
