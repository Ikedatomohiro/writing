"use client";

import NextLink from "next/link";
import { NavLink } from "./NavLink";
import { MobileMenu, type NavLinkItem } from "./MobileMenu";
import { SITE_CONFIG } from "@/lib/constants/site";

const NAV_LINKS: NavLinkItem[] = [
  { href: "/asset", label: "資産形成" },
  { href: "/tech", label: "プログラミング" },
  { href: "/health", label: "健康" },
];

export function BlogHeader() {
  return (
    <header
      className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/50 shadow-sm"
      data-component="blog-header"
    >
      <div className="flex justify-between items-center h-16 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo / Site Name */}
        <NextLink
          href="/"
          className="font-headline font-bold text-lg md:text-xl text-primary hover:opacity-80 transition-opacity"
        >
          {SITE_CONFIG.name}
        </NextLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu */}
        <div className="block md:hidden">
          <MobileMenu links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
