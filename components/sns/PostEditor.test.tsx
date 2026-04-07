import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostEditor } from "./PostEditor";

describe("PostEditor", () => {
  afterEach(() => {
    cleanup();
  });

  it("textareaを表示する", () => {
    render(<PostEditor value="" onChange={vi.fn()} onTypeChange={vi.fn()} type="normal" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("文字数カウンターを表示する", () => {
    render(<PostEditor value="hello" onChange={vi.fn()} onTypeChange={vi.fn()} type="normal" />);
    expect(screen.getByTestId("char-count")).toHaveTextContent("5/500");
  });

  it("500文字未満では通常スタイルを表示する", () => {
    const text = "a".repeat(499);
    render(<PostEditor value={text} onChange={vi.fn()} onTypeChange={vi.fn()} type="normal" />);
    const counter = screen.getByTestId("char-count");
    expect(counter.className).not.toMatch(/red/);
  });

  it("500文字を超えたら文字数カウンターを赤くする", () => {
    const text = "a".repeat(501);
    render(<PostEditor value={text} onChange={vi.fn()} onTypeChange={vi.fn()} type="normal" />);
    const counter = screen.getByTestId("char-count");
    expect(counter.className).toMatch(/red/);
  });

  it("500文字ちょうどでは赤くならない", () => {
    const text = "a".repeat(500);
    render(<PostEditor value={text} onChange={vi.fn()} onTypeChange={vi.fn()} type="normal" />);
    const counter = screen.getByTestId("char-count");
    expect(counter.className).not.toMatch(/red/);
  });

  it("テキスト入力時にonChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PostEditor value="" onChange={onChange} onTypeChange={vi.fn()} type="normal" />);
    await user.type(screen.getByRole("textbox"), "test");
    expect(onChange).toHaveBeenCalled();
  });

  it("typeセレクタを表示する", () => {
    render(<PostEditor value="" onChange={vi.fn()} onTypeChange={vi.fn()} type="normal" />);
    expect(screen.getByTestId("type-select")).toBeInTheDocument();
  });

  it("typeセレクタにnormal/comment_hook/thread/affiliateの選択肢がある", () => {
    render(<PostEditor value="" onChange={vi.fn()} onTypeChange={vi.fn()} type="normal" />);
    const select = screen.getByTestId("type-select") as HTMLSelectElement;
    const optionValues = Array.from(select.options).map((o) => o.value);
    expect(optionValues).toContain("normal");
    expect(optionValues).toContain("comment_hook");
    expect(optionValues).toContain("thread");
    expect(optionValues).toContain("affiliate");
  });

  it("disabled=trueのとき入力を無効にする", () => {
    render(<PostEditor value="" onChange={vi.fn()} onTypeChange={vi.fn()} type="normal" disabled={true} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByTestId("type-select")).toBeDisabled();
  });
});
