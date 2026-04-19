import { test } from "@playwright/test";

import { createAuthenticatedState } from "../fixtures/auth";
import { getAdminCredentials, getStudentCredentials } from "../fixtures/env";

test("generate authenticated storage state for student and admin", async ({ browser }) => {
    const allowManual2FA = process.env.PLAYWRIGHT_ALLOW_MANUAL_2FA === "1" && !process.env.CI;
    const skipAdminSetup = process.env.PLAYWRIGHT_SETUP_SKIP_ADMIN === "1";

    // Manual verification can take several minutes in headed local runs.
    test.setTimeout(allowManual2FA ? 600_000 : 180_000);

    await test.step("Create student auth state", async () => {
        await createAuthenticatedState(browser, "student", getStudentCredentials());
    });

    if (skipAdminSetup) {
        test.info().annotations.push({
            type: "info",
            description: "Skipped admin auth state because PLAYWRIGHT_SETUP_SKIP_ADMIN=1",
        });
        return;
    }

    await test.step("Create admin auth state", async () => {
        await createAuthenticatedState(browser, "admin", getAdminCredentials());
    });
});
