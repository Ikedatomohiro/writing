import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, expect, it, afterEach, vi } from "vitest";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { SearchInput } from "./SearchInput";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
  );
}

describe("SearchInput", () => {
  afterEach(() => {
    cleanup();
  });

  it("入力フィールドを表示する", () => {
    renderWithProviders(<SearchInput value="" onChange={() => {}} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("プレースホルダーを表示する", () => {
    renderWithProviders(
      <SearchInput
        value=""
        onChange={() => {}}
        placeholder="記事を検索..."
      />
    );

    expect(screen.getByPlaceholderText("記事を検索...")).toBeInTheDocument();
  });

  it("デフォルトのプレースホルダーを表示する", () => {
    renderWithProviders(<SearchInput value="" onChange={() => {}} />);

    expect(screen.getByPlaceholderText("検索...")).toBeInTheDocument();
  });

  it("値を反映する", () => {
    renderWithProviders(<SearchInput value="TypeScript" onChange={() => {}} />);

    expect(screen.getByDisplayValue("TypeScript")).toBeInTheDocument();
  });

  it("入力時にonChangeを発火する", () => {
    const handleChange = vi.fn();
    renderWithProviders(<SearchInput value="" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "React" } });

    expect(handleChange).toHaveBeenCalledWith("React");
  });

  it("aria-labelを持つ", () => {
    renderWithProviders(<SearchInput value="" onChange={() => {}} />);

    expect(screen.getByLabelText("検索")).toBeInTheDocument();
  });
});
