import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
const original = JSON.parse(
  readFileSync(
    new URL("../../data/kazauk-am5-demo-parts.json", import.meta.url),
    "utf8",
  ),
) as { parts: Record<string, { id: string }[]> };
const researched = JSON.parse(
  readFileSync(
    new URL("../../lib/builder/researched-products.json", import.meta.url),
    "utf8",
  ),
) as { id: string; category: string }[];
const PRODUCTS = [
  ...Object.entries(original.parts).flatMap(([category, parts]) =>
    parts.map((p) => ({ ...p, category })),
  ),
  ...researched,
];
const productsIn = (category: string) =>
  PRODUCTS.filter((p) => p.category === category);
import { CATEGORY_INFO } from "../../lib/builder/categories";
import { gotoCategory, summary } from "./builder-helpers";
test("every product is selectable and replaceable across all 29 categories", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/configure");
  const expected: Record<string, string> = {};
  for (const category of CATEGORY_INFO) {
    await gotoCategory(page, category.id, category.label);
    const products = productsIn(category.id);
    if (!products.length) {
      await expect(
        page.getByText("CATALOGUE READY / PRODUCTS PENDING"),
      ).toBeVisible();
      continue;
    }
    for (const product of products) {
      const card = page.locator(`[data-product-id="${product.id}"]`);
      await expect(card.getByRole("button", { name: /^Select/ })).toBeEnabled();
      await card.getByRole("button", { name: /^Select/ }).click();
      expected[category.id] = product.id;
      await expect(
        card.getByRole("button", { name: "Selected", exact: true }),
      ).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(() =>
            JSON.parse(localStorage.getItem("ionz-builder-v2") ?? "{}"),
          ),
        )
        .toEqual(expected);
    }
  }
  const sheet = await summary(page);
  await expect(
    sheet.getByRole("button", { name: /Review build/ }),
  ).toBeEnabled();
  await expect(
    sheet.getByText("Known subtotal", { exact: true }),
  ).toBeVisible();
  await expect(sheet.getByText(/require a quote/)).toBeVisible();
  await sheet
    .getByRole("button", { name: "Remove PC case", exact: true })
    .click();
  delete expected.case;
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("ionz-builder-v2") ?? "{}"),
      ),
    )
    .toEqual(expected);
  expect(PRODUCTS).toHaveLength(84);
});
test("share link restores selections in a new browser context", async ({
  page,
  browser,
}) => {
  await page.goto("/configure?category=hdd");
  await page
    .locator("article")
    .first()
    .getByRole("button", { name: /^Select/ })
    .click();
  await page
    .getByRole("button", { name: "Save & share ↗", exact: true })
    .first()
    .click();
  const share = page.getByRole("dialog", { name: "Save & share your build" });
  const url = await share.getByRole("textbox").inputValue();
  const context = await browser.newContext();
  const other = await context.newPage();
  await other.goto(url);
  await expect
    .poll(() =>
      other.evaluate(() =>
        JSON.parse(localStorage.getItem("ionz-builder-v2") ?? "{}"),
      ),
    )
    .toEqual({ hdd: "research-hdd-wd60efpx" });
  await context.close();
});
test("manufacturer, price sorting and maximum-price filters update the actual products", async ({
  page,
}) => {
  await page.goto("/configure?category=ssd");
  await expect(
    page.getByRole("heading", { name: /SSD storage ESSENTIAL/ }),
  ).toBeVisible();
  await page.getByText("More filters", { exact: false }).click();
  await page
    .getByRole("group", { name: "Manufacturer" })
    .getByRole("button", { name: "ADATA", exact: true })
    .click();
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.locator("article")).toContainText("ADATA");
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page
    .getByRole("combobox", { name: "Sort products" })
    .selectOption("low");
  const amounts = await page
    .locator("article")
    .evaluateAll((cards) =>
      cards.map((card) =>
        Number(card.textContent!.match(/£([\d,.]+)/)![1]!.replaceAll(",", "")),
      ),
    );
  expect(amounts).toEqual([...amounts].sort((a, b) => a - b));
  await page.getByRole("spinbutton", { name: "Maximum price (£)" }).fill("60");
  const filtered = await page
    .locator("article")
    .evaluateAll((cards) =>
      cards.map((card) =>
        Number(card.textContent!.match(/£([\d,.]+)/)![1]!.replaceAll(",", "")),
      ),
    );
  expect(filtered.length).toBeGreaterThan(0);
  expect(filtered.every((price) => price <= 60)).toBe(true);
});
test("storage failure and clipboard denial keep the build usable with clear feedback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = function () {
      throw new Error("Storage blocked");
    };
    Storage.prototype.setItem = function () {
      throw new Error("Storage blocked");
    };
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () => Promise.reject(new Error("Clipboard unavailable")),
      },
      configurable: true,
    });
  });
  await page.goto("/configure");
  const firstCaseId = await page
    .locator("article")
    .first()
    .getAttribute("data-product-id");
  await page
    .locator("article")
    .first()
    .getByRole("button", { name: /^Select/ })
    .click();
  const sheet = await summary(page);
  await expect(sheet.getByText("Local saving unavailable")).toBeVisible();
  await sheet
    .getByRole("button", { name: "Save & share ↗", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Save & share your build" });
  await expect(dialog).toContainText("Local saving is unavailable");
  await dialog.getByRole("button", { name: /Copy build link/ }).click();
  await expect(dialog.getByRole("textbox")).toBeFocused();
  expect(await dialog.getByRole("textbox").inputValue()).toContain(
    firstCaseId!,
  );
});
