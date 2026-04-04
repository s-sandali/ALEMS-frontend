import { test } from "@playwright/test";

import { createAuthenticatedState } from "../fixtures/auth";
import { getAdminCredentials, getStudentCredentials } from "../fixtures/env";

test("generate authenticated storage state for student and admin", async ({ browser }) => {
    test.setTimeout(180_000);

    await test.step("Create student auth state", async () => {
        await createAuthenticatedState(browser, "student", getStudentCredentials());
    });

    await test.step("Create admin auth state", async () => {
        await createAuthenticatedState(browser, "admin", getAdminCredentials());
    });
});
