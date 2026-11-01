import { defineConfig } from "@playwright/test";
import standard from "./playwright.config";

export default defineConfig({
  ...standard,
  testDir: "./tests/pages",
  use: {
    ...standard.use,
    baseURL: process.env.PAGES_TEST_URL ?? "http://localhost:3001/kazauk-pc-builder/",
  },
});
