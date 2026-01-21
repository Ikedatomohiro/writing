import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getAllowedEmails, isEmailAllowed } from "./whitelist";

describe("whitelist", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getAllowedEmails", () => {
    it("空の環境変数の場合は空配列を返す", () => {
      process.env.ALLOWED_EMAILS = "";
      expect(getAllowedEmails()).toEqual([]);
    });

    it("環境変数が未設定の場合は空配列を返す", () => {
      delete process.env.ALLOWED_EMAILS;
      expect(getAllowedEmails()).toEqual([]);
    });

    it("単一のメールアドレスを配列として返す", () => {
      process.env.ALLOWED_EMAILS = "user@example.com";
      expect(getAllowedEmails()).toEqual(["user@example.com"]);
    });

    it("カンマ区切りの複数メールアドレスを配列として返す", () => {
      process.env.ALLOWED_EMAILS = "user1@example.com,user2@example.com";
      expect(getAllowedEmails()).toEqual([
        "user1@example.com",
        "user2@example.com",
      ]);
    });

    it("前後の空白を除去して返す", () => {
      process.env.ALLOWED_EMAILS = "  user1@example.com , user2@example.com  ";
      expect(getAllowedEmails()).toEqual([
        "user1@example.com",
        "user2@example.com",
      ]);
    });

    it("小文字に正規化して返す", () => {
      process.env.ALLOWED_EMAILS = "User@Example.COM";
      expect(getAllowedEmails()).toEqual(["user@example.com"]);
    });

    it("空のエントリは除外する", () => {
      process.env.ALLOWED_EMAILS = "user1@example.com,,user2@example.com,";
      expect(getAllowedEmails()).toEqual([
        "user1@example.com",
        "user2@example.com",
      ]);
    });
  });

  describe("isEmailAllowed", () => {
    beforeEach(() => {
      process.env.ALLOWED_EMAILS = "allowed@example.com,admin@example.com";
    });

    it("ホワイトリスト内のメールアドレスはtrueを返す", () => {
      expect(isEmailAllowed("allowed@example.com")).toBe(true);
    });

    it("ホワイトリスト外のメールアドレスはfalseを返す", () => {
      expect(isEmailAllowed("notallowed@example.com")).toBe(false);
    });

    it("大文字小文字を区別せずに検証する", () => {
      expect(isEmailAllowed("ALLOWED@EXAMPLE.COM")).toBe(true);
      expect(isEmailAllowed("Allowed@Example.com")).toBe(true);
    });

    it("nullの場合はfalseを返す", () => {
      expect(isEmailAllowed(null)).toBe(false);
    });

    it("undefinedの場合はfalseを返す", () => {
      expect(isEmailAllowed(undefined)).toBe(false);
    });

    it("空文字の場合はfalseを返す", () => {
      expect(isEmailAllowed("")).toBe(false);
    });

    it("ホワイトリストが空の場合はfalseを返す", () => {
      process.env.ALLOWED_EMAILS = "";
      expect(isEmailAllowed("any@example.com")).toBe(false);
    });
  });
});
