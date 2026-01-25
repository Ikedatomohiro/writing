import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MobileMenu } from "./MobileMenu";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

const defaultLinks = [
  { href: "/asset", label: "資産形成" },
  { href: "/tech", label: "プログラミング" },
  { href: "/health", label: "健康" },
];

describe("MobileMenu", () => {
  describe("rendering", () => {
    it("renders hamburger button", () => {
      renderWithChakra(<MobileMenu links={defaultLinks} />);
      expect(screen.getByRole("button", { name: /メニュー/i })).toBeInTheDocument();
    });

    it("menu is closed by default", () => {
      renderWithChakra(<MobileMenu links={defaultLinks} />);
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("opens menu when hamburger button is clicked", async () => {
      renderWithChakra(<MobileMenu links={defaultLinks} />);

      const button = screen.getByRole("button", { name: /メニュー/i });
      fireEvent.click(button);

      expect(await screen.findByRole("navigation")).toBeInTheDocument();
    });

    it("displays all navigation links when open", async () => {
      renderWithChakra(<MobileMenu links={defaultLinks} />);

      const button = screen.getByRole("button", { name: /メニュー/i });
      fireEvent.click(button);

      expect(await screen.findByText("資産形成")).toBeInTheDocument();
      expect(screen.getByText("プログラミング")).toBeInTheDocument();
      expect(screen.getByText("健康")).toBeInTheDocument();
    });

    it("closes menu when close button is clicked", async () => {
      renderWithChakra(<MobileMenu links={defaultLinks} />);

      // Open menu
      const openButton = screen.getByRole("button", { name: /メニュー/i });
      fireEvent.click(openButton);

      // Close menu
      const closeButton = await screen.findByRole("button", { name: /閉じる/i });
      fireEvent.click(closeButton);

      // Wait for menu to close
      await vi.waitFor(() => {
        expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("hamburger button has aria-label", () => {
      renderWithChakra(<MobileMenu links={defaultLinks} />);
      const button = screen.getByRole("button", { name: /メニュー/i });
      expect(button).toHaveAttribute("aria-label");
    });

    it("hamburger button has aria-expanded attribute", () => {
      renderWithChakra(<MobileMenu links={defaultLinks} />);
      const button = screen.getByRole("button", { name: /メニュー/i });
      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });
});
