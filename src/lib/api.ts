const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const CLERK_JWT_TEMPLATE = import.meta.env.VITE_CLERK_JWT_TEMPLATE as string | undefined;

// Matches Clerk's actual getToken signature so the template option can be passed through.
type GetTokenFn = (options?: { template?: string }) => Promise<string | null>;

type Initializer = {
    method?: string;
    headers?: HeadersInit;
    body?: any;
    getToken: GetTokenFn;
};

/**
 * Core fetch wrapper that intercepts requests to inject the Clerk JWT
 * and globally standardises error handling.
 */
async function apiFetch(endpoint: string, { method = "GET", headers, body, getToken }: Initializer) {
    const token = await getToken(CLERK_JWT_TEMPLATE ? { template: CLERK_JWT_TEMPLATE } : undefined);

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

    if (response.status === 403) {
        console.error("403 Forbidden - User lacks required roles.");
        throw new Error("You do not have permission to access Admin resources (403 Forbidden).");
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    // Safely parse JSON in case the server returned a plain string or empty body for an error
    let data;
    try {
        data = await response.json();
    } catch {
        data = { message: `API error: ${response.status} ${response.statusText}` };
    }

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
    syncUser: (getToken: GetTokenFn) =>
        apiFetch("/users/sync", { method: "POST", getToken }),

    /**
     * GET /users
     * Admin only. Retrieves all users.
     */
    getAllUsers: (getToken: GetTokenFn) =>
        apiFetch("/users", { method: "GET", getToken }),

    /**
     * GET /users/{id}
     * Admin only. Retrieves a specific user by ID.
     */
    getUserById: (id: number, getToken: GetTokenFn) =>
        apiFetch(`/users/${id}`, { method: "GET", getToken }),

    /**
     * POST /users
     * Admin only. Creates a new user.
     */
    createUser: (userData: { email: string; username: string; role: string }, getToken: GetTokenFn) =>
        apiFetch("/users", { method: "POST", body: userData, getToken }),

    /**
     * PUT /users/{id}
     * Admin only. Updates a user.
     */
    updateUser: (id: number, userData: { role: string; isActive: boolean }, getToken: GetTokenFn) =>
        apiFetch(`/users/${id}`, { method: "PUT", body: userData, getToken }),

    /**
     * DELETE /users/{id}
     * Admin only. Soft deletes a user.
     */
    deleteUser: (id: number, getToken: GetTokenFn) =>
        apiFetch(`/users/${id}`, { method: "DELETE", getToken })
};
