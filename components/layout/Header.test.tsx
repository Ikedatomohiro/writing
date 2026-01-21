import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signOut, useSession } from "next-auth/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Header } from "./Header";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
  useSession: vi.fn(),
}));

const mockUseSession = useSession as ReturnType<typeof vi.fn>;
const mockSignOut = signOut as ReturnType<typeof vi.fn>;

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
  );
}

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("ログイン中はユーザーのメールアドレスとログアウトボタンを表示する", () => {
    mockUseSession.mockReturnValue({
      data: { user: { email: "test@example.com" } },
      status: "authenticated",
    });

    renderWithProviders(<Header />);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("ログアウト")).toBeInTheDocument();
  });

  it("未ログイン時はユーザー情報を表示しない", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    renderWithProviders(<Header />);

    expect(screen.queryByText("ログアウト")).not.toBeInTheDocument();
  });

  it("ログアウトボタンをクリックするとsignOutが呼ばれる", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { email: "test@example.com" } },
      status: "authenticated",
    });

    renderWithProviders(<Header />);

    const logoutButton = screen.getByText("ログアウト");
    await userEvent.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("タイトルが表示される", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    renderWithProviders(<Header />);

    expect(screen.getByText("記事管理システム")).toBeInTheDocument();
  });
});
