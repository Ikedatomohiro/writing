"use client";

import { type ReactNode } from "react";
import NextLink from "next/link";
import { Link as ChakraLink } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

export interface NavLinkProps {
  href: string;
  children: ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  // Match exact path or path with trailing slash/subpath
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <ChakraLink
      as={NextLink}
      href={href}
      color={isActive ? "var(--accent)" : "var(--text-secondary)"}
      fontWeight={isActive ? "600" : "400"}
      textDecoration="none"
      px={3}
      py={2}
      borderRadius="md"
      _hover={{
        color: "var(--accent)",
        textDecoration: "underline",
      }}
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </ChakraLink>
  );
}
