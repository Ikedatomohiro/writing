"use client";

import { createContext, useContext, useRef, useCallback, useState } from "react";
import type { Toast, ToastType, ToastOptions } from "@/hooks/useToast";
import { ToastItem } from "./Toast";

interface ToastContextValue {
  toast: {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
  };
  dismiss: (id: string) => void;
}

let counter = 0;

function generateId(): string {
  return `toast-provider-${++counter}-${Date.now()}`;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, options: ToastOptions = {}) => {
      const id = generateId();
      const duration = options.duration ?? 4000;
      setToasts((prev) => [...prev, { id, message, type }]);
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timersRef.current.delete(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    []
  );

  const toast = {
    success: (message: string, options?: ToastOptions) =>
      addToast(message, "success", options),
    error: (message: string, options?: ToastOptions) =>
      addToast(message, "error", options),
    info: (message: string, options?: ToastOptions) =>
      addToast(message, "info", options),
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast container: fixed bottom-right */}
      <div
        aria-label="通知"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return ctx;
}
