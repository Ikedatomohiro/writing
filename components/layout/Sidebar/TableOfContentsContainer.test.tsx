import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { TableOfContentsContainer } from "./TableOfContentsContainer";

// Mock useActiveHeading
vi.mock("@/hooks/useActiveHeading", () => ({
  useActiveHeading: vi.fn(() => undefined),
}));

// Mock useScrollToHeading
const mockScrollToHeading = vi.fn();
vi.mock("@/hooks/useScrollToHeading", () => ({
  useScrollToHeading: vi.fn(() => mockScrollToHeading),
}));

// Mock extractHeadings
vi.mock("@/lib/toc/extractHeadings", () => ({
  extractHeadings: vi.fn(() => []),
}));

import { useActiveHeading } from "@/hooks/useActiveHeading";
import { extractHeadings } from "@/lib/toc/extractHeadings";

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("TableOfContentsContainer", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    container.id = "article-content";
    document.body.appendChild(container);
  });

  afterEach(() => {
    cleanup();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  describe("rendering", () => {
    it("renders TableOfContents component", () => {
      renderWithChakra(
        <TableOfContentsContainer contentSelector="#article-content" />
      );

      expect(screen.getByTestId("table-of-contents")).toBeInTheDocument();
    });

    it("renders title", () => {
      renderWithChakra(
        <TableOfContentsContainer contentSelector="#article-content" />
      );

      expect(screen.getByText("目次")).toBeInTheDocument();
    });

    it("renders extracted headings", () => {
      vi.mocked(extractHeadings).mockReturnValue([
        { id: "h1", title: "はじめに", level: 2 },
        { id: "h2", title: "まとめ", level: 2 },
      ]);

      renderWithChakra(
        <TableOfContentsContainer contentSelector="#article-content" />
      );

      expect(screen.getByText("はじめに")).toBeInTheDocument();
      expect(screen.getByText("まとめ")).toBeInTheDocument();
    });
  });

  describe("heading extraction", () => {
    it("calls extractHeadings with content element", () => {
      renderWithChakra(
        <TableOfContentsContainer contentSelector="#article-content" />
      );

      expect(extractHeadings).toHaveBeenCalledWith(container);
    });

    it("handles missing content element gracefully", () => {
      document.body.removeChild(container);

      renderWithChakra(
        <TableOfContentsContainer contentSelector="#nonexistent" />
      );

      expect(extractHeadings).toHaveBeenCalledWith(null);
    });
  });

  describe("active heading", () => {
    it("passes headingIds to useActiveHeading", () => {
      vi.mocked(extractHeadings).mockReturnValue([
        { id: "h1", title: "はじめに", level: 2 },
        { id: "h2", title: "まとめ", level: 2 },
      ]);

      renderWithChakra(
        <TableOfContentsContainer contentSelector="#article-content" />
      );

      expect(useActiveHeading).toHaveBeenCalledWith(
        expect.objectContaining({
          headingIds: ["h1", "h2"],
        })
      );
    });

    it("highlights active heading", () => {
      vi.mocked(extractHeadings).mockReturnValue([
        { id: "h1", title: "はじめに", level: 2 },
        { id: "h2", title: "まとめ", level: 2 },
      ]);
      vi.mocked(useActiveHeading).mockReturnValue("h1");

      renderWithChakra(
        <TableOfContentsContainer contentSelector="#article-content" />
      );

      const activeLink = screen.getByText("はじめに").closest("a");
      expect(activeLink).toHaveAttribute("data-active", "true");
    });
  });

  describe("click handling", () => {
    it("calls scrollToHeading when item is clicked", () => {
      vi.mocked(extractHeadings).mockReturnValue([
        { id: "h1", title: "はじめに", level: 2 },
      ]);

      renderWithChakra(
        <TableOfContentsContainer contentSelector="#article-content" />
      );

      const link = screen.getByText("はじめに");
      fireEvent.click(link);

      expect(mockScrollToHeading).toHaveBeenCalledWith("h1");
    });
  });

  describe("empty state", () => {
    it("renders empty TableOfContents when no headings", () => {
      vi.mocked(extractHeadings).mockReturnValue([]);

      renderWithChakra(
        <TableOfContentsContainer contentSelector="#article-content" />
      );

      expect(screen.getByTestId("table-of-contents")).toBeInTheDocument();
      expect(screen.queryAllByRole("link")).toHaveLength(0);
    });
  });
});
