import { adminTest as test, expect } from "./fixtures/roles";

test("admin can open reports section and initiate CSV download @smoke", async ({ page }) => {
    await page.goto("/admin");

    // Reports UI lives on the admin dashboard in this branch.
    await expect(page.getByRole("heading", { name: "Admin Reports" })).toBeVisible({ timeout: 30_000 });

    await page.locator("#report-start-date").fill("2026-04-01");
    await page.locator("#report-end-date").fill("2026-04-30");
    await page.locator("#report-format").selectOption("csv");

    const downloadPromise = page.waitForEvent("download");

    await page.getByRole("button", { name: /download report/i }).click();

    const download = await downloadPromise;
    const suggestedName = download.suggestedFilename().toLowerCase();

    expect(suggestedName).toContain(".csv");
});
