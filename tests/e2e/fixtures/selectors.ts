import { expect, type Locator, type Page } from "@playwright/test";

export function clerkIdentifierInput(page: Page): Locator {
    return page.locator("#identifier-field, input[name='identifier'], input[type='email']").first();
}

export function clerkPasswordInput(page: Page): Locator {
    return page.locator("#password-field, input[name='password'], input[type='password']").first();
}

export function clerkVerificationCodeInput(page: Page): Locator {
    return page.locator("#code-field, input[name='code'], input[inputmode='numeric']").first();
}

export function clerkPrimaryContinueButton(page: Page): Locator {
    return page
        .locator("button[data-localization-key='formButtonPrimary'], .cl-formButtonPrimary")
        .first();
}

export function dashboardHeading(page: Page): Locator {
    return page.getByRole("heading", { name: /welcome back,/i });
}

export async function expectClerkSignInForm(page: Page): Promise<void> {
    await expect(clerkIdentifierInput(page)).toBeVisible({ timeout: 30_000 });
}

export async function expectDashboardReady(page: Page): Promise<void> {
    await expect(page).toHaveURL(/\/dashboard(?:\/)?$/);
    await expect(dashboardHeading(page)).toBeVisible({ timeout: 30_000 });
}
