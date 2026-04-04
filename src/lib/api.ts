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
    heap?: HeapStepModel | null;
    quickSort?: QuickSortStepModel | null;
    selectionSort?: SelectionSortStepModel | null;
    mergeSort?: MergeSortStepModel | null;
    recursion?: RecursionStepModel | null;
};

type RecursionPrimitive = string | number | boolean | null;

export type RecursionFrameModel = {
    id?: string | number | null;
    functionName?: string | null;
    label?: string | null;
    state?: string | null;
    depth?: number | null;
    arguments?: Record<string, RecursionPrimitive> | null;
    params?: Record<string, RecursionPrimitive> | null;
    leftIndex?: number | null;
    rightIndex?: number | null;
    lowIndex?: number | null;
    highIndex?: number | null;
    startIndex?: number | null;
    endIndex?: number | null;
    midpointIndex?: number | null;
    pivotIndex?: number | null;
    returnValue?: RecursionPrimitive | number[] | string[] | null;
    result?: RecursionPrimitive | number[] | string[] | null;
};

export type RecursionStepModel = {
    event?: string | null;
    state?: string | null;
    depth?: number | null;
    currentFrameId?: string | number | null;
    frames?: RecursionFrameModel[] | null;
    stack?: RecursionFrameModel[] | null;
};

export type MergeSortStepModel = {
    type: string;
    left: number;
    right: number;
    mid?: number | null;
    recursionDepth: number;
    mergeBuffer?: number[] | null;
    placeIndex?: number | null;
};

export type QuickSortStepModel = {
    type?: string | null;
    pivot?: number | null;
    pivotIndex?: number | null;
    range?: number[] | null;
    recursionDepth?: number | null;
};

export type SelectionSortStepModel = {
    type?: string | null;
    currentIndex?: number | null;
    candidateIndex?: number | null;
    minIndex?: number | null;
    swapFrom?: number | null;
    swapTo?: number | null;
    sortedBoundary?: number | null;
};

export type HeapStepModel = {
    phase: string;
    heapBoundaryEnd: number;
    heapIndex?: number | null;
    parentIndex?: number | null;
    leftChildIndex?: number | null;
    rightChildIndex?: number | null;
    comparedParentIndex?: number | null;
    comparedChildIndex?: number | null;
    comparedIndices?: number[];
    parentChildComparison?: string | null;
    extractedValue?: number | null;
    extractedFromIndex?: number | null;
    sortedTargetIndex?: number | null;
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

// ── Quiz types ────────────────────────────────────────────────────────────────

export type QuizSummary = {
    quizId: number;
    algorithmId: number;
    createdBy: number;
    title: string;
    description: string | null;
    timeLimitMins: number | null;
    passScore: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateQuizPayload = {
    algorithmId: number;
    title: string;
    description?: string | null;
    timeLimitMins?: number | null;
    passScore?: number;
};

export type UpdateQuizPayload = {
    title: string;
    description?: string | null;
    timeLimitMins?: number | null;
    passScore: number;
    isActive: boolean;
};

// ── Quiz question types ────────────────────────────────────────────────────────

export type QuizQuestion = {
    questionId: number;
    quizId: number;
    questionType: "MCQ" | "PREDICT_STEP";
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: "A" | "B" | "C" | "D";
    difficulty: "easy" | "medium" | "hard";
    explanation: string | null;
    orderIndex: number;
    isActive: boolean;
    createdAt: string;
};

export type CreateQuizQuestionPayload = {
    questionType: "MCQ" | "PREDICT_STEP";
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: "A" | "B" | "C" | "D";
    difficulty: "easy" | "medium" | "hard";
    explanation?: string | null;
    orderIndex?: number;
};

export type UpdateQuizQuestionPayload = CreateQuizQuestionPayload & {
    isActive: boolean;
};

// ── Quiz service ───────────────────────────────────────────────────────────────

export const QuizService = {
    /**
     * GET /quizzes
     * Admin only. Retrieves all quizzes (active and inactive).
     */
    getAll: (getToken: GetTokenFn) =>
        apiFetch("/quizzes", { method: "GET", getToken }) as
            Promise<{ status: string; data: QuizSummary[] }>,

    /**
     * GET /quizzes/{id}
     * Admin only. Retrieves a single quiz by ID.
     */
    getById: (id: number, getToken: GetTokenFn) =>
        apiFetch(`/quizzes/${id}`, { method: "GET", getToken }) as
            Promise<{ status: string; data: QuizSummary }>,

    /**
     * POST /quizzes
     * Admin only. Creates a new quiz.
     * `created_by` is resolved server-side from the Clerk JWT.
     */
    create: (payload: CreateQuizPayload, getToken: GetTokenFn) =>
        apiFetch("/quizzes", { method: "POST", body: payload, getToken }) as
            Promise<{ status: string; message: string; data: QuizSummary }>,

    /**
     * PUT /quizzes/{id}
     * Admin only. Updates an existing quiz (full replace of mutable fields).
     */
    update: (id: number, payload: UpdateQuizPayload, getToken: GetTokenFn) =>
        apiFetch(`/quizzes/${id}`, { method: "PUT", body: payload, getToken }) as
            Promise<{ status: string; message: string; data: QuizSummary }>,

    /**
     * DELETE /quizzes/{id}
     * Admin only. Soft-deletes a quiz (sets is_active = false).
     * Returns null on success (204 No Content).
     */
    delete: (id: number, getToken: GetTokenFn) =>
        apiFetch(`/quizzes/${id}`, { method: "DELETE", getToken }) as
            Promise<null>,
};

// ── Quiz question service ──────────────────────────────────────────────────────

export const QuizQuestionService = {
    /**
     * GET /quizzes/{quizId}/questions
     * Admin only. Retrieves all active questions for a quiz, ordered by order_index.
     */
    getByQuiz: (quizId: number, getToken: GetTokenFn) =>
        apiFetch(`/quizzes/${quizId}/questions`, { method: "GET", getToken }) as
            Promise<{ status: string; data: QuizQuestion[] }>,

    /**
     * GET /quizzes/{quizId}/questions/{id}
     * Admin only. Retrieves a single question by ID.
     */
    getById: (quizId: number, id: number, getToken: GetTokenFn) =>
        apiFetch(`/quizzes/${quizId}/questions/${id}`, { method: "GET", getToken }) as
            Promise<{ status: string; data: QuizQuestion }>,

    /**
     * POST /quizzes/{quizId}/questions
     * Admin only. Adds a new question to a quiz.
     * Set questionType to "PREDICT_STEP" for algorithm-step prediction questions.
     */
    create: (quizId: number, payload: CreateQuizQuestionPayload, getToken: GetTokenFn) =>
        apiFetch(`/quizzes/${quizId}/questions`, { method: "POST", body: payload, getToken }) as
            Promise<{ status: string; message: string; data: QuizQuestion }>,

    /**
     * PUT /quizzes/{quizId}/questions/{id}
     * Admin only. Updates an existing question (full replace of all fields).
     */
    update: (quizId: number, id: number, payload: UpdateQuizQuestionPayload, getToken: GetTokenFn) =>
        apiFetch(`/quizzes/${quizId}/questions/${id}`, { method: "PUT", body: payload, getToken }) as
            Promise<{ status: string; message: string; data: QuizQuestion }>,

    /**
     * DELETE /quizzes/{quizId}/questions/{id}
     * Admin only. Soft-deletes a question (sets is_active = false).
     * Returns null on success (204 No Content).
     */
    delete: (quizId: number, id: number, getToken: GetTokenFn) =>
        apiFetch(`/quizzes/${quizId}/questions/${id}`, { method: "DELETE", getToken }) as
            Promise<null>,
};

// ── Student quiz types ─────────────────────────────────────────────────────────

/** Question returned to students — correctOption and explanation are intentionally absent. */
export type StudentQuestion = {
    questionId: number;
    questionType: "MCQ" | "PREDICT_STEP";
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    difficulty: "easy" | "medium" | "hard";
    orderIndex: number;
};

export type QuizAttemptAnswer = {
    questionId: number;
    selectedOption: "A" | "B" | "C" | "D";
};

export type QuizAttemptPayload = {
    answers: QuizAttemptAnswer[];
};

export type QuizAttemptQuestionResult = {
    questionId: number;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
    explanation: string | null;
};

export type QuizAttemptResult = {
    attemptId: number;
    quizId: number;
    score: number;           // percentage 0–100
    passed: boolean;
    totalQuestions: number;
    correctCount: number;
    results: QuizAttemptQuestionResult[];
};

// ── Student quiz service ───────────────────────────────────────────────────────

export const StudentQuizService = {
    /**
     * GET /student/quizzes
     * Returns only active quizzes (is_active = true). Accessible to all authenticated users.
     */
    getActiveQuizzes: (getToken: GetTokenFn) =>
        apiFetch("/student/quizzes", { method: "GET", getToken }) as
            Promise<{ status: string; data: QuizSummary[] }>,

    /**
     * GET /student/quizzes/{id}
     * Returns a single active quiz. Returns 404 if inactive or not found.
     */
    getActiveQuizById: (id: number, getToken: GetTokenFn) =>
        apiFetch(`/student/quizzes/${id}`, { method: "GET", getToken }) as
            Promise<{ status: string; data: QuizSummary }>,

    /**
     * GET /student/quizzes/{quizId}/questions
     * Returns active questions for a quiz WITHOUT correctOption or explanation.
     */
    getQuizQuestions: (quizId: number, getToken: GetTokenFn) =>
        apiFetch(`/student/quizzes/${quizId}/questions`, { method: "GET", getToken }) as
            Promise<{ status: string; data: StudentQuestion[] }>,

    /**
     * POST /student/quizzes/{quizId}/attempt
     * Submits all answers and returns the graded result with explanations.
     */
    submitAttempt: (quizId: number, payload: QuizAttemptPayload, getToken: GetTokenFn) =>
        apiFetch(`/student/quizzes/${quizId}/attempt`, { method: "POST", body: payload, getToken }) as
            Promise<{ status: string; data: QuizAttemptResult }>,
};

// ── Coding question types ──────────────────────────────────────────────────────

export type CodingQuestion = {
    id: number;
    title: string;
    description: string;
    inputExample: string | null;
    expectedOutput: string | null;
    difficulty: "easy" | "medium" | "hard";
};

export type CreateCodingQuestionPayload = {
    title: string;
    description: string;
    inputExample?: string | null;
    expectedOutput?: string | null;
    difficulty: "easy" | "medium" | "hard";
};

export type UpdateCodingQuestionPayload = CreateCodingQuestionPayload;

// ── Coding question service ────────────────────────────────────────────────────

export const CodingQuestionService = {
    /**
     * GET /coding-questions
     * Admin only. Retrieves all coding questions.
     */
    getAll: (getToken: GetTokenFn) =>
        apiFetch("/coding-questions", { method: "GET", getToken }) as
            Promise<{ status: string; data: CodingQuestion[] }>,

    /**
     * GET /coding-questions/{id}
     * Admin only. Retrieves a single coding question by ID.
     */
    getById: (id: number, getToken: GetTokenFn) =>
        apiFetch(`/coding-questions/${id}`, { method: "GET", getToken }) as
            Promise<{ status: string; data: CodingQuestion }>,

    /**
     * POST /coding-questions
     * Admin only. Creates a new coding question.
     */
    create: (payload: CreateCodingQuestionPayload, getToken: GetTokenFn) =>
        apiFetch("/coding-questions", { method: "POST", body: payload, getToken }) as
            Promise<{ status: string; message: string; data: CodingQuestion }>,

    /**
     * PUT /coding-questions/{id}
     * Admin only. Updates an existing coding question.
     */
    update: (id: number, payload: UpdateCodingQuestionPayload, getToken: GetTokenFn) =>
        apiFetch(`/coding-questions/${id}`, { method: "PUT", body: payload, getToken }) as
            Promise<{ status: string; message: string; data: CodingQuestion }>,

    /**
     * DELETE /coding-questions/{id}
     * Admin only. Deletes a coding question.
     * Returns null on success (204 No Content).
     */
    delete: (id: number, getToken: GetTokenFn) =>
        apiFetch(`/coding-questions/${id}`, { method: "DELETE", getToken }) as
            Promise<null>,
};

// ── Code execution types ───────────────────────────────────────────────────────

export type SupportedLanguage = {
    languageId: number;
    name: string;
};

export type CodeExecutionRequest = {
    sourceCode: string;
    languageId: number;
    stdin?: string | null;
    expectedOutput?: string | null;
};

export type CodeExecutionResult = {
    stdout: string | null;
    stderr: string | null;
    compileOutput: string | null;
    statusId: number;
    statusDescription: string;
    executionTime: string | null;
    memoryUsed: number | null;
};

// ── Code execution service ────────────────────────────────────────────────────

export const CodeExecutionApiService = {
    /**
     * GET /code/languages
     * Returns the list of supported Judge0 language IDs and names.
     */
    getLanguages: (getToken: GetTokenFn) =>
        apiFetch("/code/languages", { method: "GET", getToken }) as
            Promise<{ status: string; data: SupportedLanguage[] }>,

    /**
     * POST /code/execute
     * Submits source code to Judge0 (wait=true, synchronous).
     * Returns the full execution result — check statusId for outcome.
     */
    execute: (payload: CodeExecutionRequest, getToken: GetTokenFn) =>
        apiFetch("/code/execute", { method: "POST", body: payload, getToken }) as
            Promise<{ status: string; data: CodeExecutionResult }>,
};

// ── Student coding question service ──────────────────────────────────────────

export const StudentCodingQuestionService = {
    /**
     * GET /student/coding-questions
     * Any authenticated user. Returns all coding questions.
     */
    getAll: (getToken: GetTokenFn) =>
        apiFetch("/student/coding-questions", { method: "GET", getToken }) as
            Promise<{ status: string; data: CodingQuestion[] }>,

    /**
     * GET /student/coding-questions/{id}
     * Any authenticated user. Returns a single coding question by ID.
     */
    getById: (id: number, getToken: GetTokenFn) =>
        apiFetch(`/student/coding-questions/${id}`, { method: "GET", getToken }) as
            Promise<{ status: string; data: CodingQuestion }>,
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