import type { Page } from "@playwright/test";

import { studentTest as test, expect } from "./fixtures/roles";

function parseIntFromText(value: string): number {
    const digits = value.replace(/[^0-9]/g, "");
    return Number.parseInt(digits || "0", 10);
}

function parseEarnedBadgesCount(value: string): number {
    const match = value.match(/(\d+)\s*\/\s*\d+\s*earned/i);
    return match ? Number.parseInt(match[1], 10) : 0;
}

function parseDateTextToEpoch(value: string): number {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}

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

    const beforeXpText = await page.getByTestId("dashboard-stat-total-xp-value").innerText();
    const beforeXp = parseIntFromText(beforeXpText);
    const beforeBadgesText = await page.getByTestId("dashboard-badges-earned-count").innerText();
    const beforeEarnedBadges = parseEarnedBadgesCount(beforeBadgesText);

    const startQuiz = page.getByText("Start Quiz").first();
    await expect(startQuiz).toBeVisible({ timeout: 30_000 });
    await startQuiz.click();

    await completeQuizAttempt(page);

    await expect(page.getByText(/Quiz Passed!|Quiz Failed/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Question Breakdown")).toBeVisible();
    await expect(page.getByRole("button", { name: /retry quiz/i })).toBeVisible();

    const xpAwardBanner = page.getByText(/\+\d+ XP earned/i);
    const noXpBanner = page.getByText(/No XP awarded/i);

    const firstAttemptAwardedXp = await xpAwardBanner.isVisible().catch(() => false);
    let awardedXp = 0;

    if (firstAttemptAwardedXp) {
        const awardedText = await xpAwardBanner.innerText();
        awardedXp = parseIntFromText(awardedText);
        expect(awardedXp).toBeGreaterThan(0);
    } else {
        await expect(noXpBanner).toBeVisible({ timeout: 30_000 });
    }

    await page.goto("/dashboard");
    const afterFirstXpText = await page.getByTestId("dashboard-stat-total-xp-value").innerText();
    const afterFirstXp = parseIntFromText(afterFirstXpText);
    const afterFirstBadgesText = await page.getByTestId("dashboard-badges-earned-count").innerText();
    const afterFirstEarnedBadges = parseEarnedBadgesCount(afterFirstBadgesText);

    if (firstAttemptAwardedXp) {
        expect(afterFirstXp).toBe(beforeXp + awardedXp);
    } else {
        expect(afterFirstXp).toBe(beforeXp);
    }

    expect(afterFirstEarnedBadges).toBeGreaterThanOrEqual(beforeEarnedBadges);

    const historyRowsAfterFirstAttempt = page.locator('[data-testid^="dashboard-attempt-row-"]');
    const firstAttemptHistoryCount = await historyRowsAfterFirstAttempt.count();
    expect(firstAttemptHistoryCount).toBeGreaterThan(0);

    if (firstAttemptHistoryCount > 1) {
        const newestDateText = await historyRowsAfterFirstAttempt.nth(0).locator("td").last().innerText();
        const nextDateText = await historyRowsAfterFirstAttempt.nth(1).locator("td").last().innerText();

        expect(parseDateTextToEpoch(newestDateText)).toBeGreaterThanOrEqual(parseDateTextToEpoch(nextDateText));
    }

    await page.getByText("Start Quiz").first().click();
    await completeQuizAttempt(page);

    await expect(page.getByText(/No XP awarded/i)).toBeVisible({ timeout: 30_000 });

    await page.goto("/dashboard");
    const afterRetryXpText = await page.getByTestId("dashboard-stat-total-xp-value").innerText();
    const afterRetryXp = parseIntFromText(afterRetryXpText);
    const afterRetryBadgesText = await page.getByTestId("dashboard-badges-earned-count").innerText();
    const afterRetryEarnedBadges = parseEarnedBadgesCount(afterRetryBadgesText);

    expect(afterRetryXp).toBe(afterFirstXp);
    expect(afterRetryEarnedBadges).toBe(afterFirstEarnedBadges);

    const historyRowsAfterRetry = page.locator('[data-testid^="dashboard-attempt-row-"]');
    const retryHistoryCount = await historyRowsAfterRetry.count();

    if (retryHistoryCount > 1) {
        const newestDateText = await historyRowsAfterRetry.nth(0).locator("td").last().innerText();
        const secondDateText = await historyRowsAfterRetry.nth(1).locator("td").last().innerText();

        expect(parseDateTextToEpoch(newestDateText)).toBeGreaterThanOrEqual(parseDateTextToEpoch(secondDateText));
    }
});
