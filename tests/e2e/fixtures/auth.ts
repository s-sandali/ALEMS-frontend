import fs from "fs";
import path from "path";
import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";

import { getAuthStatePath, type AuthCredentials, type RoleName } from "./env";
import {
    clerkIdentifierInput,
    clerkPasswordInput,
    clerkPrimaryContinueButton,
    clerkVerificationCodeInput,
    expectClerkSignInForm,
    expectDashboardReady,
} from "./selectors";

export async function loginViaClerk(page: Page, credentials: AuthCredentials): Promise<void> {
    await page.goto("/login", { waitUntil: "domcontentloaded", timeout: 60_000 });
    await expectClerkSignInForm(page);

    await clerkIdentifierInput(page).fill(credentials.email);
    await clerkPrimaryContinueButton(page).click();

    await expect(clerkPasswordInput(page)).toBeVisible({ timeout: 20_000 });
    await clerkPasswordInput(page).fill(credentials.password);
    await clerkPrimaryContinueButton(page).click();

    const verificationRequested = await clerkVerificationCodeInput(page)
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

    if (verificationRequested) {
        throw new Error(
            "Clerk requested email or device verification for the Playwright account. " +
            "Use a trusted seeded test account that can sign in without interactive verification.",
        );
    }

    await page.waitForURL(/\/dashboard(?:\/)?$/, { timeout: 60_000 });
    await expectDashboardReady(page);
}

export async function createAuthenticatedState(
    browser: Browser,
    role: RoleName,
    credentials: AuthCredentials,
): Promise<void> {
    const storageStatePath = getAuthStatePath(role);
    fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

    const context = await browser.newContext();
    const page = await context.newPage();

    await loginViaClerk(page, credentials);
    await context.storageState({ path: storageStatePath });

    await context.close();
}

export async function createFreshContext(browser: Browser, role: RoleName): Promise<BrowserContext> {
    const storageStatePath = getAuthStatePath(role);
    expect(fs.existsSync(storageStatePath)).toBeTruthy();

    return browser.newContext({ storageState: storageStatePath });
}
