import process from "node:process";
import fs from "node:fs";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

if (fs.existsSync(".env")) {
    process.loadEnvFile?.(".env");
}

if (fs.existsSync(".env.local")) {
    process.loadEnvFile?.(".env.local");
}

function readRequiredEnv(name) {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Missing required env var: ${name}`);
    }

    return value;
}

function getFrontendUrl() {
    return process.env.SELENIUM_FRONTEND_URL?.trim()
        || process.env.PLAYWRIGHT_FRONTEND_URL?.trim()
    || "http://localhost:5173";
}

function getStudentEmail() {
    return process.env.SELENIUM_TEST_STUDENT_EMAIL?.trim()
        || process.env.PLAYWRIGHT_TEST_STUDENT_EMAIL?.trim()
        || "";
}

function getStudentPassword() {
    return process.env.SELENIUM_TEST_STUDENT_PASSWORD?.trim()
        || process.env.PLAYWRIGHT_TEST_STUDENT_PASSWORD?.trim()
        || "";
}

function allowManual2FA() {
    return process.env.SELENIUM_ALLOW_MANUAL_2FA === "1";
}

function parseIntFromText(value) {
    const digits = String(value).replace(/[^0-9]/g, "");
    return Number.parseInt(digits || "0", 10);
}

function isStaleElementError(error) {
    const message = String(error?.message || error || "").toLowerCase();
    return message.includes("stale element reference");
}

async function runWithStaleRetries(action, maxAttempts = 5) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await action();
        } catch (error) {
            lastError = error;
            if (!isStaleElementError(error) || attempt === maxAttempts) {
                throw error;
            }
        }
    }

    throw lastError ?? new Error("Failed after stale-element retries.");
}

async function waitVisible(driver, locator, timeoutMs = 30_000) {
    return runWithStaleRetries(async () => {
        const element = await driver.wait(until.elementLocated(locator), timeoutMs);
        await driver.wait(until.elementIsVisible(element), timeoutMs);
        return element;
    });
}

async function getText(driver, locator, timeoutMs = 30_000) {
    return runWithStaleRetries(async () => {
        const element = await waitVisible(driver, locator, timeoutMs);
        return element.getText();
    });
}

async function clearAndType(driver, locator, value, timeoutMs = 30_000) {
    await runWithStaleRetries(async () => {
        const element = await waitVisible(driver, locator, timeoutMs);
        await element.clear();
        await element.sendKeys(value);
    });
}

async function isVerificationChallengeVisible(driver) {
    const url = await driver.getCurrentUrl().catch(() => "");
    if (url.includes("/factor-one") || url.includes("/factor-two")) {
        return true;
    }

    const codeInputs = await driver.findElements(
        By.css("#code-field, input[name='code'], input[inputmode='numeric']"),
    );
    if (codeInputs.length > 0) {
        return true;
    }

    const checkEmailText = await driver.findElements(
        By.xpath("//*[contains(translate(normalize-space(.), 'CHECK YOUR EMAIL', 'check your email'), 'check your email')]"),
    );
    return checkEmailText.length > 0;
}

async function isPasswordInputVisible(driver) {
    const inputs = await driver.findElements(By.css("#password-field, input[name='password'], input[type='password']"));
    if (inputs.length === 0) {
        return false;
    }

    for (const input of inputs) {
        try {
            if (await input.isDisplayed()) {
                return true;
            }
        } catch (error) {
            if (!isStaleElementError(error)) {
                throw error;
            }
        }
    }

    return false;
}

async function trySwitchToPasswordMethod(driver) {
    const alternativeMethodButtons = await driver.findElements(
        By.xpath("//button[contains(normalize-space(.), 'Use another method')]"),
    );

    if (alternativeMethodButtons.length === 0) {
        return false;
    }

    await runWithStaleRetries(async () => {
        await alternativeMethodButtons[0].click();
    });

    const passwordMethodButtons = await driver.findElements(
        By.xpath("//button[contains(translate(normalize-space(.), 'PASSWORD', 'password'), 'password') or contains(translate(normalize-space(.), 'SIGN IN WITH PASSWORD', 'sign in with password'), 'password')]"),
    );

    if (passwordMethodButtons.length === 0) {
        return false;
    }

    await runWithStaleRetries(async () => {
        await passwordMethodButtons[0].click();
    });

    await driver.wait(async () => isPasswordInputVisible(driver), 20_000).catch(() => {});
    return isPasswordInputVisible(driver);
}

async function handleVerificationChallenge(driver, manual2FAEnabled) {
    const switchedToPassword = await trySwitchToPasswordMethod(driver);
    if (switchedToPassword) {
        return;
    }

    if (!manual2FAEnabled) {
        throw new Error(
            "Clerk requested email/device verification. Set SELENIUM_ALLOW_MANUAL_2FA=1 and run headed, or use an account trusted for password sign-in.",
        );
    }

    console.log(
        "Manual 2FA is enabled. Complete the Clerk verification challenge in the browser to continue Selenium assertions.",
    );

    await driver.wait(async () => /\/dashboard(?:\/)?$/.test(await driver.getCurrentUrl()), 180_000);
}

async function clickWhenReady(driver, locator, timeoutMs = 30_000) {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            const element = await waitVisible(driver, locator, timeoutMs);
            await driver.wait(until.elementIsEnabled(element), timeoutMs);
            await element.click();
            return;
        } catch (error) {
            if (!isStaleElementError(error) || attempt === maxAttempts) {
                throw error;
            }
        }
    }
}

function getCandidateFrontendUrls(frontendUrl) {
    const candidates = [frontendUrl];

    if (frontendUrl.includes("127.0.0.1")) {
        candidates.push(frontendUrl.replace("127.0.0.1", "localhost"));
    } else if (frontendUrl.includes("localhost")) {
        candidates.push(frontendUrl.replace("localhost", "127.0.0.1"));
    }

    return [...new Set(candidates)];
}

async function loginViaClerk(driver, frontendUrl, email, password, manual2FAEnabled) {
    const baseUrlCandidates = getCandidateFrontendUrls(frontendUrl);
    let navigated = false;
    let lastError = null;

    for (const baseUrl of baseUrlCandidates) {
        try {
            await driver.get(`${baseUrl}/login`);
            navigated = true;
            break;
        } catch (error) {
            lastError = error;
        }
    }

    if (!navigated) {
        throw lastError ?? new Error("Failed to open login page.");
    }

    await clearAndType(
        driver,
        By.css("#identifier-field, input[name='identifier'], input[type='email']"),
        email,
    );
    await clickWhenReady(
        driver,
        By.css("button[data-localization-key='formButtonPrimary'], .cl-formButtonPrimary"),
    );

    await driver.wait(async () => {
        if (/\/dashboard(?:\/)?$/.test(await driver.getCurrentUrl())) {
            return true;
        }

        if (await isPasswordInputVisible(driver)) {
            return true;
        }

        return isVerificationChallengeVisible(driver);
    }, 45_000);

    if (/\/dashboard(?:\/)?$/.test(await driver.getCurrentUrl())) {
        return;
    }

    if (await isVerificationChallengeVisible(driver)) {
        await handleVerificationChallenge(driver, manual2FAEnabled);
        if (/\/dashboard(?:\/)?$/.test(await driver.getCurrentUrl())) {
            return;
        }
    }

    await clearAndType(
        driver,
        By.css("#password-field, input[name='password'], input[type='password']"),
        password,
    );
    await clickWhenReady(
        driver,
        By.css("button[data-localization-key='formButtonPrimary'], .cl-formButtonPrimary"),
    );

    await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return /\/dashboard(?:\/)?$/.test(url) || /\/factor-two/.test(url);
    }, 60_000);

    if (await isVerificationChallengeVisible(driver)) {
        await handleVerificationChallenge(driver, manual2FAEnabled);
        return;
    }

    await waitVisible(driver, By.css("h1"));
}

async function completeQuiz(driver) {
    const quizTitle = (await getText(driver, By.css("h1"))).trim();

    while (true) {
        const nextButtons = await driver.findElements(By.css("[data-testid='quiz-next']"));
        let hasNext = false;

        for (const button of nextButtons) {
            try {
                if (await button.isDisplayed()) {
                    hasNext = true;
                    break;
                }
            } catch (error) {
                if (!isStaleElementError(error)) {
                    throw error;
                }
            }
        }

        if (!hasNext) {
            break;
        }

        await clickWhenReady(driver, By.css("[data-testid='quiz-option-A']"));
        await clickWhenReady(driver, By.css("[data-testid='quiz-next']"));
    }

    await clickWhenReady(driver, By.css("[data-testid='quiz-option-A']"));
    await clickWhenReady(driver, By.css("[data-testid='quiz-submit']"));

    const scorePercentText = await getText(driver, By.xpath("//div[contains(text(), '%')]"), 30_000);
    const scorePercent = parseIntFromText(scorePercentText);

    const xpAwardedNodes = await driver.findElements(By.xpath("//*[contains(text(), 'XP earned')]"));
    let awardedXp = 0;

    if (xpAwardedNodes.length > 0 && await xpAwardedNodes[0].isDisplayed()) {
        awardedXp = parseIntFromText(await xpAwardedNodes[0].getText());
    }

    return { quizTitle, scorePercent, awardedXp };
}

async function goToDashboard(driver, frontendUrl) {
    await driver.get(`${frontendUrl}/dashboard`);
    await waitVisible(driver, By.css("[data-testid='dashboard-xp-total-value']"), 30_000);
}

async function run() {
    const frontendUrl = getFrontendUrl();
    const email = getStudentEmail();
    const password = getStudentPassword();
    const manual2FAEnabled = allowManual2FA();

    if (!email) {
        throw new Error("Missing student email. Set SELENIUM_TEST_STUDENT_EMAIL or PLAYWRIGHT_TEST_STUDENT_EMAIL.");
    }

    if (!password) {
        throw new Error("Missing student password. Set SELENIUM_TEST_STUDENT_PASSWORD or PLAYWRIGHT_TEST_STUDENT_PASSWORD.");
    }

    const headed = process.argv.includes("--headed");
    const chromeOptions = new chrome.Options();
    if (!headed) {
        chromeOptions.addArguments("--headless=new");
    }
    chromeOptions.addArguments("--window-size=1440,1000");

    const driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(chromeOptions)
        .build();

    try {
        await loginViaClerk(driver, frontendUrl, email, password, manual2FAEnabled);

        await goToDashboard(driver, frontendUrl);
        const beforeXpText = await getText(driver, By.css("[data-testid='dashboard-xp-total-value']"));
        const beforeXp = parseIntFromText(beforeXpText);

        await clickWhenReady(driver, By.xpath("//span[normalize-space()='Start Quiz']"), 30_000);
        await driver.wait(async () => /\/quiz\/\d+/.test(await driver.getCurrentUrl()), 30_000);

        const { quizTitle, scorePercent, awardedXp } = await completeQuiz(driver);

        await goToDashboard(driver, frontendUrl);
        const afterXpText = await getText(driver, By.css("[data-testid='dashboard-xp-total-value']"));
        const afterXp = parseIntFromText(afterXpText);

        if (afterXp < beforeXp) {
            throw new Error(`XP decreased unexpectedly: before=${beforeXp}, after=${afterXp}`);
        }

        if (awardedXp > 0 && afterXp !== beforeXp + awardedXp) {
            throw new Error(
                `XP mismatch after quiz. Expected ${beforeXp + awardedXp}, got ${afterXp}.`,
            );
        }

        if (awardedXp === 0 && afterXp !== beforeXp) {
            throw new Error(
                `XP changed even though no XP was awarded. before=${beforeXp}, after=${afterXp}`,
            );
        }

        await waitVisible(driver, By.css("[data-testid='dashboard-attempt-history-table']"), 30_000);

        const matchingRowScore = await driver.findElements(
            By.xpath(
                `//tr[@data-testid and .//*[contains(normalize-space(.), ${JSON.stringify(quizTitle)})] and .//*[contains(normalize-space(.), '${scorePercent}%')]]`,
            ),
        );

        if (matchingRowScore.length === 0) {
            throw new Error(
                `Could not find dashboard attempt row with quiz title "${quizTitle}" and score ${scorePercent}%.`,
            );
        }

        console.log("Selenium E2E passed:");
        console.log(`- Quiz title: ${quizTitle}`);
        console.log(`- Score: ${scorePercent}%`);
        console.log(`- XP before: ${beforeXp}`);
        console.log(`- XP after: ${afterXp}`);
        console.log(`- XP awarded on attempt: ${awardedXp}`);
    } catch (error) {
        const currentUrl = await driver.getCurrentUrl().catch(() => "<unavailable>");
        const diagnosticsDir = "test-results/selenium";
        const screenshotPath = `${diagnosticsDir}/student.quiz-dashboard.failure.png`;

        fs.mkdirSync(diagnosticsDir, { recursive: true });
        const screenshotBase64 = await driver.takeScreenshot().catch(() => null);
        if (screenshotBase64) {
            fs.writeFileSync(screenshotPath, screenshotBase64, "base64");
        }

        const details = [
            `Selenium E2E failed at URL: ${currentUrl}`,
            `Screenshot: ${screenshotPath}`,
            String(error?.message || error),
        ].join("\n");

        throw new Error(details);
    } finally {
        await driver.quit();
    }
}

run().catch((error) => {
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
});
