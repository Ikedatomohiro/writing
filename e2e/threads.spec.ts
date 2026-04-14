import { test, expect } from "@playwright/test";

test.describe("/threads", () => {
  test.beforeEach(async ({ page }) => {
    // セッションストレージをクリアして初期状態を確保
    await page.goto("/threads");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
  });

  test("一覧ページが表示される", async ({ page }) => {
    await expect(page).toHaveURL(/\/threads/);
    await expect(page.getByText("Threads管理")).toBeVisible();
  });

  test("タブ (all / draft / queued / posted) が存在する", async ({ page }) => {
    const tabs = ["all", "draft", "queued", "posted"];
    for (const tab of tabs) {
      await expect(page.getByRole("button", { name: tab })).toBeVisible();
    }
  });

  test("タブ切替で active スタイルが変わる", async ({ page }) => {
    // デフォルトは draft タブ
    const draftTab = page.getByRole("button", { name: "draft" });
    await expect(draftTab).toHaveClass(/bg-blue-600/);

    // all タブをクリックすると active になる
    const allTab = page.getByRole("button", { name: "all" });
    await allTab.click();
    await expect(allTab).toHaveClass(/bg-blue-600/);
    await expect(draftTab).not.toHaveClass(/bg-blue-600/);
  });

  test("新規作成ボタンが /threads/new へのリンクである", async ({ page }) => {
    const newLink = page.getByRole("link", { name: /新規作成/ });
    await expect(newLink).toBeVisible();
    await expect(newLink).toHaveAttribute("href", "/threads/new");
  });
});
