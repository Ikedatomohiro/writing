import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ContactInfo } from "./ContactInfo";

describe("ContactInfo", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders office address", () => {
    render(<ContactInfo />);
    expect(
      screen.getByText(/888 Editorial Way/)
    ).toBeInTheDocument();
  });

  it("renders email contacts", () => {
    render(<ContactInfo />);
    expect(screen.getByText(/hello@theeditorial/)).toBeInTheDocument();
    expect(screen.getByText(/press@theeditorial/)).toBeInTheDocument();
  });

  it("renders section titles", () => {
    render(<ContactInfo />);
    expect(screen.getAllByText("Office Address").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Email Contact").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Follow Us").length).toBeGreaterThanOrEqual(1);
  });

  it("renders social links", () => {
    render(<ContactInfo />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(3);
  });

  it("renders map placeholder", () => {
    render(<ContactInfo />);
    expect(screen.getAllByText("VIEW ON GOOGLE MAPS").length).toBeGreaterThanOrEqual(1);
  });
});
