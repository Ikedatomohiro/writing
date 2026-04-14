import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { name: "dashboard", path: "/dashboard" },
  { name: "threads", path: "/threads" },
  { name: "x", path: "/x" },
  { name: "articles", path: "/articles" },
  { name: "x-new", path: "/x/new" },
];

for (const { name, path } of PAGES) {
  test(`a11y: ${name} (${path})`, async ({ page }) => {
    await page.goto(path);
    try {
      await page.waitForLoadState("networkidle", { timeout: 8000 });
    } catch {
      // proceed even if networkidle times out
    }
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    // Separate by impact
    const critical = results.violations.filter((v) => v.impact === "critical");
    const serious = results.violations.filter((v) => v.impact === "serious");
    const moderate = results.violations.filter((v) => v.impact === "moderate");
    const minor = results.violations.filter((v) => v.impact === "minor");

    if (results.violations.length > 0) {
      console.log(`\n[${name}] axe violations summary:`);
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} node(s))`);
      }
    }

    // Only assert that critical violations are zero
    // Serious/moderate/minor are reported but not blocking (carryover to cycle 4)
    expect(
      critical,
      `Critical a11y violations on ${path}:\n${critical.map((v) => `  ${v.id}: ${v.description}`).join("\n")}`
    ).toHaveLength(0);

    expect(
      serious,
      `Serious a11y violations on ${path}:\n${serious.map((v) => `  ${v.id}: ${v.description}`).join("\n")}`
    ).toHaveLength(0);

    // Log moderate/minor as informational
    if (moderate.length > 0) {
      console.log(`[${name}] moderate violations (carryover): ${moderate.map((v) => v.id).join(", ")}`);
    }
    if (minor.length > 0) {
      console.log(`[${name}] minor violations (carryover): ${minor.map((v) => v.id).join(", ")}`);
    }
  });
}
