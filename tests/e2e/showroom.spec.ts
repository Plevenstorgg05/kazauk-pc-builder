import { expect, test } from "@playwright/test";
test("showroom follows the cinematic boundary and all hardware links target real categories", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const root = page.locator("[data-post-cinematic]");
  await expect(
    root.getByRole("heading", {
      name: "PC hardware. Your specification.",
    }),
  ).toBeVisible();
  await page.locator(".frame-scroll").waitFor({ state: "attached" });
  expect(
    await page.evaluate(() => {
      const cinematic = document.querySelector(".frame-scroll");
      const showroom = document.querySelector("[data-post-cinematic]");
      return Boolean(
        cinematic &&
          showroom &&
          cinematic.compareDocumentPosition(showroom) &
            Node.DOCUMENT_POSITION_FOLLOWING,
      );
    }),
  ).toBe(true);
  for (const title of [
    "Begin with the case.",
    "Components, by function.",
    "Before you choose.",
    "Read the specification.",
    "Selected hardware.",
    "Build a specification.",
  ])
    await expect(
      root.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  const links = await root
    .locator('a[href^="/configure?category="]')
    .evaluateAll((es) => es.map((e) => e.getAttribute("href")));
  expect(new Set(links).size).toBeGreaterThanOrEqual(7);
  await root
    .locator("#components")
    .getByRole("link")
    .filter({ hasText: "Graphics cards" })
    .click();
  await expect(page).toHaveURL(/category=gpu/);
  await expect(
    page.getByRole("heading", { name: /Graphics card ESSENTIAL/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("hardware field notes support tabs, keyboard navigation and FAQs", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#learn");
  const tabs = page.getByRole("tablist", { name: "Hardware explained" });
  const gpu = tabs.getByRole("tab", { name: /Graphics card/ });
  await gpu.click();
  await expect(page.getByRole("tabpanel")).toContainText("VRAM");
  await gpu.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: /Memory/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("tabpanel")).toContainText("Latency");
  await tabs.getByRole("tab", { name: /Memory/ }).press("Home");
  await page.getByRole("tabpanel").locator("summary").click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Some boxed CPUs include one.",
  );
});
test("showroom and featured product photographs fit desktop, tablet and mobile", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 1024, 1512]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#showroom");
    await page.locator(".frame-scroll").waitFor({ state: "attached" });
    const root = page.locator("[data-post-cinematic]");
    await expect(root.locator("img")).toHaveCount(14);
    await root.locator("img").evaluateAll((elements) => {
      for (const image of elements as HTMLImageElement[])
        image.loading = "eager";
    });
    await expect
      .poll(() =>
        root
          .locator("img")
          .evaluateAll((elements) =>
            (elements as HTMLImageElement[]).every(
              (image) => image.complete && image.naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    await expect(
      root.locator('[data-product-media][data-media-state="photo"]'),
    ).toHaveCount(14);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await expect
      .poll(() =>
        root
          .locator("img")
          .evaluateAll(
            (elements) =>
              elements.length === 14 &&
              (elements as HTMLImageElement[]).every(
                (image) => image.complete && image.naturalWidth > 0,
              ),
          ),
      )
      .toBe(true);
  }
});
