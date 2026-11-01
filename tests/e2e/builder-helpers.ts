import { type Page } from "@playwright/test";
import { CATEGORY_INFO, GROUPS } from "../../lib/builder/categories";
export async function gotoCategory(page: Page, id: string, label: string) {
  const select = page.getByRole("combobox", { name: "Choose a component" });
  if (await select.isVisible()) {
    await select.selectOption(id);
    return;
  }
  const nav = page.getByRole("navigation", {
    name: "Component categories",
    exact: true,
  });
  const category = CATEGORY_INFO.find((c) => c.id === id)!;
  const group = GROUPS[category.group]!;
  await nav
    .getByRole("group", { name: "Configuration groups" })
    .getByRole("button")
    .filter({ hasText: group.name })
    .click();
  await nav
    .locator("ol")
    .getByRole("button")
    .filter({ hasText: label })
    .first()
    .click();
}
export async function summary(page: Page) {
  const open = page.getByRole("button", { name: "Your build ↗", exact: true });
  if (await open.isVisible()) await open.click();
  return page.locator('aside[aria-label="Build summary"]:visible');
}
