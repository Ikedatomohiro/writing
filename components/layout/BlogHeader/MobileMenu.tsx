"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "./NavLink";

export interface NavLinkItem {
  href: string;
  label: string;
}

export interface MobileMenuProps {
  links: NavLinkItem[];
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    setIsAnimating(true);
    setIsOpen(true);
  };

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setIsOpen(false);
      openButtonRef.current?.focus();
    }, 300);
  }, []);

  // Handle ESC key to close menu
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Focus trap within menu
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus close button when menu opens
    closeButtonRef.current?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    menu.addEventListener("keydown", handleTabKey);
    return () => menu.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  // Trigger animation after mount
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure CSS transition works
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={openButtonRef}
        aria-label="メニューを開く"
        aria-expanded={isOpen}
        onClick={handleOpen}
        className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
      >
        <HamburgerIcon />
      </button>

      {isOpen &&
        createPortal(
          <>
            {/* Backdrop with fade animation */}
            <div
              className={`fixed inset-0 bg-black/50 z-[1000] transition-opacity duration-300 ease-in-out ${
                isAnimating ? "opacity-100" : "opacity-0"
              }`}
              onClick={handleClose}
              data-testid="mobile-menu-backdrop"
            />
            {/* Menu with slide animation */}
            <div
              ref={menuRef}
              role="navigation"
              aria-label="モバイルメニュー"
              className={`fixed top-0 right-0 bottom-0 w-[280px] bg-surface-container-lowest z-[1001] shadow-lg transition-transform duration-300 ease-in-out ${
                isAnimating ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="p-4 border-b border-outline-variant">
                <button
                  ref={closeButtonRef}
                  aria-label="メニューを閉じる"
                  onClick={handleClose}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="flex flex-col gap-2 p-4">
                {links.map((link) => (
                  <NavLink key={link.href} href={link.href}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}

function HamburgerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
