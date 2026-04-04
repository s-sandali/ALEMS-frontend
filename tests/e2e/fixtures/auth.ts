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

async function handleFactorTwoChallenge(page: Page): Promise<void> {
    const allowManualFactorTwo = process.env.PLAYWRIGHT_ALLOW_MANUAL_2FA === "1" && !process.env.CI;

    if (!allowManualFactorTwo) {
        throw new Error(
            "Clerk redirected to /login/factor-two for email/device verification. " +
            "Use a trusted seeded test account, or set PLAYWRIGHT_ALLOW_MANUAL_2FA=1 " +
            "for local headed runs and enter the verification code manually in the browser.",
        );
    }

    console.log(
        "[Playwright E2E] Clerk factor-two verification detected. " +
        "Enter the verification code in the open browser window to continue.",
    );

    await page.waitForURL(/\/dashboard(?:\/)?$/, { timeout: 180_000 });
    await expectDashboardReady(page);
}

export async function loginViaClerk(page: Page, credentials: AuthCredentials): Promise<void> {
    await page.goto("/login", { waitUntil: "domcontentloaded", timeout: 60_000 });
    await expectClerkSignInForm(page);

    await clerkIdentifierInput(page).fill(credentials.email);
    await clerkPrimaryContinueButton(page).click();

    await expect(clerkPasswordInput(page)).toBeVisible({ timeout: 20_000 });
    await clerkPasswordInput(page).fill(credentials.password);
    await clerkPrimaryContinueButton(page).click();

    await page.waitForLoadState("domcontentloaded", { timeout: 15_000 }).catch(() => {});

    const verificationRequested = page.url().includes("/factor-two")
        || await clerkVerificationCodeInput(page)
            .isVisible({ timeout: 5_000 })
            .catch(() => false)
        || await page.getByText(/check your email/i)
            .isVisible({ timeout: 2_000 })
            .catch(() => false);

    if (verificationRequested) {
        await handleFactorTwoChallenge(page);
        return;
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
