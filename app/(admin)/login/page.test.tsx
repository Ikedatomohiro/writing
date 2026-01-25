import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, screen, render } from "@testing-library/react";
import LoginPage from "./page";
import { LoginForm } from "./LoginForm";

vi.mock("./LoginForm", () => ({
  LoginForm: vi.fn(({ error }: { error?: string }) => (
    <div data-testid="login-form">{error && <span>Error: {error}</span>}</div>
  )),
}));

const MockedLoginForm = vi.mocked(LoginForm);

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("エラーがない場合、LoginFormにエラーを渡さない", async () => {
    const searchParams = Promise.resolve({});

    render(await LoginPage({ searchParams }));

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(MockedLoginForm).toHaveBeenCalledWith(
      expect.objectContaining({ error: undefined }),
      undefined
    );
  });

  it("エラーがある場合、LoginFormにエラーを渡す", async () => {
    const searchParams = Promise.resolve({ error: "AccessDenied" });

    render(await LoginPage({ searchParams }));

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(MockedLoginForm).toHaveBeenCalledWith(
      expect.objectContaining({ error: "AccessDenied" }),
      undefined
    );
  });

  it("Configurationエラーを渡す", async () => {
    const searchParams = Promise.resolve({ error: "Configuration" });

    render(await LoginPage({ searchParams }));

    expect(MockedLoginForm).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Configuration" }),
      undefined
    );
  });
});
