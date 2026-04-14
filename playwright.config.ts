import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

// Load local env files for Playwright's Node process. Vite does this for the app,
// but Playwright needs the variables available before config and setup code run.
if (fs.existsSync(".env")) {
    process.loadEnvFile?.(".env");
}

if (fs.existsSync(".env.local")) {
    process.loadEnvFile?.(".env.local");
}

const baseURL = process.env.PLAYWRIGHT_FRONTEND_URL ?? "http://localhost:5173";
const backendUrl = process.env.PLAYWRIGHT_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "http://localhost:5181/api";
const isCI = !!process.env.CI;

function mergeAllowedOrigins(...values: Array<string | undefined>): string {
    const normalized = values
        .flatMap((value) => (value ?? "").split(","))
        .map((origin) => origin.trim())
        .filter(Boolean);

    return [...new Set(normalized)].join(",");
}

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    forbidOnly: isCI,
    retries: isCI ? 1 : 0,
    reporter: [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
    ],
    use: {
        baseURL,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        headless: isCI,
    },
    outputDir: "test-results",
    webServer: isCI
        ? undefined
        : [
            {
                command: "dotnet run --project ..\\..\\backend\\ALEMS-backend\\backend.csproj --launch-profile http",
                url: "http://127.0.0.1:5181/api/health",
                reuseExistingServer: true,
                timeout: 120_000,
                env: {
                    ...process.env,
                    ASPNETCORE_ENVIRONMENT: process.env.ASPNETCORE_ENVIRONMENT ?? "Development",
                    ALLOWED_ORIGINS: mergeAllowedOrigins(
                        process.env.ALLOWED_ORIGINS,
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                    ),
                },
            },
            {
                command: "npm run dev -- --host localhost --port 5173",
                url: `${baseURL}/login`,
                reuseExistingServer: true,
                timeout: 120_000,
                env: {
                    ...process.env,
                    VITE_API_BASE_URL: backendUrl,
                },
            },
        ],
    projects: [
        {
            name: "setup",
            testMatch: /.*\.setup\.ts/,
            use: {
                ...devices["Desktop Chrome"],
            },
        },
        {
            name: "chromium-smoke",
            dependencies: ["setup"],
            grep: /@smoke/,
            testIgnore: /.*\.setup\.ts/,
            use: {
                ...devices["Desktop Chrome"],
            },
        },
        {
            name: "chromium-full",
            dependencies: ["setup"],
            testIgnore: /.*\.setup\.ts/,
            use: {
                ...devices["Desktop Chrome"],
            },
        },
    ],
});
