import { expect, test } from "@playwright/test";

import { loginViaClerk } from "./fixtures/auth";
import { getStudentCredentials } from "./fixtures/env";
import { expectDashboardReady } from "./fixtures/selectors";

function parseIntFromText(value: string): number {
    const digits = value.replace(/[^0-9]/g, "");
    return Number.parseInt(digits || "0", 10);
}

test("student login -> dashboard shows non-zero XP progress and earned+locked badges @smoke", async ({ page }) => {
    await loginViaClerk(page, getStudentCredentials());
    await expectDashboardReady(page);

    const xpProgressBar = page.getByTestId("dashboard-xp-progress-bar");
    await expect(xpProgressBar).toBeVisible({ timeout: 30_000 });

    const xpTotalText = await page.getByTestId("dashboard-xp-total-value").innerText();
    const xpTotal = parseIntFromText(xpTotalText);
    expect(xpTotal).toBeGreaterThan(0);

    const badgeGrid = page.getByTestId("dashboard-badge-grid");
    await expect(badgeGrid).toBeVisible({ timeout: 30_000 });

    const earnedBadges = page.locator('[data-testid="dashboard-badge-card"][data-badge-status="earned"]');
    const lockedBadges = page.locator('[data-testid="dashboard-badge-card"][data-badge-status="locked"]');

    await expect(earnedBadges.first()).toBeVisible({ timeout: 30_000 });
    await expect(lockedBadges.first()).toBeVisible({ timeout: 30_000 });

    expect(await earnedBadges.count()).toBeGreaterThan(0);
    expect(await lockedBadges.count()).toBeGreaterThan(0);
});
