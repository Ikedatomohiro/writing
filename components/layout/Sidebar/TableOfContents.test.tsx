import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TableOfContents, type TocItem } from "./TableOfContents";

afterEach(() => {
  cleanup();
});

const mockItems: TocItem[] = [
  { id: "section-1", title: "はじめに", level: 1 },
  { id: "section-2", title: "分散投資の重要性", level: 2 },
  { id: "section-3", title: "長期投資のメリット", level: 2 },
];

describe("TableOfContents", () => {
  describe("rendering", () => {
    it("renders the title", () => {
      render(<TableOfContents items={mockItems} />);
      expect(screen.getByText("目次")).toBeInTheDocument();
    });

    it("renders all items", () => {
      render(<TableOfContents items={mockItems} />);
      expect(screen.getByText("はじめに")).toBeInTheDocument();
      expect(screen.getByText("分散投資の重要性")).toBeInTheDocument();
      expect(screen.getByText("長期投資のメリット")).toBeInTheDocument();
    });

    it("renders items as links", () => {
      render(<TableOfContents items={mockItems} />);
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);
      expect(links[0]).toHaveAttribute("href", "#section-1");
      expect(links[1]).toHaveAttribute("href", "#section-2");
    });

    it("applies correct data-testid", () => {
      render(<TableOfContents items={mockItems} />);
      expect(screen.getByTestId("table-of-contents")).toBeInTheDocument();
    });

    it("renders empty state when no items", () => {
      render(<TableOfContents items={[]} />);
      expect(screen.getByTestId("table-of-contents")).toBeInTheDocument();
      expect(screen.queryAllByRole("link")).toHaveLength(0);
    });
  });

  describe("active item", () => {
    it("highlights the active item", () => {
      render(
        <TableOfContents items={mockItems} activeId="section-2" />
      );
      const activeLink = screen.getByText("分散投資の重要性").closest("a");
      expect(activeLink).toHaveAttribute("data-active", "true");
    });

    it("does not highlight non-active items", () => {
      render(
        <TableOfContents items={mockItems} activeId="section-2" />
      );
      const inactiveLink = screen.getByText("はじめに").closest("a");
      expect(inactiveLink).toHaveAttribute("data-active", "false");
    });
  });

  describe("indentation", () => {
    it("applies indentation based on heading level", () => {
      render(<TableOfContents items={mockItems} />);
      const level1Link = screen.getByText("はじめに").closest("a");
      const level2Link = screen.getByText("分散投資の重要性").closest("a");
      expect(level1Link).toHaveAttribute("data-level", "1");
      expect(level2Link).toHaveAttribute("data-level", "2");
    });
  });

  describe("interactions", () => {
    it("calls onItemClick when item is clicked", () => {
      const handleClick = vi.fn();
      render(
        <TableOfContents items={mockItems} onItemClick={handleClick} />
      );
      const link = screen.getByText("はじめに");
      fireEvent.click(link);
      expect(handleClick).toHaveBeenCalledWith("section-1");
    });
  });

  describe("accessibility", () => {
    it("has navigation role", () => {
      render(<TableOfContents items={mockItems} />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("has correct aria-label", () => {
      render(<TableOfContents items={mockItems} />);
      expect(screen.getByLabelText("目次")).toBeInTheDocument();
    });
  });
});
