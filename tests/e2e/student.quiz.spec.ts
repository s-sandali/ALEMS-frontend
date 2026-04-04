import type { Page } from "@playwright/test";

import { studentTest as test, expect } from "./fixtures/roles";

async function answerVisibleQuestion(page: Page, option: "A" | "B" | "C" | "D" = "A") {
    await expect(page.getByTestId("quiz-question-card")).toBeVisible();
    await page.getByTestId(`quiz-option-${option}`).click();
}

async function completeQuizAttempt(page: Page) {
    await expect(page).toHaveURL(/\/quiz\/\d+/);

    while (await page.getByTestId("quiz-next").isVisible().catch(() => false)) {
        await answerVisibleQuestion(page);
        await page.getByTestId("quiz-next").click();
    }

    const submitButton = page.getByTestId("quiz-submit");
    await expect(submitButton).toBeDisabled();
    await answerVisibleQuestion(page);
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
}

test("student can complete a quiz and retry it without duplicate XP @smoke", async ({ page }) => {
    await page.goto("/dashboard");

    const startQuiz = page.getByText("Start Quiz").first();
    await expect(startQuiz).toBeVisible({ timeout: 30_000 });
    await startQuiz.click();

    await completeQuizAttempt(page);

    await expect(page.getByText(/Quiz Passed!|Quiz Failed/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Question Breakdown")).toBeVisible();
    await expect(page.getByRole("button", { name: /retry quiz/i })).toBeVisible();

    await page.getByRole("button", { name: /retry quiz/i }).click();
    await completeQuizAttempt(page);

    await expect(page.getByText(/No XP awarded/i)).toBeVisible({ timeout: 30_000 });
});
