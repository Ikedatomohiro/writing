import { test, expect } from "@playwright/test";

test.describe("/dashboard", () => {
  test("Blog, Threads, X カードが表示される", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // ダッシュボードのカードグリッドに3枚のカードが存在する
    // rounded-2xl クラスでサイドバーリンクと区別する
    const cards = page.locator('a.rounded-2xl');
    await expect(cards).toHaveCount(3);
  });

  test("Blog カードが /articles へのリンクである", async ({ page }) => {
    await page.goto("/dashboard");
    // サイドバーリンクではなく丸角カード（rounded-2xl）の中の Blog リンクを選択
    const blogCard = page.locator('a.rounded-2xl[href="/articles"]');
    await expect(blogCard).toBeVisible();
    await expect(blogCard.getByRole("heading", { name: "Blog" })).toBeVisible();
  });

  test("Threads カードが /threads へのリンクである", async ({ page }) => {
    await page.goto("/dashboard");
    const threadsCard = page.locator('a.rounded-2xl[href="/threads"]');
    await expect(threadsCard).toBeVisible();
    await expect(threadsCard.getByRole("heading", { name: "Threads" })).toBeVisible();
  });

  test("X カードが /x へのリンクである", async ({ page }) => {
    await page.goto("/dashboard");
    const xCard = page.locator('a.rounded-2xl[href="/x"]');
    await expect(xCard).toBeVisible();
    await expect(xCard.getByRole("heading", { name: "X" })).toBeVisible();
  });
});
