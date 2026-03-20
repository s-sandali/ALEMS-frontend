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

export type AlgorithmSimulationStep = {
    stepNumber: number;
    arrayState: number[];
    activeIndices: number[];
    lineNumber: number;
    actionLabel: string;
    search?: SearchStepModel | null;
};

export type SearchStepModel = {
    lowIndex: number;
    highIndex: number;
    midpointIndex?: number | null;
    state: string;
    discardedSide?: string | null;
    discardStartIndex?: number | null;
    discardEndIndex?: number | null;
    discardedIndices?: number[];
};

export type AlgorithmSimulationResponse = {
    algorithmName: string;
    steps: AlgorithmSimulationStep[];
    totalSteps: number;
    targetValue?: number | null;
};

export type SimulationValidationAction = {
    type: string;
    indices: number[];
};

export type SimulationSession = {
    sessionId: string;
    steps: AlgorithmSimulationStep[];
    currentStepIndex: number;
    targetValue?: number | null;
};

export type SimulationValidationResponse = {
    sessionId: string;
    correct: boolean;
    newArrayState: number[];
    nextState: number[];
    nextExpectedAction: string;
    message: string;
    hint: string;
    suggestedIndices: number[];
    currentStepIndex: number;
};

export type AlgorithmSummary = {
    algorithmId: number;
    name: string;
    category: string;
    description: string;
    timeComplexityBest: string;
    timeComplexityAverage: string;
    timeComplexityWorst: string;
    quizAvailable?: boolean;
    createdAt: string;
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

export const AlgorithmService = {
    /**
     * GET /algorithms
     * Retrieves the algorithm library available to authenticated learners.
     */
    getAll: (getToken: GetTokenFn) =>
        apiFetch("/algorithms", {
            method: "GET",
            getToken,
        }) as Promise<{ status: string; data: AlgorithmSummary[] }>,

    /**
     * GET /algorithms/{id}
     * Retrieves a single algorithm record.
     */
    getById: (id: number, getToken: GetTokenFn) =>
        apiFetch(`/algorithms/${id}`, {
            method: "GET",
            getToken,
        }) as Promise<{ status: string; data: AlgorithmSummary }>,
};

export const SimulationService = {
    /**
     * POST /simulation/run
     * Requests the backend-generated step trace for an algorithm/input pair.
     */
    runSimulation: (algorithm: string, array: number[], getToken: GetTokenFn, targetValue?: number | null) =>
        apiFetch("/simulation/run", {
            method: "POST",
            body: { algorithm, array, target: targetValue ?? null },
            getToken,
        }) as Promise<AlgorithmSimulationResponse>,

    /**
     * POST /simulation/start
     * Starts a stateful practice-mode session backed by the auto-mode trace.
     */
    startSession: (algorithm: string, array: number[], getToken: GetTokenFn, targetValue?: number | null) =>
        apiFetch("/simulation/start", {
            method: "POST",
            body: { algorithm, array, target: targetValue ?? null },
            getToken,
        }) as Promise<SimulationSession>,

    /**
     * POST /simulation/validate-step
     * Validates an interactive learner action against the backend engine.
     */
    validateStep: (
        sessionId: string,
        action: SimulationValidationAction,
        getToken: GetTokenFn,
    ) =>
        apiFetch("/simulation/validate-step", {
            method: "POST",
            body: { sessionId, action },
            getToken,
        }) as Promise<SimulationValidationResponse>,
};
