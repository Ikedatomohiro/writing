import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithChakra } from "@/app/test-utils";
import AssetPage from "./page";

describe("AssetPage", () => {
  it("renders heading", () => {
    renderWithChakra(<AssetPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "資産形成"
    );
  });
});
