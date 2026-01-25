import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Pagination } from "./Pagination";

afterEach(() => {
  cleanup();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("Pagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: vi.fn(),
  };

  describe("基本レンダリング", () => {
    it("コンポーネントがレンダリングされる", () => {
      renderWithChakra(<Pagination {...defaultProps} />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("現在ページがハイライトされる", () => {
      renderWithChakra(<Pagination {...defaultProps} currentPage={3} />);
      const currentPageButton = screen.getByRole("button", { name: /^3$/ });
      expect(currentPageButton).toHaveAttribute("aria-current", "page");
    });
  });

  describe("ナビゲーション", () => {
    it("ページ番号クリックでonPageChangeが呼ばれる", () => {
      const onPageChange = vi.fn();
      renderWithChakra(<Pagination {...defaultProps} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByRole("button", { name: /^2$/ }));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it("次へボタンでcurrentPage + 1が呼ばれる", () => {
      const onPageChange = vi.fn();
      renderWithChakra(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByRole("button", { name: /次のページ/i }));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it("前へボタンでcurrentPage - 1が呼ばれる", () => {
      const onPageChange = vi.fn();
      renderWithChakra(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByRole("button", { name: /前のページ/i }));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe("境界値処理", () => {
    it("最初のページで前へボタンが非活性", () => {
      renderWithChakra(<Pagination {...defaultProps} currentPage={1} />);
      const prevButton = screen.getByRole("button", { name: /前のページ/i });
      expect(prevButton).toBeDisabled();
    });

    it("最後のページで次へボタンが非活性", () => {
      renderWithChakra(<Pagination {...defaultProps} currentPage={10} totalPages={10} />);
      const nextButton = screen.getByRole("button", { name: /次のページ/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe("省略表示", () => {
    it("totalPages <= maxVisiblePagesで全ページ表示", () => {
      renderWithChakra(<Pagination {...defaultProps} totalPages={5} maxVisiblePages={5} />);

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByRole("button", { name: new RegExp(`^${i}$`) })).toBeInTheDocument();
      }
      expect(screen.queryByText("...")).not.toBeInTheDocument();
    });

    it("中間ページで前後に省略表示", () => {
      renderWithChakra(<Pagination {...defaultProps} currentPage={6} totalPages={20} maxVisiblePages={5} />);

      // 最初と最後のページは常に表示
      expect(screen.getByRole("button", { name: /^1$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^20$/ })).toBeInTheDocument();

      // 現在ページの前後
      expect(screen.getByRole("button", { name: /^5$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^6$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^7$/ })).toBeInTheDocument();

      // 省略記号
      const ellipses = screen.getAllByText("...");
      expect(ellipses).toHaveLength(2);
    });

    it("最初のページ付近で後方のみ省略", () => {
      renderWithChakra(<Pagination {...defaultProps} currentPage={2} totalPages={20} maxVisiblePages={5} />);

      expect(screen.getByRole("button", { name: /^1$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^2$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^3$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^20$/ })).toBeInTheDocument();

      // 省略記号は1つのみ
      const ellipses = screen.getAllByText("...");
      expect(ellipses).toHaveLength(1);
    });

    it("最後のページ付近で前方のみ省略", () => {
      renderWithChakra(<Pagination {...defaultProps} currentPage={19} totalPages={20} maxVisiblePages={5} />);

      expect(screen.getByRole("button", { name: /^1$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^18$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^19$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^20$/ })).toBeInTheDocument();

      // 省略記号は1つのみ
      const ellipses = screen.getAllByText("...");
      expect(ellipses).toHaveLength(1);
    });
  });

  describe("アクセシビリティ", () => {
    it("nav要素に適切なaria-labelがある", () => {
      renderWithChakra(<Pagination {...defaultProps} />);
      expect(screen.getByRole("navigation")).toHaveAttribute(
        "aria-label",
        "ページネーション"
      );
    });

    it("現在ページにaria-current='page'がある", () => {
      renderWithChakra(<Pagination {...defaultProps} currentPage={5} />);
      const currentPageButton = screen.getByRole("button", { name: /^5$/ });
      expect(currentPageButton).toHaveAttribute("aria-current", "page");
    });
  });
});
