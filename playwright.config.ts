import { defineConfig, devices } from "@playwright/test";

// Load local env files for Playwright's Node process. Vite does this for the app,
// but Playwright needs the variables available before config and setup code run.
process.loadEnvFile?.(".env");
process.loadEnvFile?.(".env.local");

const baseURL = process.env.PLAYWRIGHT_FRONTEND_URL ?? "http://127.0.0.1:5173";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
    ],
    use: {
        baseURL,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        headless: !process.env.PLAYWRIGHT_HEADED,
    },
    outputDir: "test-results",
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
