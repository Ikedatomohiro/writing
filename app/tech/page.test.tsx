import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithChakra } from "@/app/test-utils";
import TechPage from "./page";

describe("TechPage", () => {
  it("renders heading", () => {
    renderWithChakra(<TechPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "エンジニア"
    );
  });
});
