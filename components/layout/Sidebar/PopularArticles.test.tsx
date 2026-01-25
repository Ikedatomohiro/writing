import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { PopularArticles, type PopularArticle } from "./PopularArticles";

afterEach(() => {
  cleanup();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

const mockArticles: PopularArticle[] = [
  {
    id: "article-1",
    title: "投資初心者が知っておくべき5つの基本原則",
    href: "/asset/article-1",
  },
  {
    id: "article-2",
    title: "インデックス投資の始め方完全ガイド",
    href: "/asset/article-2",
  },
  {
    id: "article-3",
    title: "NISAとiDeCoの違いを徹底比較",
    href: "/asset/article-3",
  },
];

describe("PopularArticles", () => {
  describe("rendering", () => {
    it("renders the title", () => {
      renderWithChakra(<PopularArticles articles={mockArticles} />);
      expect(screen.getByText("人気記事")).toBeInTheDocument();
    });

    it("renders all articles", () => {
      renderWithChakra(<PopularArticles articles={mockArticles} />);
      expect(
        screen.getByText("投資初心者が知っておくべき5つの基本原則")
      ).toBeInTheDocument();
      expect(
        screen.getByText("インデックス投資の始め方完全ガイド")
      ).toBeInTheDocument();
      expect(
        screen.getByText("NISAとiDeCoの違いを徹底比較")
      ).toBeInTheDocument();
    });

    it("renders articles as links", () => {
      renderWithChakra(<PopularArticles articles={mockArticles} />);
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);
      expect(links[0]).toHaveAttribute("href", "/asset/article-1");
    });

    it("renders rank numbers", () => {
      renderWithChakra(<PopularArticles articles={mockArticles} />);
      expect(screen.getByText("1.")).toBeInTheDocument();
      expect(screen.getByText("2.")).toBeInTheDocument();
      expect(screen.getByText("3.")).toBeInTheDocument();
    });

    it("applies correct data-testid", () => {
      renderWithChakra(<PopularArticles articles={mockArticles} />);
      expect(screen.getByTestId("popular-articles")).toBeInTheDocument();
    });

    it("renders custom title", () => {
      renderWithChakra(
        <PopularArticles articles={mockArticles} title="おすすめ記事" />
      );
      expect(screen.getByText("おすすめ記事")).toBeInTheDocument();
    });

    it("renders empty state when no articles", () => {
      renderWithChakra(<PopularArticles articles={[]} />);
      expect(screen.getByTestId("popular-articles")).toBeInTheDocument();
      expect(screen.queryAllByRole("link")).toHaveLength(0);
    });
  });

  describe("limit", () => {
    it("limits the number of displayed articles", () => {
      const manyArticles: PopularArticle[] = [
        ...mockArticles,
        { id: "4", title: "Article 4", href: "/4" },
        { id: "5", title: "Article 5", href: "/5" },
        { id: "6", title: "Article 6", href: "/6" },
      ];
      renderWithChakra(<PopularArticles articles={manyArticles} limit={3} />);
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);
    });

    it("displays all articles when limit exceeds count", () => {
      renderWithChakra(<PopularArticles articles={mockArticles} limit={10} />);
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);
    });
  });

  describe("accessibility", () => {
    it("has section role", () => {
      renderWithChakra(<PopularArticles articles={mockArticles} />);
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("has correct aria-label", () => {
      renderWithChakra(<PopularArticles articles={mockArticles} />);
      expect(screen.getByLabelText("人気記事")).toBeInTheDocument();
    });
  });
});
