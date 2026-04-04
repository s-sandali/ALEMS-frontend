import { expect, test as base } from "@playwright/test";

import { getAuthStatePath } from "./env";

export { expect };

export const anonymousTest = base;

export const studentTest = base.extend({});
studentTest.use({ storageState: getAuthStatePath("student") });

export const adminTest = base.extend({});
adminTest.use({ storageState: getAuthStatePath("admin") });
