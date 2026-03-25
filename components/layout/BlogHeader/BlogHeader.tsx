"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setSearchQuery("");
    }
  };

  return (
    <header
      className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/50 shadow-sm"
      data-component="blog-header"
    >
      <div className="flex justify-between items-center h-16 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo / Site Name */}
        <NextLink
          href="/"
          className="font-headline text-2xl font-black tracking-tighter text-on-surface hover:opacity-80 transition-opacity"
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

        {/* Search & Subscribe */}
        <div className="hidden md:flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="記事を検索..."
              className="bg-surface-container border-none rounded-full py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary/20 w-48 font-body text-on-surface placeholder:text-on-surface-variant/50"
              data-testid="header-search-input"
            />
          </form>
          <NextLink
            href="/search"
            className="inline-flex px-5 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold hover:bg-primary-container transition-colors"
            data-testid="header-subscribe-button"
          >
            購読
          </NextLink>
        </div>

        {/* Mobile Menu */}
        <div className="block md:hidden">
          <MobileMenu links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
