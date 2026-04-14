import { test, expect } from "@playwright/test";

test.describe("/x", () => {
  test.beforeEach(async ({ page }) => {
    // セッションストレージをクリアして初期状態を確保
    await page.goto("/x");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
  });

  test("一覧ページが表示される", async ({ page }) => {
    await expect(page).toHaveURL(/\/x$/);
    await expect(page.getByText("X管理")).toBeVisible();
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

    // queued タブをクリックすると active になる
    const queuedTab = page.getByRole("button", { name: "queued" });
    await queuedTab.click();
    await expect(queuedTab).toHaveClass(/bg-blue-600/);
    await expect(draftTab).not.toHaveClass(/bg-blue-600/);
  });

  test("pao-pao-cho アカウントで fetch URL に account パラメータが含まれる", async ({ page }) => {
    const apiRequestPromise = page.waitForRequest((req) =>
      req.url().includes("/api/x/series")
    );

    await page.goto("/x");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    const req = await apiRequestPromise;
    expect(req.url()).toContain("account=pao-pao-cho");
  });

  test("matsumoto_sho に切り替えると fetch URL に account パラメータが含まれる", async ({ page }) => {
    await page.goto("/x");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    // アカウントを切り替える前にリクエストを待ち受ける
    const requestPromise = page.waitForRequest((req) =>
      req.url().includes("/api/x/series") && req.url().includes("account=matsumoto_sho")
    );

    const select = page.locator("select").first();
    await select.selectOption("matsumoto_sho");

    const req = await requestPromise;
    expect(req.url()).toContain("account=matsumoto_sho");
  });

  test("新規作成ボタンが /x/new へのリンクである", async ({ page }) => {
    const newLink = page.getByRole("link", { name: /新規作成/ });
    await expect(newLink).toBeVisible();
    await expect(newLink).toHaveAttribute("href", "/x/new");
  });
});
