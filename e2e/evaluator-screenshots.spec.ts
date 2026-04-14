import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// スクショ保存先
const SHOT_DIR = "test-results/evaluator";

test.beforeAll(() => {
  fs.mkdirSync(path.resolve(SHOT_DIR), { recursive: true });
});

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: true });
}

async function openSidebar(page: Page) {
  // layoutは localStorage.sidebar_open を参照するので、訪問前に仕込む
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("sidebar_open", "true");
    } catch {}
  });
}

test.describe("evaluator: 管理UIスクショ", () => {
  test("desktop: /dashboard", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/dashboard");
    // ヘッダーのh2タイトルに絞って確認（ページ内に複数のh2があるためheader内に限定）
    await expect(page.locator("header").getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await shot(page, "01-dashboard");
  });

  test("desktop: /threads draft タブ", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/threads");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await expect(page.getByText("Threads管理")).toBeVisible();
    // 読み込み完了を待つ
    await page.waitForLoadState("networkidle");
    await shot(page, "02-threads-draft");
  });

  test("desktop: /threads queued タブ", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/threads");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.getByRole("button", { name: "queued" }).click();
    await page.waitForLoadState("networkidle");
    await shot(page, "03-threads-queued");
  });

  test("desktop: /x default (pao-pao-cho)", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/x");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await expect(page.getByText("X管理")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await shot(page, "04-x-pao-pao-cho");

    // accessibility.snapshotはPlaywright最新版では廃止のためスキップ
  });

  test("desktop: /x matsumoto_sho", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/x");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.locator("select").first().selectOption("matsumoto_sho");
    await page.waitForLoadState("networkidle");
    await shot(page, "05-x-matsumoto-sho");
  });

  test("desktop: /x/new 初期", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/x/new");
    await expect(page.getByRole("heading", { name: "新規X投稿作成" })).toBeVisible();
    await shot(page, "06-x-new-empty");

    // accessibility.snapshotはPlaywright最新版では廃止のためスキップ
  });

  test("desktop: /x/new 290文字入力で超過", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/x/new");
    const textarea = page.getByLabel("投稿本文");
    await textarea.fill("あ".repeat(290));
    await expect(page.getByTestId("x-char-count")).toHaveText("290/280");
    await shot(page, "07-x-new-overflow");
  });

  test("desktop: sidebar focus 状態 (Tab 巡回)", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/dashboard");
    // Tabキーを繰り返し押して focus ringを確認
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await shot(page, "08-sidebar-focus");

    // どの要素にフォーカスがあるか記録
    const focusedTexts: string[] = [];
    await page.goto("/dashboard");
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      const text = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return "(none)";
        return `${el.tagName}:${(el.textContent ?? "").trim().slice(0, 40)}|href=${el.getAttribute("href") ?? ""}`;
      });
      focusedTexts.push(text);
    }
    fs.writeFileSync(
      `${SHOT_DIR}/08-tab-order.json`,
      JSON.stringify(focusedTexts, null, 2),
    );
  });

  test("mobile 375: /dashboard", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await shot(page, "09-mobile-dashboard");
  });

  test("mobile 375: /threads", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/threads");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");
    await shot(page, "10-mobile-threads");
  });

  test("mobile 375: /x", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/x");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");
    await shot(page, "11-mobile-x");
  });

  test("mobile 375: /x/new", async ({ page }) => {
    await openSidebar(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/x/new");
    await page.waitForLoadState("networkidle");
    await shot(page, "12-mobile-x-new");
  });
});
