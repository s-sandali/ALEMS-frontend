const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

type Initializer = {
    method?: string;
    headers?: HeadersInit;
    body?: any;
    getToken: () => Promise<string | null>;
};

/**
 * Core fetch wrapper that intercepts requests to inject the Clerk JWT
 * and globally standardises error handling.
 */
async function apiFetch(endpoint: string, { method = "GET", headers, body, getToken }: Initializer) {
    const token = await getToken();

    if (!token) {
        throw new Error("No valid session token found. User might be signed out.");
    }

    const config: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
        console.error("401 Unauthorized - Token expired or invalid.");
        throw new Error("UNAUTHORIZED");
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "An API error occurred");
    }

    return data;
}

export const UserService = {
    /**
     * POST /users/sync
     * Called immediately after a user signs in to ensure they exist in the DB.
     */
    syncUser: (getToken: () => Promise<string | null>) =>
        apiFetch("/users/sync", { method: "POST", getToken }),

    /**
     * GET /users
     * Admin only. Retrieves all users.
     */
    getAllUsers: (getToken: () => Promise<string | null>) =>
        apiFetch("/users", { method: "GET", getToken }),

    /**
     * GET /users/{id}
     * Admin only. Retrieves a specific user by ID.
     */
    getUserById: (id: number, getToken: () => Promise<string | null>) =>
        apiFetch(`/users/${id}`, { method: "GET", getToken }),

    /**
     * POST /users
     * Admin only. Creates a new user.
     */
    createUser: (userData: { email: string; username: string; role: string }, getToken: () => Promise<string | null>) =>
        apiFetch("/users", { method: "POST", body: userData, getToken }),

    /**
     * PUT /users/{id}
     * Admin only. Updates a user.
     */
    updateUser: (id: number, userData: { role: string; isActive: boolean }, getToken: () => Promise<string | null>) =>
        apiFetch(`/users/${id}`, { method: "PUT", body: userData, getToken }),

    /**
     * DELETE /users/{id}
     * Admin only. Soft deletes a user.
     */
    deleteUser: (id: number, getToken: () => Promise<string | null>) =>
        apiFetch(`/users/${id}`, { method: "DELETE", getToken })
};
