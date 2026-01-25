import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ArticleBody } from "./ArticleBody";

afterEach(() => {
  cleanup();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("ArticleBody", () => {
  it("renders children content", () => {
    renderWithChakra(
      <ArticleBody>
        <p>Test paragraph</p>
      </ArticleBody>
    );

    expect(screen.getByText("Test paragraph")).toBeInTheDocument();
  });

  it("applies article-body class for styling", () => {
    renderWithChakra(
      <ArticleBody>
        <p>Content</p>
      </ArticleBody>
    );

    const container = screen.getByTestId("article-body");
    expect(container).toHaveClass("article-body");
  });

  it("renders headings correctly", () => {
    renderWithChakra(
      <ArticleBody>
        <h2>Section Title</h2>
        <h3>Subsection Title</h3>
      </ArticleBody>
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Section Title"
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Subsection Title"
    );
  });

  it("renders lists correctly", () => {
    renderWithChakra(
      <ArticleBody>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </ArticleBody>
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders blockquote correctly", () => {
    renderWithChakra(
      <ArticleBody>
        <blockquote>This is a quote</blockquote>
      </ArticleBody>
    );

    expect(screen.getByText("This is a quote")).toBeInTheDocument();
  });

  it("renders table correctly", () => {
    renderWithChakra(
      <ArticleBody>
        <table>
          <thead>
            <tr>
              <th>Header</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>
      </ArticleBody>
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Cell")).toBeInTheDocument();
  });

  it("renders inline code correctly", () => {
    renderWithChakra(
      <ArticleBody>
        <p>
          Use <code>npm install</code> to install
        </p>
      </ArticleBody>
    );

    expect(screen.getByText("npm install")).toBeInTheDocument();
  });

  it("renders links correctly", () => {
    renderWithChakra(
      <ArticleBody>
        <p>
          Visit <a href="https://example.com">Example</a>
        </p>
      </ArticleBody>
    );

    const link = screen.getByRole("link", { name: "Example" });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("applies custom className when provided", () => {
    renderWithChakra(
      <ArticleBody className="custom-class">
        <p>Content</p>
      </ArticleBody>
    );

    const container = screen.getByTestId("article-body");
    expect(container).toHaveClass("custom-class");
  });
});
