import { expect, test } from "@playwright/test";
import { gotoCategory, summary } from "./builder-helpers";
test("search, specification filter, comparison and keyboard detail dismissal", async ({
  page,
}) => {
  await page.goto("/configure");
  await gotoCategory(page, "cpu", "Processor");
  await page.getByRole("searchbox", { name: "Search products" }).fill("7800");
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.getByText("More filters", { exact: false }).click();
  await page
    .getByRole("searchbox", { name: "Specification contains" })
    .fill("AM4");
  await expect(page.locator("article")).toHaveCount(0);
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.getByText("More filters", { exact: false }).click();
  const first = page.locator("article").filter({ hasText: "Ryzen 5 7600" });
  const inspect = first.getByRole("button", { name: /^Inspect / });
  await inspect.click();
  const details = page.getByRole("dialog", { name: "Product details" });
  await expect(details).toBeVisible();
  await expect(
    details.getByRole("heading", { name: /Ryzen 5 7600/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(details).not.toBeVisible();
  await expect(inspect).toBeFocused();
  await first.getByRole("button", { name: /Compare/ }).click();
  await page
    .locator("article")
    .filter({ hasText: "Ryzen 7 7800X3D" })
    .getByRole("button", { name: /Compare/ })
    .click();
  await page.getByRole("button", { name: /Compare 2 products/ }).click();
  const comparison = page.getByRole("dialog", { name: "Compare components" });
  await expect(comparison).toBeVisible();
  await comparison
    .getByRole("checkbox", { name: "Show differences only" })
    .check();
  await expect(comparison.getByText("6", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
});
test("saved build restores; reset requires explicit confirmation", async ({
  page,
}) => {
  await page.goto("/configure");
  await gotoCategory(page, "cpu", "Processor");
  await page
    .locator("article")
    .filter({ hasText: "Ryzen 5 7600" })
    .getByRole("button", { name: /^Select/ })
    .click();
  await page.reload();
  let sheet = await summary(page);
  await expect(sheet.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "2",
  );
  await expect(
    sheet.getByText("£175.95", { exact: true }).last(),
  ).toBeVisible();
  await sheet.getByRole("button", { name: "Reset build", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Reset your build?" });
  await dialog.getByRole("button", { name: "Keep my build" }).click();
  await expect(
    sheet.getByText("£175.95", { exact: true }).last(),
  ).toBeVisible();
  await sheet.getByRole("button", { name: "Reset build", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Reset build", exact: true })
    .click();
  await page.reload();
  sheet = await summary(page);
  await expect(sheet.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
});
test("shared builds reject wrong-category IDs and retain valid expanded selections", async ({
  page,
}) => {
  const build = {
    cpu: "cpu-r7-7800x3d",
    motherboard: "cpu-r5-7600",
    gpu: "made-up",
    ssd: "research-ssd-ionzg3-1tb-ssd",
  };
  await page.goto(
    "/configure?build=" + encodeURIComponent(JSON.stringify(build)),
  );
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("ionz-builder-v2") ?? "{}"),
      ),
    )
    .toEqual({ cpu: build.cpu, ssd: build.ssd });
  const sheet = await summary(page);
  await expect(sheet.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "2",
  );
});
test("optional categories and empty catalogue preserve essential progress", async ({
  page,
}) => {
  await page.goto("/configure");
  await gotoCategory(page, "mouse", "Mouse");
  await page
    .locator("article")
    .first()
    .getByRole("button", { name: /^Select/ })
    .click();
  await gotoCategory(page, "sound", "Sound cards");
  await expect(
    page.getByText("CATALOGUE READY / PRODUCTS PENDING"),
  ).toBeVisible();
  const sheet = await summary(page);
  await expect(sheet.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await expect(sheet.getByText("Optional hardware & extras (1)")).toBeVisible();
});
test("details, comparison and all layouts fit narrow screens", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/configure");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await page
      .locator("article")
      .first()
      .getByRole("button", { name: /^Inspect / })
      .click();
    expect(
      await page
        .getByRole("dialog")
        .evaluate((el) => el.scrollWidth - el.clientWidth),
    ).toBeLessThanOrEqual(1);
    await page.keyboard.press("Escape");
    await page
      .locator("article")
      .nth(0)
      .getByRole("button", { name: /Compare/ })
      .click();
    await page
      .locator("article")
      .nth(1)
      .getByRole("button", { name: /Compare/ })
      .click();
    await page.getByRole("button", { name: /Compare 2 products/ }).click();
    expect(
      await page
        .getByRole("dialog")
        .evaluate((el) => el.scrollWidth - el.clientWidth),
    ).toBeLessThanOrEqual(1);
    await page.keyboard.press("Escape");
  }
});
