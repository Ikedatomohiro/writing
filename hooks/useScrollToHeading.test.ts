import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollToHeading } from "./useScrollToHeading";

describe("useScrollToHeading", () => {
  const mockScrollTo = vi.fn();
  const originalScrollTo = window.scrollTo;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    window.scrollTo = mockScrollTo;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    window.scrollTo = originalScrollTo;
  });

  describe("basic functionality", () => {
    it("returns a function", () => {
      const { result } = renderHook(() => useScrollToHeading());
      expect(typeof result.current).toBe("function");
    });

    it("scrolls to the element with the given id", () => {
      const heading = document.createElement("h2");
      heading.id = "test-heading";
      document.body.appendChild(heading);

      // Mock getBoundingClientRect
      heading.getBoundingClientRect = vi.fn(() => ({
        top: 500,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      const { result } = renderHook(() => useScrollToHeading());
      result.current("test-heading");

      expect(mockScrollTo).toHaveBeenCalled();
    });

    it("does nothing when element does not exist", () => {
      const { result } = renderHook(() => useScrollToHeading());
      result.current("nonexistent");

      expect(mockScrollTo).not.toHaveBeenCalled();
    });
  });

  describe("offset", () => {
    it("applies default offset", () => {
      const heading = document.createElement("h2");
      heading.id = "test-heading";
      document.body.appendChild(heading);

      heading.getBoundingClientRect = vi.fn(() => ({
        top: 500,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      Object.defineProperty(window, "scrollY", { value: 0, writable: true });

      const { result } = renderHook(() => useScrollToHeading());
      result.current("test-heading");

      // Default offset is 80 (header height)
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 500 - 80,
        behavior: "smooth",
      });
    });

    it("applies custom offset", () => {
      const heading = document.createElement("h2");
      heading.id = "test-heading";
      document.body.appendChild(heading);

      heading.getBoundingClientRect = vi.fn(() => ({
        top: 500,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      Object.defineProperty(window, "scrollY", { value: 0, writable: true });

      const { result } = renderHook(() =>
        useScrollToHeading({ offset: 100 })
      );
      result.current("test-heading");

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 500 - 100,
        behavior: "smooth",
      });
    });
  });

  describe("scroll behavior", () => {
    it("uses smooth scroll by default", () => {
      const heading = document.createElement("h2");
      heading.id = "test-heading";
      document.body.appendChild(heading);

      heading.getBoundingClientRect = vi.fn(() => ({
        top: 500,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      const { result } = renderHook(() => useScrollToHeading());
      result.current("test-heading");

      expect(mockScrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "smooth" })
      );
    });

    it("allows custom scroll behavior", () => {
      const heading = document.createElement("h2");
      heading.id = "test-heading";
      document.body.appendChild(heading);

      heading.getBoundingClientRect = vi.fn(() => ({
        top: 500,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      const { result } = renderHook(() =>
        useScrollToHeading({ behavior: "instant" })
      );
      result.current("test-heading");

      expect(mockScrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "instant" })
      );
    });
  });

  describe("current scroll position", () => {
    it("accounts for current scroll position", () => {
      const heading = document.createElement("h2");
      heading.id = "test-heading";
      document.body.appendChild(heading);

      heading.getBoundingClientRect = vi.fn(() => ({
        top: 300, // relative to viewport
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      Object.defineProperty(window, "scrollY", { value: 200, writable: true });

      const { result } = renderHook(() => useScrollToHeading());
      result.current("test-heading");

      // 300 (relative to viewport) + 200 (current scroll) - 80 (offset) = 420
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 420,
        behavior: "smooth",
      });
    });
  });
});
