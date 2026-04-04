import { studentTest as test, expect } from "./fixtures/roles";

test("student is blocked from the admin quiz page", async ({ page }) => {
    await page.goto("/admin/quizzes");
    await expect(page.getByText("Admin access required.")).toBeVisible({ timeout: 30_000 });
});
