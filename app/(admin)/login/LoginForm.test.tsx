import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { LoginForm } from "./LoginForm";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("ログインボタンが表示される", () => {
    renderWithChakra(<LoginForm />);
    expect(
      screen.getByRole("button", { name: "Googleでログイン" })
    ).toBeInTheDocument();
  });

  it("見出しが表示される", () => {
    renderWithChakra(<LoginForm />);
    expect(
      screen.getByRole("heading", { name: "管理画面ログイン" })
    ).toBeInTheDocument();
  });

  it("エラーがない場合はエラーメッセージが表示されない", () => {
    renderWithChakra(<LoginForm />);
    expect(
      screen.queryByText("アクセスが拒否されました")
    ).not.toBeInTheDocument();
  });

  it("AccessDeniedエラーの場合は適切なメッセージが表示される", () => {
    renderWithChakra(<LoginForm error="AccessDenied" />);
    expect(
      screen.getByText(
        "アクセスが拒否されました。許可されたアカウントでログインしてください。"
      )
    ).toBeInTheDocument();
  });

  it("Configurationエラーの場合は適切なメッセージが表示される", () => {
    renderWithChakra(<LoginForm error="Configuration" />);
    expect(
      screen.getByText(
        "認証設定にエラーがあります。管理者にお問い合わせください。"
      )
    ).toBeInTheDocument();
  });

  it("不明なエラーの場合はデフォルトメッセージが表示される", () => {
    renderWithChakra(<LoginForm error="UnknownError" />);
    expect(
      screen.getByText("ログインに失敗しました。もう一度お試しください。")
    ).toBeInTheDocument();
  });

  it("ログインボタンをクリックするとsignInが呼ばれる", async () => {
    const user = userEvent.setup();
    const { signIn } = await import("next-auth/react");

    renderWithChakra(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Googleでログイン" }));

    expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/articles" });
  });
});
