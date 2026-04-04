import { anonymousTest as test, expect } from "./fixtures/roles";
import { expectClerkSignInForm } from "./fixtures/selectors";

const protectedRoutes = ["/dashboard", "/quiz/1", "/coding-challenges/1"];

for (const route of protectedRoutes) {
    test(`anonymous user is redirected to login from ${route}`, async ({ page }) => {
        await page.goto(route);
        await expect(page).toHaveURL(/\/login/);
        await expectClerkSignInForm(page);
    });
}
