import { expect, test } from "@playwright/test";
import { CATEGORY_INFO } from "../../lib/builder/categories";
import { gotoCategory } from "./builder-helpers";
test("all product media renders as a loaded exact photo or labelled category illustration", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  const failures: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && response.url().includes("localhost"))
      failures.push(response.url());
  });
  await page.goto("/configure");
  let photos = 0;
  let illustrations = 0;
  for (const category of CATEGORY_INFO) {
    await gotoCategory(page, category.id, category.label);
    const cards = page.locator("article[data-product-id]");
    await cards.locator("img").evaluateAll(async (elements) => {
      const images = elements as HTMLImageElement[];
      images.forEach((i) => (i.loading = "eager"));
      await Promise.all(images.map((i) => i.decode()));
    });
    for (const card of await cards.all()) {
      const media = card.locator("[data-product-media]");
      await expect(media).not.toHaveAttribute("data-media-state", "loading");
      const state = await media.getAttribute("data-media-state");
      if (state === "photo") {
        photos++;
        await expect(media.locator("img")).toBeVisible();
      } else {
        illustrations++;
        await expect(
          media.getByText("ILLUSTRATION", { exact: true }),
        ).toBeVisible();
        await expect(
          media.locator(`[data-illustration-kind="${category.id}"]`),
        ).toBeVisible();
        await expect(media.locator("img")).toHaveCount(0);
      }
    }
  }
  expect(photos).toBe(79);
  expect(illustrations).toBe(5);
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
});
test("failed product images become labelled illustrations instead of broken icons", async ({
  page,
}) => {
  await page.route("**/_next/image**", (route) => {
    const src = new URL(route.request().url()).searchParams.get("url") ?? "";
    if (src.includes("case-ionz-kz-900-v2-1.webp"))
      return route.fulfill({
        status: 404,
        body: "Image intentionally unavailable in test",
      });
    return route.continue();
  });
  await page.goto("/configure");
  const card = page.locator('[data-product-id="case-ionz-kz-900-v2"]');
  await expect(card.locator("[data-product-media]")).toHaveAttribute(
    "data-media-state",
    "illustration",
  );
  await expect(card.getByText("ILLUSTRATION", { exact: true })).toBeVisible();
  await expect(card.locator('[data-illustration-kind="case"]')).toBeVisible();
  await expect(card.locator("img")).toHaveCount(0);
});
test("slow image responses show a component drawing until the photograph is ready", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/_next/image**", async (route) => {
    const src = new URL(route.request().url()).searchParams.get("url") ?? "";
    if (src.includes("case-ionz-kz-900-v2-1.webp")) await gate;
    await route.continue();
  });
  await page.goto("/configure", { waitUntil: "domcontentloaded" });
  const card = page.locator('[data-product-id="case-ionz-kz-900-v2"]');
  await expect(card.locator("[data-product-media]")).toHaveAttribute(
    "data-media-state",
    "loading",
  );
  await expect(card.locator('[data-illustration-kind="case"]')).toBeVisible();
  await expect(
    card.getByText("LOADING PHOTOGRAPH", { exact: true }),
  ).toBeVisible();
  release();
  await expect(card.locator("[data-product-media]")).toHaveAttribute(
    "data-media-state",
    "photo",
  );
});
test("image galleries, zoom and comparison capacity remain usable", async ({
  page,
}) => {
  await page.goto("/configure");
  const card = page.locator('[data-product-id="case-ionz-kz-z-v2"]');
  await card.getByRole("button", { name: /^Inspect / }).click();
  const dialog = page.getByRole("dialog", { name: "Product details" });
  await expect(dialog.locator('[data-media-state="photo"]')).toHaveCount(1);
  const first = await dialog.locator("img").getAttribute("src");
  for (const view of [2, 3]) {
    await dialog
      .getByRole("button", { name: `View ${view}`, exact: true })
      .click();
    await expect(dialog.locator('[data-media-state="photo"]')).toHaveCount(1);
    expect(await dialog.locator("img").getAttribute("src")).not.toBe(first);
  }
  const zoom = dialog.getByRole("button", { name: "Enlarge product image" });
  await zoom.click();
  await expect(
    dialog.getByRole("button", { name: "Reduce product image" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  for (const index of [0, 1, 2])
    await page
      .locator("article[data-product-id]")
      .nth(index)
      .getByRole("button", { name: /Compare/ })
      .click();
  await expect(
    page
      .locator("article[data-product-id]")
      .nth(3)
      .getByRole("button", { name: /Compare/ }),
  ).toBeDisabled();
  await expect(
    page
      .locator("article[data-product-id]")
      .nth(3)
      .getByRole("button", { name: /^Select/ }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(
    page
      .locator("article[data-product-id]")
      .nth(3)
      .getByRole("button", { name: /Compare/ }),
  ).toBeEnabled();
});
