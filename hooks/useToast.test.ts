import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useToast } from "./useToast";

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with empty toasts", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });

  it("adds a success toast", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.success("保存しました");
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("保存しました");
    expect(result.current.toasts[0].type).toBe("success");
  });

  it("adds an error toast", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.error("エラーが発生しました");
    });
    expect(result.current.toasts[0].type).toBe("error");
  });

  it("auto-removes toast after duration", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.success("一時的なメッセージ", { duration: 3000 });
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("uses default duration of 4000ms", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.success("メッセージ");
    });
    act(() => {
      vi.advanceTimersByTime(3999);
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("removes toast manually by id", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.success("メッセージ");
    });
    const id = result.current.toasts[0].id;
    act(() => {
      result.current.dismiss(id);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("can stack multiple toasts", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.success("1つ目");
      result.current.toast.error("2つ目");
    });
    expect(result.current.toasts).toHaveLength(2);
  });

  it("toast has unique id", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.success("A");
      result.current.toast.success("B");
    });
    const ids = result.current.toasts.map((t) => t.id);
    expect(new Set(ids).size).toBe(2);
  });
});
