import { describe, it, expect } from "vitest";
import {
  ACCOUNT_LABELS,
  POST_TYPE_LABELS,
  X_CATEGORY_LABELS,
  getAccountLabel,
  getPostTypeLabel,
  getXCategoryLabel,
} from "./labels";

describe("ACCOUNT_LABELS", () => {
  it("maps pao-pao-cho to Japanese label", () => {
    expect(ACCOUNT_LABELS["pao-pao-cho"]).toBe("パオパオ長 (Threads/X)");
  });

  it("maps matsumoto_sho to Japanese label", () => {
    expect(ACCOUNT_LABELS["matsumoto_sho"]).toBe("松本翔 (note/X)");
  });

  it("maps morita_rin to Japanese label", () => {
    expect(ACCOUNT_LABELS["morita_rin"]).toBe("森田凛");
  });
});

describe("POST_TYPE_LABELS", () => {
  it("maps normal to 通常", () => {
    expect(POST_TYPE_LABELS["normal"]).toBe("通常");
  });

  it("maps comment_hook to コメント誘導", () => {
    expect(POST_TYPE_LABELS["comment_hook"]).toBe("コメント誘導");
  });

  it("maps thread to スレッド続き", () => {
    expect(POST_TYPE_LABELS["thread"]).toBe("スレッド続き");
  });

  it("maps affiliate to アフィリエイト", () => {
    expect(POST_TYPE_LABELS["affiliate"]).toBe("アフィリエイト");
  });
});

describe("X_CATEGORY_LABELS", () => {
  it("maps note_article to noteへの誘導", () => {
    expect(X_CATEGORY_LABELS["note_article"]).toBe("noteへの誘導");
  });

  it("maps tech_tips to テックTips", () => {
    expect(X_CATEGORY_LABELS["tech_tips"]).toBe("テックTips");
  });

  it("maps career to キャリア", () => {
    expect(X_CATEGORY_LABELS["career"]).toBe("キャリア");
  });

  it("maps opinion to 意見・考察", () => {
    expect(X_CATEGORY_LABELS["opinion"]).toBe("意見・考察");
  });
});

describe("getAccountLabel", () => {
  it("returns Japanese label for known account", () => {
    expect(getAccountLabel("pao-pao-cho")).toBe("パオパオ長 (Threads/X)");
  });

  it("returns original slug for unknown account", () => {
    expect(getAccountLabel("unknown-account")).toBe("unknown-account");
  });
});

describe("getPostTypeLabel", () => {
  it("returns Japanese label for known type", () => {
    expect(getPostTypeLabel("normal")).toBe("通常");
  });
});

describe("getXCategoryLabel", () => {
  it("returns Japanese label for known category", () => {
    expect(getXCategoryLabel("career")).toBe("キャリア");
  });

  it("returns original value for unknown category", () => {
    expect(getXCategoryLabel("unknown" as never)).toBe("unknown");
  });
});
