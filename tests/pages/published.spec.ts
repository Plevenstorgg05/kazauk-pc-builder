import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { CATEGORY_INFO } from "../../lib/builder/categories";
import { gotoCategory, summary } from "../e2e/builder-helpers";

test("published homepage loads its images and animation frames within the project path", async ({ page, request, baseURL }) => {
  const errors: string[] = [];
  const failed: string[] = [];
  const frames = new Set<string>();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(baseURL!) && response.status() >= 400) failed.push(response.url());
    if (response.url().includes("/ionz_frames/") && response.ok()) frames.add(response.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./#showroom");
  await page.locator(".frame-scroll").waitFor({ state: "attached" });
  const showroom = page.locator("[data-post-cinematic]");
  await expect(showroom.locator("img")).toHaveCount(14);
  await showroom.locator("img").evaluateAll((images) => {
    for (const image of images as HTMLImageElement[]) image.loading = "eager";
  });
  await expect(showroom.locator('[data-media-state="photo"]')).toHaveCount(14);
  await expect.poll(() => frames.size).toBe(90);
  const prefix = new URL(baseURL!).pathname;
  for (const image of await showroom.locator("img").all()) {
    const src = new URL((await image.getAttribute("src"))!, baseURL);
    expect(src.origin).toBe(new URL(baseURL!).origin);
    expect(src.pathname.startsWith(`${prefix}products/`)).toBe(true);
  }
  // Binary integrity checks validate deployment copies, not animation rendering changes.
  for (const number of [1, 90, 121]) {
    const name = `frame_${String(number).padStart(4, "0")}.jpg`;
    const response = await request.get(`ionz_frames/${name}`);
    expect(response.ok()).toBe(true);
    expect(Buffer.compare(await response.body(), await readFile(`public/ionz_frames/${name}`))).toBe(0);
  }
  await showroom.locator("#components").getByRole("link").filter({ hasText: "Graphics cards" }).click();
  await expect(page).toHaveURL(new RegExp(`${prefix}configure/\\?category=gpu$`));
  await expect(page.getByRole("heading", { name: /Graphics card ESSENTIAL/ })).toBeVisible();
  await page.getByRole("link", { name: "KAZAUK home", exact: true }).click();
  await expect(page.locator("[data-post-cinematic]")).toBeAttached();
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test("all 84 products select, replace, save and display media in the static export", async ({ page, baseURL }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  const failed: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(baseURL!) && response.status() >= 400) failed.push(response.url());
  });
  await page.goto("configure/");
  const selected: Record<string, string> = {};
  let count = 0;
  let photos = 0;
  let illustrations = 0;
  for (const category of CATEGORY_INFO) {
    await gotoCategory(page, category.id, category.label);
    const cards = page.locator("article[data-product-id]");
    if (!(await cards.count())) await expect(page.getByText("CATALOGUE READY / PRODUCTS PENDING")).toBeVisible();
    await cards.locator("img").evaluateAll(async (images) => {
      for (const image of images as HTMLImageElement[]) image.loading = "eager";
      await Promise.all((images as HTMLImageElement[]).map((image) => image.decode()));
    });
    for (const card of await cards.all()) {
      const media = card.locator("[data-product-media]");
      await expect(media).not.toHaveAttribute("data-media-state", "loading");
      if ((await media.getAttribute("data-media-state")) === "photo") photos++;
      else {
        illustrations++;
        await expect(media.getByText("ILLUSTRATION", { exact: true })).toBeVisible();
        await expect(media.locator("img")).toHaveCount(0);
      }
      await card.getByRole("button", { name: /^Select/ }).click();
      selected[category.id] = (await card.getAttribute("data-product-id"))!;
      await expect(card.getByRole("button", { name: "Selected", exact: true })).toBeVisible();
      count++;
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  expect({ count, photos, illustrations }).toEqual({ count: 84, photos: 79, illustrations: 5 });
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("ionz-builder-v2") ?? "{}"))).toEqual(selected);
  await page.reload();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("ionz-builder-v2") ?? "{}"))).toEqual(selected);
  const sheet = await summary(page);
  await expect(sheet.getByText("Known subtotal", { exact: true })).toBeVisible();
  await expect(sheet.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "8");
  await sheet.getByRole("button", { name: /Review build/ }).click();
  await expect(page.getByRole("heading", { name: "Your specification.", exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download specification/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("kazauk-build-specification.txt");
  const text = await readFile((await download.path())!, "utf8");
  expect(text).toContain("KAZAUK");
  expect(text).toContain("component combinations are unrestricted");
  expect(text).toContain("Quote required");
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test("gallery, filters, comparison, sharing and reset work on project Pages", async ({ page, browser, baseURL }) => {
  await page.goto("configure/?category=case");
  await page.locator('[data-product-id="case-ionz-kz-z-v2"]').getByRole("button", { name: /^Inspect/ }).click();
  const details = page.getByRole("dialog", { name: "Product details" });
  await expect(details.locator('[data-media-state="photo"]')).toHaveCount(1);
  for (const view of [2, 3]) {
    await details.getByRole("button", { name: `View ${view}`, exact: true }).click();
    await expect(details.locator('[data-media-state="photo"]')).toHaveCount(1);
  }
  await details.getByRole("button", { name: "Enlarge product image" }).click();
  await expect(details.getByRole("button", { name: "Reduce product image" })).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await gotoCategory(page, "cpu", "Processor");
  await page.getByRole("searchbox", { name: "Search products" }).fill("7600");
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.getByRole("combobox", { name: "Sort products" }).selectOption("low");
  const prices = await page.locator("article").evaluateAll((cards) => cards.map((card) => Number(card.textContent!.match(/£([\d,.]+)/)![1]!.replaceAll(",", ""))));
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
  const firstComparedId = await page.locator("article").first().getAttribute("data-product-id");
  for (const index of [0, 1]) await page.locator("article").nth(index).getByRole("button", { name: /Compare/ }).click();
  await page.getByRole("button", { name: /Compare 2 products/ }).click();
  const compare = page.getByRole("dialog", { name: "Compare components" });
  await compare.getByRole("checkbox", { name: "Show differences only" }).check();
  await compare.getByRole("button", { name: /^Select/ }).first().click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Save & share ↗", exact: true }).first().click();
  const shared = page.getByRole("dialog", { name: "Save & share your build" });
  const link = await shared.getByRole("textbox").inputValue();
  expect(link.startsWith(`${baseURL}configure/`)).toBe(true);
  expect(new URL(link).searchParams.has("category")).toBe(false);
  const context = await browser.newContext();
  const other = await context.newPage();
  try {
    await other.goto(link);
    await expect.poll(() => other.evaluate(() => JSON.parse(localStorage.getItem("ionz-builder-v2") ?? "{}"))).toEqual({ cpu: firstComparedId });
  } finally { await context.close(); }
  await page.keyboard.press("Escape");
  const sheet = await summary(page);
  await sheet.getByRole("button", { name: "Reset build", exact: true }).click();
  await page.getByRole("dialog", { name: "Reset your build?" }).getByRole("button", { name: "Reset build", exact: true }).click();
  await page.reload();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("ionz-builder-v2") ?? "{}"))).toEqual({});
});

test("static failed-image fallback and direct routes work without a Next.js server", async ({ page, request, baseURL }) => {
  await page.route("**/products/case-ionz-kz-900-v2-1.webp", (route) => route.fulfill({ status: 404, body: "Injected image failure" }));
  await page.goto("configure/?category=case");
  const card = page.locator('[data-product-id="case-ionz-kz-900-v2"]');
  await expect(card.locator("[data-product-media]")).toHaveAttribute("data-media-state", "illustration");
  await expect(card.getByText("ILLUSTRATION", { exact: true })).toBeVisible();
  await expect(card.locator("img")).toHaveCount(0);
  const direct = await request.get("configure?category=ssd");
  expect(direct.ok()).toBe(true);
  expect(direct.url()).toContain("/configure/?category=ssd");
  await page.goto("configure/?category=ssd");
  await expect(page.getByRole("heading", { name: /SSD storage ESSENTIAL/ })).toBeVisible();
  const missing = await page.goto("does-not-exist/");
  expect(missing!.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  expect(await page.getByRole("link", { name: "Start building", exact: true }).getAttribute("href")).toBe(`${new URL(baseURL!).pathname}configure/`);
});
