import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  afterEach(() => {
    cleanup();
  });

  it("draft ステータスをグレーで表示する", () => {
    render(<StatusBadge status="draft" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("draft");
    expect(badge.className).toMatch(/slate|gray/);
  });

  it("queued ステータスをオレンジで表示する", () => {
    render(<StatusBadge status="queued" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveTextContent("queued");
    expect(badge.className).toMatch(/orange/);
  });

  it("posted (is_posted=true) ステータスを緑で表示する", () => {
    render(<StatusBadge status="draft" isPosted={true} />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveTextContent("posted");
    expect(badge.className).toMatch(/green/);
  });
});
