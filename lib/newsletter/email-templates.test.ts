import { describe, it, expect } from "vitest";
import { getConfirmationEmail } from "./email-templates";

describe("getConfirmationEmail", () => {
  const email = "test@example.com";
  const siteUrl = "https://example.com";

  it("件名が含まれる", () => {
    const result = getConfirmationEmail(email, siteUrl);
    expect(result.subject).toBeTruthy();
    expect(typeof result.subject).toBe("string");
  });

  it("本文にメールアドレスが含まれる", () => {
    const result = getConfirmationEmail(email, siteUrl);
    expect(result.body).toContain(email);
  });

  it("本文にサイトURLが含まれる", () => {
    const result = getConfirmationEmail(email, siteUrl);
    expect(result.body).toContain(siteUrl);
  });

  it("本文にHTMLリンクが含まれる", () => {
    const result = getConfirmationEmail(email, siteUrl);
    expect(result.body).toMatch(/<a\s+href="/);
  });
});
