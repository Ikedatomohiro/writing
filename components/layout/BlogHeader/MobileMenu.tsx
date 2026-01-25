"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  IconButton,
  VStack,
  Portal,
} from "@chakra-ui/react";
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
      <IconButton
        ref={openButtonRef}
        aria-label="メニューを開く"
        aria-expanded={isOpen}
        onClick={handleOpen}
        variant="ghost"
        size="md"
      >
        <HamburgerIcon />
      </IconButton>

      {isOpen && (
        <Portal>
          {/* Backdrop with fade animation */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            zIndex={1000}
            onClick={handleClose}
            opacity={isAnimating ? 1 : 0}
            transition="opacity 0.3s ease-in-out"
            data-testid="mobile-menu-backdrop"
          />
          {/* Menu with slide animation */}
          <Box
            ref={menuRef}
            as="nav"
            role="navigation"
            aria-label="モバイルメニュー"
            position="fixed"
            top={0}
            right={0}
            bottom={0}
            width="280px"
            bg="var(--bg-card)"
            zIndex={1001}
            boxShadow="lg"
            transform={isAnimating ? "translateX(0)" : "translateX(100%)"}
            transition="transform 0.3s ease-in-out"
          >
            <Box p={4} borderBottomWidth="1px" borderColor="var(--border)">
              <IconButton
                ref={closeButtonRef}
                aria-label="メニューを閉じる"
                onClick={handleClose}
                variant="ghost"
                size="md"
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <VStack align="stretch" p={4} gap={2}>
              {links.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </VStack>
          </Box>
        </Portal>
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
