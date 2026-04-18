import { expect, test, type APIRequestContext } from "@playwright/test";

import { getApiBaseUrl } from "./fixtures/env";

const apiBaseUrl = getApiBaseUrl().replace(/\/$/, "");
const endpoint = `${apiBaseUrl}/admin/reports`;

const adminToken = process.env.PLAYWRIGHT_TEST_ADMIN_JWT?.trim();
const studentToken = process.env.PLAYWRIGHT_TEST_STUDENT_JWT?.trim();

const dataStartDate = process.env.REPORTS_TEST_START_DATE?.trim() ?? "2026-04-01";
const dataEndDate = process.env.REPORTS_TEST_END_DATE?.trim() ?? "2026-04-30";
const emptyStartDate = process.env.REPORTS_TEST_EMPTY_START_DATE?.trim() ?? "1990-01-01";
const emptyEndDate = process.env.REPORTS_TEST_EMPTY_END_DATE?.trim() ?? "1990-01-31";

function buildAuthHeader(token?: string): Record<string, string> {
    if (!token) {
        return {};
    }

    return { Authorization: `Bearer ${token}` };
}

type ReportFormat = "csv" | "pdf";

async function getReport(
    request: APIRequestContext,
    options: {
        token?: string;
        format: ReportFormat;
        startDate: string;
        endDate: string;
    },
) {
    return request.get(endpoint, {
        headers: buildAuthHeader(options.token),
        params: {
            format: options.format,
            startDate: options.startDate,
            endDate: options.endDate,
        },
    });
}

test.describe("Admin reports endpoint integration (manual, token-based)", () => {
    test("CSV download returns 200 and CSV headers for admin token", async ({ request }) => {
        test.skip(!adminToken, "Set PLAYWRIGHT_TEST_ADMIN_JWT to run admin-token scenarios.");

        const response = await getReport(request, {
            token: adminToken,
            format: "csv",
            startDate: dataStartDate,
            endDate: dataEndDate,
        });

        expect(response.status()).toBe(200);
        const contentType = response.headers()["content-type"] ?? "";
        expect(contentType).toContain("text/csv");

        const contentDisposition = response.headers()["content-disposition"] ?? "";
        expect(contentDisposition.toLowerCase()).toContain(".csv");
    });

    test("PDF download returns 200 and PDF headers for admin token", async ({ request }) => {
        test.skip(!adminToken, "Set PLAYWRIGHT_TEST_ADMIN_JWT to run admin-token scenarios.");

        const response = await getReport(request, {
            token: adminToken,
            format: "pdf",
            startDate: dataStartDate,
            endDate: dataEndDate,
        });

        expect(response.status()).toBe(200);
        const contentType = response.headers()["content-type"] ?? "";
        expect(contentType).toContain("application/pdf");

        const contentDisposition = response.headers()["content-disposition"] ?? "";
        expect(contentDisposition.toLowerCase()).toContain(".pdf");
    });

    test("Student token is forbidden (403)", async ({ request }) => {
        test.skip(!studentToken, "Set PLAYWRIGHT_TEST_STUDENT_JWT to run student-token scenario.");

        const response = await getReport(request, {
            token: studentToken,
            format: "csv",
            startDate: dataStartDate,
            endDate: dataEndDate,
        });

        expect(response.status()).toBe(403);
    });

    test("Unauthenticated request returns 401", async ({ request }) => {
        const response = await getReport(request, {
            format: "csv",
            startDate: dataStartDate,
            endDate: dataEndDate,
        });

        expect(response.status()).toBe(401);
    });

    test("Invalid date range returns 400 with validation payload", async ({ request }) => {
        test.skip(!adminToken, "Set PLAYWRIGHT_TEST_ADMIN_JWT to run admin-token scenarios.");

        const response = await getReport(request, {
            token: adminToken,
            format: "csv",
            startDate: "2026-05-01",
            endDate: "2026-04-01",
        });

        expect(response.status()).toBe(400);

        const body = await response.json().catch(() => ({}));
        expect(JSON.stringify(body).toLowerCase()).toContain("invalid date range");
    });

    test("Empty period returns graceful CSV response with structural headers", async ({ request }) => {
        test.skip(!adminToken, "Set PLAYWRIGHT_TEST_ADMIN_JWT to run admin-token scenarios.");

        const response = await getReport(request, {
            token: adminToken,
            format: "csv",
            startDate: emptyStartDate,
            endDate: emptyEndDate,
        });

        expect(response.status()).toBe(200);
        const contentType = response.headers()["content-type"] ?? "";
        expect(contentType).toContain("text/csv");

        const csv = await response.text();
        // For a graceful empty-period export, the CSV should preserve section headers
        // even when there are no data rows.
        expect(csv).toContain("section,start_date,end_date");
        expect(csv).toContain("section,total_attempts,total_students,avg_score,total_xp");
        expect(csv).toContain("section,student_id,student_name,total_attempts,avg_score,best_score,total_xp,algorithms_attempted");
        expect(csv).toContain("section,algorithm_type,attempt_count,avg_score,pass_rate");
        expect(csv).toContain("section,title,attempt_count,avg_score,highest_score,lowest_score");
    });
});
