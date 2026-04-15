import { expect, type Route } from "@playwright/test";

import { getApiBaseUrl } from "./fixtures/env";
import { studentTest as test } from "./fixtures/roles";
import { expectDashboardReady } from "./fixtures/selectors";

const apiBaseUrl = getApiBaseUrl().replace(/\/$/, "");

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fulfillJson(route: Route, payload: unknown): Promise<void> {
    await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(payload),
    });
}

test("dashboard consumes mocked XP and attempt data from API @smoke", async ({ page }) => {
    const studentId = 987;

    const progressionResponse = {
        status: "success",
        data: {
            userId: studentId,
            xpTotal: 420,
            currentLevel: 4,
            xpPrevLevel: 300,
            xpForNextLevel: 500,
            xpInCurrentLevel: 120,
            xpNeededForLevel: 200,
            progressPercentage: 60,
        },
    };

    const dashboardResponse = {
        status: "success",
        data: {
            studentId,
            xpTotal: 420,
            earnedBadges: [
                {
                    id: 1,
                    name: "First Steps",
                    description: "Reach 50 XP",
                    xpThreshold: 50,
                    iconType: "star",
                    iconColor: "#f6c945",
                    awardDate: "2026-04-10T09:00:00Z",
                },
            ],
            allBadges: [
                {
                    id: 1,
                    name: "First Steps",
                    description: "Reach 50 XP",
                    xpThreshold: 50,
                    iconType: "star",
                    iconColor: "#f6c945",
                    earned: true,
                },
                {
                    id: 2,
                    name: "Quick Learner",
                    description: "Reach 150 XP",
                    xpThreshold: 150,
                    iconType: "bolt",
                    iconColor: "#7df9ff",
                    earned: false,
                },
            ],
            performanceSummary: {
                totalAttempts: 3,
                totalPassed: 2,
                passRate: 66.7,
                averageScore: 78.3,
                totalXpFromQuizzes: 120,
            },
            quizAttemptHistory: [
                {
                    attemptId: 5001,
                    quizId: 33,
                    quizTitle: "Mock Quick Sort Quiz",
                    algorithmName: "Quick Sort",
                    score: 8,
                    totalQuestions: 10,
                    scorePercent: 80,
                    xpEarned: 40,
                    passed: true,
                    completedAt: "2026-04-11T09:00:00Z",
                },
            ],
            algorithmCoverage: [
                {
                    algorithmId: 3,
                    algorithmName: "Quick Sort",
                    category: "Sorting",
                    totalAttempts: 3,
                    passedAttempts: 2,
                    bestScorePercent: 90,
                    hasPassedQuiz: true,
                },
            ],
        },
    };

    await page.route(`${apiBaseUrl}/users/sync`, async (route) => {
        await fulfillJson(route, { status: "success", data: { userId: studentId } });
    });

    await page.route(`${apiBaseUrl}/students/${studentId}/progression`, async (route) => {
        await fulfillJson(route, progressionResponse);
    });

    await page.route(`${apiBaseUrl}/students/${studentId}/dashboard`, async (route) => {
        await fulfillJson(route, dashboardResponse);
    });

    await page.route(new RegExp(`${escapeRegExp(apiBaseUrl)}/students/${studentId}/activity(?:\\?.*)?$`), async (route) => {
        await fulfillJson(route, { status: "success", data: [] });
    });

    await page.route(`${apiBaseUrl}/students/${studentId}/activity-heatmap`, async (route) => {
        await fulfillJson(route, { status: "success", data: [] });
    });

    await page.route(`${apiBaseUrl}/student/quizzes`, async (route) => {
        await fulfillJson(route, { status: "success", data: [] });
    });

    await page.route(`${apiBaseUrl}/algorithms`, async (route) => {
        await fulfillJson(route, { status: "success", data: [] });
    });

    await page.route(`${apiBaseUrl}/leaderboard`, async (route) => {
        await fulfillJson(route, { status: "success", data: [] });
    });

    await page.goto("/dashboard");
    await expectDashboardReady(page);

    await expect(page.getByTestId("dashboard-stat-total-xp-value")).toHaveText("420");
    await expect(page.getByTestId("dashboard-stat-quizzes-passed-value")).toHaveText("2");
    await expect(page.getByTestId("dashboard-stat-pass-rate-value")).toHaveText("66.7%");
    await expect(page.getByTestId("dashboard-xp-total-value")).toHaveText("420");

    await expect(page.getByTestId("dashboard-attempt-history-table")).toBeVisible();
    const attemptRow = page.getByTestId("dashboard-attempt-row-5001");
    await expect(attemptRow).toContainText("Mock Quick Sort Quiz");
    await expect(attemptRow).toContainText("Quick Sort");
    await expect(page.getByTestId("dashboard-attempt-row-5001-xp")).toContainText("+40");

    const earnedBadges = page.locator('[data-testid="dashboard-badge-card"][data-badge-status="earned"]');
    const lockedBadges = page.locator('[data-testid="dashboard-badge-card"][data-badge-status="locked"]');

    expect(await earnedBadges.count()).toBe(1);
    expect(await lockedBadges.count()).toBe(1);
});
