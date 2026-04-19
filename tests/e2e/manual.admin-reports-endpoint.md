# Manual integration checks for admin reports endpoint (no Clerk OTP)

This suite validates:
- CSV download
- PDF download
- 403 for student token
- 401 for unauthenticated request
- 400 for invalid date range
- Empty period graceful response

## Prerequisites

1. Backend is running and reachable (default expected by Playwright is http://127.0.0.1:5000/api).
2. You have valid JWTs from seeded users:
   - admin JWT
   - student JWT
3. In PowerShell, set environment variables:

```powershell
$env:PLAYWRIGHT_TEST_ADMIN_JWT = "<admin-jwt>"
$env:PLAYWRIGHT_TEST_STUDENT_JWT = "<student-jwt>"
$env:PLAYWRIGHT_API_BASE_URL = "http://127.0.0.1:5181/api"

# Use a period where you know attempts exist for positive download checks
$env:REPORTS_TEST_START_DATE = "2026-04-01"
$env:REPORTS_TEST_END_DATE = "2026-04-30"

# Use a period with no attempts for empty-period behavior
$env:REPORTS_TEST_EMPTY_START_DATE = "1990-01-01"
$env:REPORTS_TEST_EMPTY_END_DATE = "1990-01-31"
```

## Run only the OTP-free reports endpoint tests

```powershell
npm run test:e2e:reports:manual
```

This uses the Playwright project `api-manual`, which does not depend on Clerk login setup.

## Expected outcomes

1. CSV download returns HTTP 200, Content-Type contains `text/csv`, and download filename contains `.csv`.
2. PDF download returns HTTP 200, Content-Type contains `application/pdf`, and filename contains `.pdf`.
3. Student token returns HTTP 403.
4. No token returns HTTP 401.
5. Invalid range (startDate > endDate) returns HTTP 400 with "invalid date range" in payload.
6. Empty period returns HTTP 200 CSV and still includes CSV structural headers.

## Note about current backend behavior

If the empty-period test fails because CSV body is empty, backend currently returns empty bytes for empty results.
To satisfy the story DoD, backend should return a CSV with section headers and no data rows for empty periods.
