"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "削除",
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmDialogProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button on open, handle Esc + focus trap
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = [confirmRef.current, cancelRef.current].filter(Boolean) as HTMLButtonElement[];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        role="alertdialog"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
      >
        <h2 id={titleId} className="text-base font-bold text-slate-900 mb-2">
          {title}
        </h2>
        {description && (
          <p id={descId} className="text-sm text-slate-600 mb-6">
            {description}
          </p>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus-visible:ring-2 transition-colors ${
              destructive
                ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
                : "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
