import { useState, useEffect } from "react";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { UserService } from "../lib/api";

export default function Dashboard() {
    const { getToken, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            setError("");
            setMessage("Fetching users from backend...");
            const response = await UserService.getAllUsers(getToken);
            setUsers(response.data || []);
            setMessage("Successfully fetched users!");
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to fetch users. Are you an Admin?");
            setMessage("");
        }
    };


    const testSync = async () => {
        try {
            setError("");
            setMessage("Testing Sync endpoint...");
            const response = await UserService.syncUser(getToken);
            setMessage(`Sync result: ${JSON.stringify(response.data)}`);
            fetchUsers(); // Refresh the list
        } catch (err) {
            console.error(err);
            setError(err.message || "Sync failed.");
            setMessage("");
        }
    };

    useEffect(() => {
        // Automatically fetch users on load
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen p-8 text-white" style={{ background: "#0C0C0C" }}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
                <h1 className="text-3xl font-bold">Admin Workbench test</h1>
                <div className="flex items-center gap-4">
                    <p className="text-gray-400">Signed in as: {user?.primaryEmailAddress?.emailAddress}</p>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
                >
                    GET /api/users
                </button>

                <button
                    onClick={testSync}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium transition-colors"
                >
                    POST /api/users/sync
                </button>
            </div>

            {message && <div className="mb-4 p-4 bg-green-900/50 text-green-200 border border-green-800 rounded">{message}</div>}
            {error && <div className="mb-4 p-4 bg-red-900/50 text-red-200 border border-red-800 rounded">{error}</div>}

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-gray-300">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Username</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Clerk ID</th>
                            <th className="p-4">Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    No users found or could not connect to backend.
                                </td>
                            </tr>
                        ) : (
                            users.map(u => (
                                <tr key={u.userId} className="border-t border-gray-800 hover:bg-gray-800/50">
                                    <td className="p-4">{u.userId}</td>
                                    <td className="p-4">{u.username}</td>
                                    <td className="p-4">{u.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'Admin' ? 'bg-red-900/80 text-red-200' : 'bg-blue-900/80 text-blue-200'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs font-mono text-gray-400">
                                        {u.clerkUserId ? `${u.clerkUserId.substring(0, 8)}...` : 'N/A'}
                                    </td>
                                    <td className="p-4">{u.isActive ? "Yes" : "No"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
