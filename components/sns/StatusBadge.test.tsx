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

  it("pending_approval ステータスを黄色で表示する", () => {
    render(<StatusBadge status="pending_approval" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveTextContent("pending_approval");
    expect(badge.className).toMatch(/yellow|amber/);
  });

  it("approved ステータスを青で表示する", () => {
    render(<StatusBadge status="approved" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveTextContent("approved");
    expect(badge.className).toMatch(/blue/);
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
