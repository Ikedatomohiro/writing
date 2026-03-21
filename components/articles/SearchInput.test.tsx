import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, expect, it, afterEach, vi } from "vitest";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  afterEach(() => {
    cleanup();
  });

  it("入力フィールドを表示する", () => {
    render(<SearchInput value="" onChange={() => {}} />);

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("プレースホルダーを表示する", () => {
    render(
      <SearchInput
        value=""
        onChange={() => {}}
        placeholder="記事を検索..."
      />
    );

    expect(screen.getByPlaceholderText("記事を検索...")).toBeInTheDocument();
  });

  it("デフォルトのプレースホルダーを表示する", () => {
    render(<SearchInput value="" onChange={() => {}} />);

    expect(screen.getByPlaceholderText("検索...")).toBeInTheDocument();
  });

  it("値を反映する", () => {
    render(<SearchInput value="TypeScript" onChange={() => {}} />);

    expect(screen.getByDisplayValue("TypeScript")).toBeInTheDocument();
  });

  it("入力時にonChangeを発火する", () => {
    const handleChange = vi.fn();
    render(<SearchInput value="" onChange={handleChange} />);

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "React" } });

    expect(handleChange).toHaveBeenCalledWith("React");
  });

  it("aria-labelを持つ", () => {
    render(<SearchInput value="" onChange={() => {}} />);

    expect(screen.getByLabelText("検索")).toBeInTheDocument();
  });
});
