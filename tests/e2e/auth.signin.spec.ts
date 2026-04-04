import { test } from "@playwright/test";

import { loginViaClerk } from "./fixtures/auth";
import { getStudentCredentials } from "./fixtures/env";
import { expectDashboardReady } from "./fixtures/selectors";

test("student can sign in through Clerk and reach the dashboard @smoke", async ({ page }) => {
    await loginViaClerk(page, getStudentCredentials());
    await expectDashboardReady(page);
});
