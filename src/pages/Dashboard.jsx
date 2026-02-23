import { UserButton } from "@clerk/clerk-react";

export default function Dashboard() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center"
            style={{ background: "#0C0C0C" }}
        >
            <div className="flex items-center gap-4 mb-8">
                <UserButton afterSignOutUrl="/" />
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            </div>
            <p className="text-lg" style={{ color: "#A1A1A1" }}>
                Welcome! You are signed in.
            </p>
        </div>
    );
}
