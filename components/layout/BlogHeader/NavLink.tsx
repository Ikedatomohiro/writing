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
        px-3 py-2 rounded-lg text-sm font-body transition-colors
        ${
          isActive
            ? "text-primary font-semibold"
            : "text-on-surface-variant font-normal hover:text-on-surface"
        }
      `}
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </NextLink>
  );
}
