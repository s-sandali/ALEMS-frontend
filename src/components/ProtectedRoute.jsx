import { useEffect, useState } from "react";
import { useAuth, useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { UserService } from "../lib/api";
import { RoleProvider } from "../context/RoleContext";

export default function ProtectedRoute({ children }) {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user } = useUser();
    const [isSyncing, setIsSyncing] = useState(true);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const syncAccount = async () => {
                try {
                    await UserService.syncUser(getToken);
                    // Reload Clerk user so publicMetadata reflects the latest role from Clerk
                    await user?.reload();
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
        return <div className="min-h-screen flex items-center justify-center text-white" style={{ background: "var(--bg)" }}>Loading Auth...</div>;
    }

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    const role = (user?.publicMetadata?.role) ?? "User";
    return <RoleProvider role={role}>{children}</RoleProvider>;
}

