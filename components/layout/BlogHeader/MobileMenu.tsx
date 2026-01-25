"use client";

import { useState } from "react";
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

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <IconButton
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
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            zIndex={1000}
            onClick={handleClose}
          />
          <Box
            as="nav"
            role="navigation"
            position="fixed"
            top={0}
            right={0}
            bottom={0}
            width="280px"
            bg="var(--bg-card)"
            zIndex={1001}
            boxShadow="lg"
          >
            <Box p={4} borderBottomWidth="1px" borderColor="var(--border)">
              <IconButton
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
