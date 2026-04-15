import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";

test.describe("sidebar redesign", () => {
  test("desktop expanded: icons + labels visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/dashboard`);
    const sidebar = page.getByTestId("admin-sidebar");
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /ダッシュボード/ })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /Threads/ })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /^X$/ })).toBeVisible();
    // 生テキスト「dashboard」「forum」等が表示されないこと
    await expect(sidebar.locator("text=/^forum$/")).toHaveCount(0);
    await expect(sidebar.locator("text=/^alternate_email$/")).toHaveCount(0);
    await page.screenshot({ path: "test-results/sidebar-desktop-expanded.png", fullPage: false });
  });

  test("desktop collapsed: only icons remain", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole("button", { name: "サイドバーを折りたたむ" }).click();
    const expandBtn = page.getByRole("button", { name: "サイドバーを展開" });
    await expect(expandBtn).toBeVisible();
    const sidebar = page.getByTestId("admin-sidebar");
    await expect(sidebar.getByText("ダッシュボード")).toHaveCount(0);
    await page.screenshot({ path: "test-results/sidebar-desktop-collapsed.png", fullPage: false });
    await expandBtn.click();
    await expect(sidebar.getByText("ダッシュボード")).toBeVisible();
  });

  test("mobile: menu button opens overlay sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole("button", { name: "メニューを開く" }).click();
    const sidebar = page.getByTestId("admin-sidebar");
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText("ダッシュボード")).toBeVisible();
    await page.screenshot({ path: "test-results/sidebar-mobile-open.png", fullPage: false });
  });
});
