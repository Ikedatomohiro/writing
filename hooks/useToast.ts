import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastOptions {
  duration?: number;
}

let counter = 0;

function generateId(): string {
  return `toast-${++counter}-${Date.now()}`;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, options: ToastOptions = {}) => {
      const id = generateId();
      const duration = options.duration ?? 4000;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
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

  return { toasts, toast, dismiss };
}
