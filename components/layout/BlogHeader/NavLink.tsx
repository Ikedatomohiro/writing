"use client";

import { type ReactNode } from "react";
import NextLink from "next/link";
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
    <NextLink
      href={href}
      className={`
        px-3 py-2 text-sm font-body transition-colors
        ${
          isActive
            ? "text-primary font-semibold border-b-2 border-primary pb-1"
            : "text-on-surface-variant hover:text-primary transition-colors font-medium"
        }
      `}
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </NextLink>
  );
}
