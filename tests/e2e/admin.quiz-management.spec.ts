import { adminTest as test, expect } from "./fixtures/roles";

test("admin can create, question, and deactivate a quiz @smoke", async ({ page }) => {
    const uniqueTitle = `PW Quiz ${Date.now()}`;

    await page.goto("/admin/quizzes");
    await page.getByTestId("new-quiz-button").click();

    const algorithmSelect = page.locator("select").first();
    const firstAlgorithmValue = await algorithmSelect.locator("option:not([value=''])").first().getAttribute("value");
    expect(firstAlgorithmValue).not.toBeNull();

    await algorithmSelect.selectOption(firstAlgorithmValue!);
    await page.getByPlaceholder("e.g. Bubble Sort Fundamentals").fill(uniqueTitle);
    await page.getByPlaceholder("Briefly describe what this quiz covers…").fill("Playwright smoke test quiz.");
    await page.getByRole("button", { name: /Create Quiz & Add Questions/i }).click();

    await expect(page).toHaveURL(/\/admin\/quizzes\/\d+\/edit/, { timeout: 30_000 });

    await page.getByRole("button", { name: "Add Question" }).click();
    await page.getByPlaceholder("Enter the question…").fill("What is the first option in this Playwright smoke test?");
    await page.getByPlaceholder("Option A").fill("Option A");
    await page.getByPlaceholder("Option B").fill("Option B");
    await page.getByPlaceholder("Option C").fill("Option C");
    await page.getByPlaceholder("Option D").fill("Option D");
    await page.getByRole("button", { name: "Save Question" }).click();

    await expect(page.getByText("Questions").first()).toBeVisible({ timeout: 30_000 });

    await page.goto("/admin/quizzes");

    const row = page.getByTestId("admin-quiz-row").filter({ hasText: uniqueTitle }).first();
    await expect(row).toBeVisible({ timeout: 30_000 });

    page.once("dialog", async (dialog) => {
        await dialog.accept();
    });
    await row.locator("button[title='Deactivate quiz']").click();

    await expect(page.getByText(`"${uniqueTitle}" is now inactive.`)).toBeVisible({ timeout: 30_000 });
    await expect(row.getByText("Inactive")).toBeVisible();
});
