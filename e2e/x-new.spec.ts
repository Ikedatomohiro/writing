import { test, expect } from "@playwright/test";

test.describe("/x/new", () => {
  test("フォームが表示される", async ({ page }) => {
    await page.goto("/x/new");
    await expect(page).toHaveURL(/\/x\/new/);
    await expect(page.getByText("新規X投稿作成")).toBeVisible();
  });

  test("アカウント select が pao-pao-cho と matsumoto_sho を含む", async ({ page }) => {
    await page.goto("/x/new");
    // アカウントラベルのある select（最初の combobox）
    const accountSelect = page.locator("select").first();
    await expect(accountSelect).toBeVisible();
    await expect(accountSelect.locator("option[value='pao-pao-cho']")).toHaveCount(1);
    await expect(accountSelect.locator("option[value='matsumoto_sho']")).toHaveCount(1);
  });

  test("テーマ入力フィールドが存在する", async ({ page }) => {
    await page.goto("/x/new");
    const themeInput = page.getByPlaceholder("テーマを入力...");
    await expect(themeInput).toBeVisible();
  });

  test("textarea に 140 文字入力すると文字数カウンタが 140/280 を表示する", async ({ page }) => {
    await page.goto("/x/new");
    const textarea = page.getByRole("textbox", { name: "投稿本文" });
    // fill() はネイティブ input イベントを発行しないため pressSequentially を使用
    await textarea.click();
    await textarea.pressSequentially("a".repeat(140), { delay: 0 });

    const counter = page.getByTestId("x-char-count");
    await expect(counter).toHaveText("140/280");
    await expect(counter).not.toHaveClass(/text-red-600/);
  });

  test("textarea に 290 文字入力すると文字数カウンタが超過表示（赤）になる", async ({ page }) => {
    await page.goto("/x/new");
    const textarea = page.getByRole("textbox", { name: "投稿本文" });
    await textarea.click();
    await textarea.pressSequentially("a".repeat(290), { delay: 0 });

    const counter = page.getByTestId("x-char-count");
    await expect(counter).toHaveText("290/280");
    await expect(counter).toHaveClass(/text-red-600/);
  });

  test("保存ボタンが存在する", async ({ page }) => {
    await page.goto("/x/new");
    const saveButton = page.getByRole("button", { name: "保存" });
    await expect(saveButton).toBeVisible();
  });

  test("280 文字超過時に保存ボタンが disabled になる", async ({ page }) => {
    await page.goto("/x/new");
    const textarea = page.getByRole("textbox", { name: "投稿本文" });
    await textarea.click();
    await textarea.pressSequentially("a".repeat(290), { delay: 0 });

    const saveButton = page.getByRole("button", { name: "保存" });
    await expect(saveButton).toBeDisabled();
  });
});
