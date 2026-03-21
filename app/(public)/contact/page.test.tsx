import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import ContactPage from "./page";
import { ContactForm } from "./ContactForm";

describe("ContactPage", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the page title", () => {
    render(<ContactPage />);
    expect(screen.getByRole("heading", { name: /Get in Touch/i })).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<ContactPage />);
    expect(screen.getByText(/We value your inquiries/i)).toBeInTheDocument();
  });
});

describe("ContactForm", () => {
  const mockFormUrl = "https://docs.google.com/forms/d/e/test-form-id/viewform?embedded=true";

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the Google Form iframe when formUrl is provided", () => {
    render(<ContactForm formUrl={mockFormUrl} />);
    const iframe = screen.getByTitle("Contact Form");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", mockFormUrl);
  });

  it("iframe has full width style", () => {
    render(<ContactForm formUrl={mockFormUrl} />);
    const iframe = screen.getByTitle("Contact Form");
    expect(iframe).toHaveClass("w-full");
  });

  it("renders fallback form fields when formUrl is empty", () => {
    render(<ContactForm formUrl="" />);
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Send Message")).toBeInTheDocument();
  });
});
