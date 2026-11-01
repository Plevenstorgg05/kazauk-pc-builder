import { expect, test } from "@playwright/test";
import { gotoCategory, summary } from "./builder-helpers";
test("case-first opening has no horizontal overflow", async ({ page }) => {
  await page.goto("/configure");
  await expect(
    page.getByRole("heading", { name: /Choose your case/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
});
test("homepage CTA reaches the builder", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /start building/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/configure/);
  await expect(
    page.getByRole("heading", { name: "Build your PC." }),
  ).toBeVisible();
});
test("full journey: unrestricted combinations, replacement, storage, review and edit", async ({
  page,
}) => {
  await page.goto("/configure");
  await page
    .locator("article")
    .filter({ hasText: "KZ-Z Dual Dynamic" })
    .getByRole("button", { name: "Select case", exact: true })
    .click();
  await gotoCategory(page, "cpu", "Processor");
  const cpu = page.locator("article").filter({ hasText: "Ryzen 7 7800X3D" });
  await cpu.getByRole("button", { name: /^Select/ }).click();
  await expect(cpu.getByRole("button", { name: "Selected" })).toBeVisible();
  await gotoCategory(page, "motherboard", "Motherboard");
  await page
    .locator("article")
    .filter({ hasText: "B450M-HDV" })
    .getByRole("button", { name: "Select component" })
    .click();
  await expect(
    page
      .locator("article")
      .filter({ hasText: "B450M-HDV" })
      .getByRole("button", { name: "Selected" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Hardware compatibility is not guaranteed/).first(),
  ).toBeVisible();
  await expect(page.getByText(/processor uses an AM5 socket but/)).toHaveCount(
    0,
  );
  await page
    .locator("article")
    .filter({ hasText: "B650-PLUS" })
    .getByRole("button", { name: /^Select/ })
    .click();
  for (const [id, label, product] of [
    ["memory", "Memory / RAM", "Patriot Viper Venom"],
    ["gpu", "Graphics card", "RTX 5070 Ti"],
    ["cooler", "CPU cooling", "LM360"],
    ["psu", "Power supply", "850G-EVO"],
    ["ssd", "SSD storage", "IONZ G3"],
  ] as const) {
    await gotoCategory(page, id, label);
    await page
      .locator("article")
      .filter({ hasText: product })
      .getByRole("button", { name: /^Select/ })
      .first()
      .click();
  }
  const sheet = await summary(page);
  await expect(sheet.getByText("£2,492.85", { exact: true })).toBeVisible();
  await expect(sheet.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "8",
  );
  await expect(sheet.getByRole("checkbox")).toHaveCount(0);
  await sheet.getByRole("button", { name: /Review build/ }).click();
  await expect(
    page.getByRole("heading", { name: "Your specification." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Core components" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download specification/ }).click();
  expect((await download).suggestedFilename()).toBe(
    "kazauk-build-specification.txt",
  );
  await page
    .getByRole("button", { name: "Edit Processor", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Processor ESSENTIAL/ }),
  ).toBeVisible();
});
