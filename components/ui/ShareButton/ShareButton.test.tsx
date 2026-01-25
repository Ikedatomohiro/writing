import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import {
  ShareButton,
  ShareButtonGroup,
  type SharePlatform,
} from "./ShareButton";

afterEach(() => {
  cleanup();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("ShareButton", () => {
  describe("rendering", () => {
    it("renders as a button element", () => {
      renderWithChakra(
        <ShareButton platform="twitter" url="https://example.com" title="Test" />
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("has accessible name based on platform", () => {
      renderWithChakra(
        <ShareButton platform="twitter" url="https://example.com" title="Test" />
      );
      expect(screen.getByRole("button", { name: /xでシェア/i })).toBeInTheDocument();
    });
  });

  describe("platforms", () => {
    const platformTests: { platform: SharePlatform; expectedLabel: RegExp }[] = [
      { platform: "twitter", expectedLabel: /xでシェア/i },
      { platform: "facebook", expectedLabel: /facebookでシェア/i },
      { platform: "hatena", expectedLabel: /はてなブックマーク/i },
      { platform: "line", expectedLabel: /lineでシェア/i },
      { platform: "copy", expectedLabel: /リンクをコピー/i },
    ];

    it.each(platformTests)(
      "renders $platform button with correct label",
      ({ platform, expectedLabel }) => {
        renderWithChakra(
          <ShareButton platform={platform} url="https://example.com" title="Test" />
        );
        expect(screen.getByRole("button", { name: expectedLabel })).toBeInTheDocument();
      }
    );
  });

  describe("share URLs", () => {
    const originalOpen = window.open;

    beforeEach(() => {
      window.open = vi.fn();
    });

    afterEach(() => {
      window.open = originalOpen;
    });

    it("opens Twitter share URL on click", () => {
      renderWithChakra(
        <ShareButton platform="twitter" url="https://example.com" title="Test Title" />
      );
      fireEvent.click(screen.getByRole("button"));
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining("twitter.com/intent/tweet"),
        "_blank",
        expect.any(String)
      );
    });

    it("opens Facebook share URL on click", () => {
      renderWithChakra(
        <ShareButton platform="facebook" url="https://example.com" title="Test" />
      );
      fireEvent.click(screen.getByRole("button"));
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining("facebook.com/sharer"),
        "_blank",
        expect.any(String)
      );
    });

    it("opens Hatena bookmark URL on click", () => {
      renderWithChakra(
        <ShareButton platform="hatena" url="https://example.com" title="Test" />
      );
      fireEvent.click(screen.getByRole("button"));
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining("b.hatena.ne.jp"),
        "_blank",
        expect.any(String)
      );
    });

    it("opens LINE share URL on click", () => {
      renderWithChakra(
        <ShareButton platform="line" url="https://example.com" title="Test" />
      );
      fireEvent.click(screen.getByRole("button"));
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining("line.me"),
        "_blank",
        expect.any(String)
      );
    });
  });

  describe("copy link", () => {
    it("copies URL to clipboard on click", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      renderWithChakra(
        <ShareButton platform="copy" url="https://example.com" title="Test" />
      );
      fireEvent.click(screen.getByRole("button"));
      expect(writeTextMock).toHaveBeenCalledWith("https://example.com");
    });
  });
});

describe("ShareButtonGroup", () => {
  it("renders all share buttons by default", () => {
    renderWithChakra(
      <ShareButtonGroup url="https://example.com" title="Test" />
    );
    expect(screen.getByRole("button", { name: /xでシェア/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /facebookでシェア/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /はてなブックマーク/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lineでシェア/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /リンクをコピー/i })).toBeInTheDocument();
  });

  it("renders only specified platforms", () => {
    renderWithChakra(
      <ShareButtonGroup
        url="https://example.com"
        title="Test"
        platforms={["twitter", "facebook"]}
      />
    );
    expect(screen.getByRole("button", { name: /xでシェア/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /facebookでシェア/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /はてなブックマーク/i })).not.toBeInTheDocument();
  });

  it("shows label when showLabel is true", () => {
    renderWithChakra(
      <ShareButtonGroup url="https://example.com" title="Test" showLabel />
    );
    expect(screen.getByText("Share:")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    renderWithChakra(
      <ShareButtonGroup url="https://example.com" title="Test" />
    );
    expect(screen.getByLabelText("シェアボタン")).toBeInTheDocument();
  });
});
