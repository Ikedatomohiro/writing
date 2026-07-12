import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { AdminSidebar } from "./AdminSidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

function renderSidebar() {
  return render(
    <AdminSidebar
      open={false}
      collapsed={false}
      onClose={() => {}}
      onToggleCollapsed={() => {}}
    />,
  );
}

describe("AdminSidebar", () => {
  afterEach(() => cleanup());

  it("エンゲージメント解析メニューを表示し /insights へリンクする", () => {
    renderSidebar();
    const link = screen.getByRole("link", { name: "エンゲージメント解析" });
    expect(link).toHaveAttribute("href", "/insights");
  });

  it("既存のメニュー（ダッシュボード/記事/Threads/X）も維持する", () => {
    renderSidebar();
    expect(screen.getByRole("link", { name: "ダッシュボード" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "記事" })).toHaveAttribute("href", "/articles");
    expect(screen.getByRole("link", { name: "Threads" })).toHaveAttribute("href", "/threads");
    expect(screen.getByRole("link", { name: "X" })).toHaveAttribute("href", "/x");
  });
});
