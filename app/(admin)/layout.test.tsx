import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import AdminLayout from "./layout";

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

describe("AdminLayout", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders children within SessionProvider", () => {
    render(
      <AdminLayout>
        <div data-testid="child-content">Test Content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId("session-provider")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("wraps children with SessionProvider", () => {
    render(
      <AdminLayout>
        <span>Nested Content</span>
      </AdminLayout>
    );

    const sessionProvider = screen.getByTestId("session-provider");
    expect(sessionProvider).toContainHTML("Nested Content");
  });
});
