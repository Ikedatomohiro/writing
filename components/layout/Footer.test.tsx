import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Footer } from "./Footer";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
  );
}

afterEach(() => {
  cleanup();
});

describe("Footer", () => {
  it("ロゴ名が表示される", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText("BlogName")).toBeInTheDocument();
  });

  it("サイト説明文が表示される", () => {
    renderWithProviders(<Footer />);
    expect(
      screen.getByText(
        "資産形成、プログラミング、健康に関する記事を発信しています。"
      )
    ).toBeInTheDocument();
  });

  it("カテゴリセクションが表示される", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Investment")).toBeInTheDocument();
    expect(screen.getByText("Programming")).toBeInTheDocument();
    expect(screen.getByText("Health")).toBeInTheDocument();
  });

  it("リンクセクションが表示される", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("コピーライトが表示される", () => {
    renderWithProviders(<Footer />);
    expect(
      screen.getByText(/© \d{4} BlogName\. All rights reserved\./)
    ).toBeInTheDocument();
  });

  it("カテゴリリンクが正しいhrefを持つ", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole("link", { name: "Investment" })).toHaveAttribute(
      "href",
      "/asset"
    );
    expect(screen.getByRole("link", { name: "Programming" })).toHaveAttribute(
      "href",
      "/tech"
    );
    expect(screen.getByRole("link", { name: "Health" })).toHaveAttribute(
      "href",
      "/health"
    );
  });

  it("footer要素としてレンダリングされる", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
