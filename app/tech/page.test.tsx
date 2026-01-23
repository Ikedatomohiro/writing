import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import TechPage from "./page";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
  );
}

describe("TechPage", () => {
  it("renders heading", () => {
    renderWithProviders(<TechPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "エンジニア"
    );
  });
});
