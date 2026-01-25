import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useActiveHeading } from "./useActiveHeading";

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

type ObserverCallback = IntersectionObserverCallback;
let observerCallback: ObserverCallback | null = null;
let observerOptions: IntersectionObserverInit | undefined;

class MockIntersectionObserver {
  constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
    observerCallback = callback;
    observerOptions = options;
  }
  observe = mockObserve;
  unobserve = vi.fn();
  disconnect = mockDisconnect;
  takeRecords = () => [];
  root = null;
  rootMargin = "";
  thresholds = [];
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

function triggerObserver(entries: Partial<IntersectionObserverEntry>[]) {
  if (observerCallback) {
    observerCallback(
      entries.map((entry) => ({
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRatio: 0,
        intersectionRect: {} as DOMRectReadOnly,
        isIntersecting: false,
        rootBounds: null,
        target: document.createElement("div"),
        time: 0,
        ...entry,
      })) as IntersectionObserverEntry[],
      {} as IntersectionObserver
    );
  }
}

describe("useActiveHeading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    observerCallback = null;
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("initialization", () => {
    it("returns undefined when no headings are visible", () => {
      const { result } = renderHook(() =>
        useActiveHeading({ headingIds: ["h1", "h2"] })
      );

      expect(result.current).toBeUndefined();
    });

    it("observes all heading elements", () => {
      document.body.innerHTML = `
        <h2 id="heading1">Heading 1</h2>
        <h2 id="heading2">Heading 2</h2>
      `;

      renderHook(() =>
        useActiveHeading({ headingIds: ["heading1", "heading2"] })
      );

      expect(mockObserve).toHaveBeenCalledTimes(2);
    });

    it("skips non-existent heading ids", () => {
      document.body.innerHTML = `<h2 id="heading1">Heading 1</h2>`;

      renderHook(() =>
        useActiveHeading({ headingIds: ["heading1", "nonexistent"] })
      );

      expect(mockObserve).toHaveBeenCalledTimes(1);
    });
  });

  describe("active heading detection", () => {
    it("sets active heading when element intersects", async () => {
      const heading = document.createElement("h2");
      heading.id = "test-heading";
      document.body.appendChild(heading);

      const { result } = renderHook(() =>
        useActiveHeading({ headingIds: ["test-heading"] })
      );

      act(() => {
        triggerObserver([{ target: heading, isIntersecting: true }]);
      });

      await waitFor(() => {
        expect(result.current).toBe("test-heading");
      });
    });

    it("updates active heading when multiple elements intersect", async () => {
      const heading1 = document.createElement("h2");
      heading1.id = "heading1";
      const heading2 = document.createElement("h2");
      heading2.id = "heading2";
      document.body.appendChild(heading1);
      document.body.appendChild(heading2);

      const { result } = renderHook(() =>
        useActiveHeading({ headingIds: ["heading1", "heading2"] })
      );

      // First heading becomes visible
      act(() => {
        triggerObserver([{ target: heading1, isIntersecting: true }]);
      });

      await waitFor(() => {
        expect(result.current).toBe("heading1");
      });

      // Second heading becomes visible (both now visible)
      act(() => {
        triggerObserver([{ target: heading2, isIntersecting: true }]);
      });

      // When multiple are visible, first in document order is active
      await waitFor(() => {
        expect(result.current).toBe("heading1");
      });
    });

    it("updates to next visible heading when current leaves viewport", async () => {
      const heading1 = document.createElement("h2");
      heading1.id = "heading1";
      const heading2 = document.createElement("h2");
      heading2.id = "heading2";
      document.body.appendChild(heading1);
      document.body.appendChild(heading2);

      const { result } = renderHook(() =>
        useActiveHeading({ headingIds: ["heading1", "heading2"] })
      );

      // Both headings visible
      act(() => {
        triggerObserver([
          { target: heading1, isIntersecting: true },
          { target: heading2, isIntersecting: true },
        ]);
      });

      await waitFor(() => {
        expect(result.current).toBe("heading1");
      });

      // First heading leaves viewport
      act(() => {
        triggerObserver([{ target: heading1, isIntersecting: false }]);
      });

      await waitFor(() => {
        expect(result.current).toBe("heading2");
      });
    });
  });

  describe("cleanup", () => {
    it("disconnects observer on unmount", () => {
      document.body.innerHTML = `<h2 id="h1">Heading</h2>`;

      const { unmount } = renderHook(() =>
        useActiveHeading({ headingIds: ["h1"] })
      );

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe("options", () => {
    it("applies custom rootMargin", () => {
      document.body.innerHTML = `<h2 id="h1">H1</h2>`;

      renderHook(() =>
        useActiveHeading({
          headingIds: ["h1"],
          rootMargin: "-100px 0px",
        })
      );

      expect(observerOptions?.rootMargin).toBe("-100px 0px");
    });
  });
});
