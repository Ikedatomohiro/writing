import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithChakra } from "@/app/test-utils";
import HealthPage from "./page";

describe("HealthPage", () => {
  it("renders heading", () => {
    renderWithChakra(<HealthPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("健康");
  });
});
