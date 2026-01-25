import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { extractHeadings } from "./extractHeadings";

describe("extractHeadings", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("basic extraction", () => {
    it("extracts H2 headings", () => {
      container.innerHTML = `
        <h2 id="intro">はじめに</h2>
        <p>本文</p>
        <h2 id="conclusion">まとめ</h2>
      `;

      const result = extractHeadings(container);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: "intro", title: "はじめに", level: 2 });
      expect(result[1]).toEqual({ id: "conclusion", title: "まとめ", level: 2 });
    });

    it("extracts H3 headings", () => {
      container.innerHTML = `
        <h2 id="section1">セクション1</h2>
        <h3 id="subsection1">サブセクション1</h3>
        <h3 id="subsection2">サブセクション2</h3>
      `;

      const result = extractHeadings(container);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ id: "section1", title: "セクション1", level: 2 });
      expect(result[1]).toEqual({ id: "subsection1", title: "サブセクション1", level: 3 });
      expect(result[2]).toEqual({ id: "subsection2", title: "サブセクション2", level: 3 });
    });

    it("ignores H1, H4, H5, H6 headings", () => {
      container.innerHTML = `
        <h1 id="title">タイトル</h1>
        <h2 id="intro">はじめに</h2>
        <h4 id="detail">詳細</h4>
        <h5 id="note">注意</h5>
        <h6 id="footer">フッター</h6>
      `;

      const result = extractHeadings(container);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: "intro", title: "はじめに", level: 2 });
    });
  });

  describe("empty cases", () => {
    it("returns empty array when container is null", () => {
      const result = extractHeadings(null);
      expect(result).toEqual([]);
    });

    it("returns empty array when no headings exist", () => {
      container.innerHTML = `<p>本文のみ</p>`;

      const result = extractHeadings(container);

      expect(result).toEqual([]);
    });

    it("returns empty array when container is empty", () => {
      const result = extractHeadings(container);
      expect(result).toEqual([]);
    });
  });

  describe("headings without id", () => {
    it("generates id from heading text", () => {
      container.innerHTML = `
        <h2>はじめに</h2>
        <h2>まとめ</h2>
      `;

      const result = extractHeadings(container);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("heading-0");
      expect(result[0].title).toBe("はじめに");
      expect(result[1].id).toBe("heading-1");
    });

    it("assigns generated id to DOM element", () => {
      container.innerHTML = `<h2>テスト見出し</h2>`;

      extractHeadings(container);

      const heading = container.querySelector("h2");
      expect(heading?.id).toBe("heading-0");
    });
  });

  describe("mixed scenarios", () => {
    it("preserves document order", () => {
      container.innerHTML = `
        <h2 id="a">A</h2>
        <h3 id="b">B</h3>
        <h2 id="c">C</h2>
        <h3 id="d">D</h3>
        <h3 id="e">E</h3>
      `;

      const result = extractHeadings(container);

      expect(result.map(h => h.id)).toEqual(["a", "b", "c", "d", "e"]);
    });

    it("handles nested content in headings", () => {
      container.innerHTML = `
        <h2 id="test"><strong>太字</strong>見出し</h2>
      `;

      const result = extractHeadings(container);

      expect(result[0].title).toBe("太字見出し");
    });
  });
});
