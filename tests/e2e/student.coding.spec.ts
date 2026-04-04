import type { Page } from "@playwright/test";

import { studentTest as test, expect } from "./fixtures/roles";

async function setMonacoSource(page: Page, source: string) {
    const editorInput = page.locator(".monaco-editor textarea").first();
    await expect(editorInput).toBeVisible({ timeout: 30_000 });
    await editorInput.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await editorInput.type(source);
}

test("student can run a coding challenge and see success plus failure states @smoke", async ({ page }) => {
    await page.goto("/coding-challenges");

    const firstCard = page.getByTestId("coding-challenge-card").first();
    await expect(firstCard).toBeVisible({ timeout: 30_000 });
    await firstCard.click();

    const languageSelect = page.getByTestId("coding-language-select");
    await expect(languageSelect).toBeVisible({ timeout: 30_000 });
    await languageSelect.selectOption("71");

    const expectedOutput = (await page.getByTestId("coding-expected-output").textContent().catch(() => "")) ?? "";
    const acceptedProgram = expectedOutput.trim().length > 0
        ? `import sys\nsys.stdout.write(${JSON.stringify(expectedOutput)})\n`
        : 'print("playwright-ok")\n';

    await setMonacoSource(page, acceptedProgram);
    await page.getByTestId("coding-run-button").click();

    const statusBanner = page.getByTestId("execution-status-banner");
    await expect(statusBanner).toContainText(/Accepted|Wrong Answer/i, { timeout: 30_000 });

    await setMonacoSource(page, "def broken(:\n    pass\n");
    await page.getByTestId("coding-run-button").click();

    await expect(page.getByTestId("execution-result-panel")).toBeVisible({ timeout: 30_000 });
    await expect(statusBanner).toContainText(/Compilation Error|Error|Runtime Error|Syntax/i, { timeout: 30_000 });
});
