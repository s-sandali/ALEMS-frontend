import path from "path";

export type RoleName = "student" | "admin";

export type AuthCredentials = {
    email: string;
    password: string;
};

function readRequiredEnv(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Missing required E2E environment variable: ${name}`);
    }

    return value;
}

export function getFrontendBaseUrl(): string {
    return process.env.PLAYWRIGHT_FRONTEND_URL?.trim() || "http://127.0.0.1:5173";
}

export function getApiBaseUrl(): string {
    return process.env.PLAYWRIGHT_API_BASE_URL?.trim()
        || process.env.VITE_API_BASE_URL?.trim()
        || "http://127.0.0.1:5000/api";
}

export function getStudentCredentials(): AuthCredentials {
    return {
        email: readRequiredEnv("PLAYWRIGHT_TEST_STUDENT_EMAIL"),
        password: readRequiredEnv("PLAYWRIGHT_TEST_STUDENT_PASSWORD"),
    };
}

export function getAdminCredentials(): AuthCredentials {
    return {
        email: readRequiredEnv("PLAYWRIGHT_TEST_ADMIN_EMAIL"),
        password: readRequiredEnv("PLAYWRIGHT_TEST_ADMIN_PASSWORD"),
    };
}

export function getAuthStatePath(role: RoleName): string {
    return path.join(process.cwd(), "tests", "e2e", ".auth", `${role}.json`);
}
