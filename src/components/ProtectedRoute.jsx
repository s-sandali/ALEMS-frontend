import { useEffect, useState } from "react";
import { useAuth, RedirectToSignIn } from "@clerk/clerk-react";
import { UserService } from "../lib/api";

export default function ProtectedRoute({ children }) {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [isSyncing, setIsSyncing] = useState(true);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const syncAccount = async () => {
                try {
                    await UserService.syncUser(getToken);
                } catch (error) {
                    if (error.message === "UNAUTHORIZED") {
                        window.location.href = "/login";
                    } else {
                        console.error("Failed to sync user:", error);
                    }
                } finally {
                    setIsSyncing(false);
                }
            };

            syncAccount();
        } else if (isLoaded && !isSignedIn) {
            setIsSyncing(false);
        }
    }, [isLoaded, isSignedIn, getToken]);

    // Show nothing while Clerk is still loading auth state
    if (!isLoaded || isSyncing) {
        return <div className="min-h-screen flex items-center justify-center text-white" style={{ background: "#0C0C0C" }}>Loading Auth...</div>;
    }

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return children;
}
