import { expect, test } from "@playwright/test";

/**
 * End-to-end journey (brief 14):
 * Start Building -> select -> trigger an incompatibility -> resolve -> review -> edit.
 */

test("no horizontal overflow on the configurator", async ({ page }) => {
  await page.goto("/configure");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("homepage CTA reaches the configurator", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /start building/i }).first().click();
  await expect(page).toHaveURL(/\/configure/);
  await expect(page.getByRole("heading", { name: /your machine/i })).toBeVisible();
});

test("full journey: select, hit an incompatibility, resolve it, review, edit", async ({ page }) => {
  await page.goto("/configure");

  // 1. Pick an AM5 processor.
  await page.getByRole("heading", { name: "Processor" }).waitFor();
  const cpuCard = page.locator("article", { hasText: "Ryzen 7 7800X3D" });
  await cpuCard.getByRole("button", { name: /^select/i }).click();
  await expect(cpuCard.getByRole("button", { name: "Selected" })).toBeVisible();

  // 2. Deliberately choose the AM4 trap board.
  await page.getByRole("button", { name: /Motherboard/i }).first().click();
  const am4 = page.locator("article", { hasText: "B450M-HDV" });
  await am4.getByRole("button", { name: /select anyway/i }).click();

  // 3. The socket conflict must be explained with the real values.
  const issues = page.getByText(/different socket|AM5 socket but the motherboard/i).first();
  await expect(issues).toBeVisible();
  await expect(page.getByText(/AM4/).first()).toBeVisible();

  // 4. Resolve by switching to an AM5 board.
  const b650 = page.locator("article", { hasText: "B650-PLUS" });
  await b650.getByRole("button", { name: /^select/i }).click();
  await expect(b650.getByRole("button", { name: "Selected" })).toBeVisible();

  // 5. Complete the rest of the build.
  for (const [cat, product] of [
    ["Memory", "Patriot Viper Venom"],
    ["Graphics card", "RTX 5070 Ti"],
    ["Case", "KZ-Z Dual Dynamic"],
    ["CPU cooler", "LM360"],
    ["Power supply", "850G-EVO"],
  ] as const) {
    await page.getByRole("button", { name: new RegExp(cat, "i") }).first().click();
    const card = page.locator("article", { hasText: product });
    await card.getByRole("button", { name: /^select/i }).first().click();
  }

  // 6. On phones the summary lives behind the bottom bar, so open it first.
  // Exactly one copy is ever live: sheet below lg, inline lg-xl, column above.
  const openSheet = page.getByRole("button", { name: /^your build$/i });
  if (await openSheet.count()) await openSheet.click();

  const summary = page.locator('aside[aria-label="Build summary"]:visible');
  await expect(summary).toHaveCount(1);

  // 7. Total must be exactly the documented happy-path figure.
  await expect(summary.getByText("£2,448.69")).toBeVisible();
  // 8. Acknowledge the unverifiable connector data, then review.
  const ack = summary.getByRole("checkbox");
  if (await ack.count()) await ack.check();
  await summary.getByRole("button", { name: /review build/i }).click();
  await expect(page.getByText(/build sheet/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your machine", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^components$/i })).toBeVisible();

  // The review screen must not overflow either - it is a separate layout and
  // the earlier assertion only covered the selection screen.
  const reviewOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(reviewOverflow).toBeLessThanOrEqual(1);

  // 8. Edit a component from the review sheet.
  await page.getByRole("button", { name: /^Edit Processor$/i }).click();
  await expect(page.getByRole("heading", { name: "Processor" })).toBeVisible();
});
