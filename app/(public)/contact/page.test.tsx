import { screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { renderWithChakra } from "@/app/test-utils";
import ContactPage from "./page";
import { ContactForm } from "./ContactForm";

describe("ContactPage", () => {
  beforeEach(() => {
    // Clean up DOM between tests
    document.body.innerHTML = "";
  });

  it("renders the page title", () => {
    renderWithChakra(<ContactPage />);
    expect(screen.getByRole("heading", { name: /お問い合わせ/i })).toBeInTheDocument();
  });

  it("renders the description text", () => {
    renderWithChakra(<ContactPage />);
    expect(screen.getByText(/ご質問やご要望がございましたら/i)).toBeInTheDocument();
  });
});

describe("ContactForm", () => {
  const mockFormUrl = "https://docs.google.com/forms/d/e/test-form-id/viewform?embedded=true";

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the Google Form iframe when formUrl is provided", () => {
    renderWithChakra(<ContactForm formUrl={mockFormUrl} />);
    const iframe = screen.getByTitle("お問い合わせフォーム");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", mockFormUrl);
  });

  it("iframe has responsive width style", () => {
    renderWithChakra(<ContactForm formUrl={mockFormUrl} />);
    const iframe = screen.getByTitle("お問い合わせフォーム");
    expect(iframe).toHaveStyle({ width: "100%" });
  });

  it("renders loading state when formUrl is empty", () => {
    renderWithChakra(<ContactForm formUrl="" />);
    expect(screen.getByText(/フォームを読み込んでいます/i)).toBeInTheDocument();
  });
});
