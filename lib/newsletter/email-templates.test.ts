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

  it("メールアドレスにHTMLタグが含まれる場合、エスケープされる", () => {
    const maliciousEmail = '<script>alert("xss")</script>@example.com';
    const result = getConfirmationEmail(maliciousEmail, siteUrl);
    expect(result.body).not.toContain('<script>');
    expect(result.body).toContain('&lt;script&gt;');
  });

  it("URLにHTMLタグが含まれる場合、エスケープされる", () => {
    const maliciousUrl = 'https://example.com"><script>alert("xss")</script>';
    const result = getConfirmationEmail(email, maliciousUrl);
    expect(result.body).not.toContain('<script>');
    expect(result.body).toContain('&lt;script&gt;');
  });

  it("特殊文字（&、<、>、\")がエスケープされる", () => {
    const result = getConfirmationEmail("test&<>\"@example.com", siteUrl);
    expect(result.body).toContain("&amp;");
    expect(result.body).toContain("&lt;");
    expect(result.body).toContain("&gt;");
    expect(result.body).toContain("&quot;");
  });
});
