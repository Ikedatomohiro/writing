"use client";

import { useEffect, useState } from "react";
import type { Toast as ToastItem, ToastType } from "@/hooks/useToast";

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function getTypeClasses(type: ToastType): string {
  switch (type) {
    case "success":
      return "bg-green-600 text-white";
    case "error":
      return "bg-red-600 text-white";
    case "info":
      return "bg-slate-700 text-white";
  }
}

function getIcon(type: ToastType): string {
  switch (type) {
    case "success":
      return "check_circle";
    case "error":
      return "error";
    case "info":
      return "info";
  }
}

export function ToastItem({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  const role = toast.type === "error" ? "alert" : "status";
  const ariaLive = toast.type === "error" ? "assertive" : "polite";

  return (
    <div
      role={role}
      aria-live={ariaLive}
      data-testid="toast"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-200 ${getTypeClasses(toast.type)} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <span className="material-symbols-outlined text-lg shrink-0">
        {getIcon(toast.type)}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={handleDismiss}
        className="shrink-0 p-0.5 rounded opacity-70 hover:opacity-100 transition-opacity"
        aria-label="閉じる"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}
