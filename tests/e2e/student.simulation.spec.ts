import { studentTest as test, expect } from "./fixtures/roles";

test("student can switch binary search into practice mode and validate correct and incorrect actions", async ({ page }) => {
    await page.goto("/algorithms");

    const binarySearchCard = page.getByRole("heading", { name: /binary search/i }).first();
    await expect(binarySearchCard).toBeVisible({ timeout: 30_000 });
    await binarySearchCard.click();

    await expect(page.getByRole("heading", { name: /binary search/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("simulation-practice-mode")).toBeVisible();

    await page.getByTestId("simulation-practice-mode").click();
    await expect(page.getByText(/Choose Go Left, Go Right, or Found/i)).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "Go Left" }).click();
    await expect(page.getByText(/wrong half|Incorrect step/i)).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "Found" }).click();
    await expect(page.getByText(/Target found|Practice complete/i)).toBeVisible({ timeout: 30_000 });
});
