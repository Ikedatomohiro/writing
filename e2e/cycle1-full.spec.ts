import { test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SHOT_DIR = "test-results/cycle1";
const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 375, height: 667 };

test.beforeAll(() => {
  fs.mkdirSync(path.resolve(SHOT_DIR), { recursive: true });
});

async function openSidebar(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("sidebar_open", "true");
    } catch {}
  });
}

async function shot(page: Page, name: string) {
  await page.screenshot({
    path: `${SHOT_DIR}/${name}.png`,
    fullPage: true,
  });
}

async function settle(page: Page) {
  try {
    await page.waitForLoadState("networkidle", { timeout: 8000 });
  } catch {}
  await page.waitForTimeout(400);
}

test.describe("cycle1: admin desktop", () => {
  test.use({ viewport: DESKTOP });

  test("01-dashboard", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/dashboard");
    await settle(page);
    await shot(page, "01-dashboard-desktop");
  });

  test("02-articles", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/articles");
    await settle(page);
    await shot(page, "02-articles-list-desktop");
  });

  test("03-articles-new", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/articles/new");
    await settle(page);
    await shot(page, "03-articles-new-desktop");
  });

  test("04-articles-detail", async ({ page }) => {
    await openSidebar(page);
    // Try to grab a real slug from the list; if no link, fall back to a known one.
    await page.goto("/articles");
    await settle(page);
    const firstLink = await page
      .locator('a[href^="/articles/"]')
      .filter({ hasNot: page.locator('a[href="/articles/new"]') })
      .first()
      .getAttribute("href")
      .catch(() => null);
    const target = firstLink ?? "/articles/claude-code-ai-agent-team";
    await page.goto(target);
    await settle(page);
    await shot(page, "04-articles-detail-desktop");
  });

  test("05-threads-draft", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/threads");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await settle(page);
    await shot(page, "05-threads-draft-desktop");
  });

  test("06-threads-queued", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/threads");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await settle(page);
    await page.getByRole("button", { name: "予約中" }).click().catch(() => {});
    await settle(page);
    await shot(page, "06-threads-queued-desktop");
  });

  test("07-threads-posted", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/threads");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await settle(page);
    await page.getByRole("button", { name: "投稿済み" }).click().catch(() => {});
    await settle(page);
    await shot(page, "07-threads-posted-desktop");
  });

  test("08-threads-all", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/threads");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await settle(page);
    await page.getByRole("button", { name: "すべて" }).click().catch(() => {});
    await settle(page);
    await shot(page, "08-threads-all-desktop");
  });

  test("09-threads-new", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/threads/new");
    await settle(page);
    await shot(page, "09-threads-new-desktop");
  });

  test("10-threads-queue", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/threads/queue");
    await settle(page);
    await shot(page, "10-threads-queue-desktop");
  });

  test("11-x-pao", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/x");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await settle(page);
    await shot(page, "11-x-pao-pao-cho-desktop");
  });

  test("12-x-matsumoto", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/x");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await settle(page);
    await page
      .locator("select")
      .first()
      .selectOption("matsumoto_sho")
      .catch(() => {});
    await settle(page);
    await shot(page, "12-x-matsumoto-desktop");
  });

  test("13-x-new", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/x/new");
    await settle(page);
    await shot(page, "13-x-new-desktop");
  });

  test("14-x-new-overflow", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/x/new");
    await settle(page);
    const textarea = page.getByLabel("投稿本文");
    await textarea.fill("あ".repeat(290)).catch(() => {});
    await page.waitForTimeout(200);
    await shot(page, "14-x-new-overflow-desktop");
  });
});

test.describe("cycle1: admin mobile 375", () => {
  test.use({ viewport: MOBILE });

  test("15-mobile-dashboard", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/dashboard");
    await settle(page);
    await shot(page, "15-dashboard-mobile");
  });

  test("16-mobile-articles", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/articles");
    await settle(page);
    await shot(page, "16-articles-mobile");
  });

  test("17-mobile-articles-new", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/articles/new");
    await settle(page);
    await shot(page, "17-articles-new-mobile");
  });

  test("18-mobile-threads", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/threads");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await settle(page);
    await shot(page, "18-threads-mobile");
  });

  test("19-mobile-x", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/x");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await settle(page);
    await shot(page, "19-x-mobile");
  });

  test("20-mobile-x-new", async ({ page }) => {
    await openSidebar(page);
    await page.goto("/x/new");
    await settle(page);
    await shot(page, "20-x-new-mobile");
  });
});

test.describe("cycle1: public desktop", () => {
  test.use({ viewport: DESKTOP });

  test("21-public-home", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    await shot(page, "21-public-home");
  });

  test("22-public-about", async ({ page }) => {
    await page.goto("/about");
    await settle(page);
    await shot(page, "22-public-about");
  });

  test("23-public-profile", async ({ page }) => {
    await page.goto("/profile");
    await settle(page);
    await shot(page, "23-public-profile");
  });

  test("24-public-search", async ({ page }) => {
    await page.goto("/search");
    await settle(page);
    await shot(page, "24-public-search");
  });

  test("25-public-contact", async ({ page }) => {
    await page.goto("/contact");
    await settle(page);
    await shot(page, "25-public-contact");
  });

  test("26-public-privacy", async ({ page }) => {
    await page.goto("/privacy");
    await settle(page);
    await shot(page, "26-public-privacy");
  });

  test("27-public-terms", async ({ page }) => {
    await page.goto("/terms");
    await settle(page);
    await shot(page, "27-public-terms");
  });

  test("28-public-category-tech", async ({ page }) => {
    await page.goto("/tech");
    await settle(page);
    await shot(page, "28-public-category-tech");
  });
});
