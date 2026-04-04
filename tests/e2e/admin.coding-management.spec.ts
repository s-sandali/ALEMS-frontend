import { adminTest as test, expect } from "./fixtures/roles";

test("admin can create a coding question and see it in the list", async ({ page }) => {
    const uniqueTitle = `PW Coding ${Date.now()}`;

    await page.goto("/admin/coding-questions");
    await page.getByTestId("new-coding-question-button").click();

    await page.getByPlaceholder("e.g. Two Sum").fill(uniqueTitle);
    await page.getByPlaceholder("Describe the problem clearly…").fill("Return the correct answer for this Playwright smoke question.");
    await page.getByRole("button", { name: "Create Question" }).click();

    await expect(page).toHaveURL(/\/admin\/coding-questions$/, { timeout: 30_000 });
    await expect(
        page.getByTestId("admin-coding-row").filter({ hasText: uniqueTitle }).first(),
    ).toBeVisible({ timeout: 30_000 });
});
