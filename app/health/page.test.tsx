import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import HealthPage from "./page";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
  );
}

describe("HealthPage", () => {
  it("renders heading", () => {
    renderWithProviders(<HealthPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("健康");
  });
});
