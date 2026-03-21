import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants/site";

const CATEGORIES = [
  { label: "Investment", href: "/asset" },
  { label: "Programming", href: "/tech" },
  { label: "Health", href: "/health" },
] as const;

const LINKS = [
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact", href: "/contact" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-container-low pt-12 pb-6 px-6 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          {/* Brand Section */}
          <div className="flex flex-col gap-3 max-w-[300px]">
            <span className="font-headline font-bold text-xl text-on-surface">
              {SITE_CONFIG.name}
            </span>
            <p className="text-sm text-on-surface-variant leading-relaxed font-body">
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* Links Section */}
          <div className="flex gap-12">
            {/* Categories */}
            <div className="flex flex-col gap-3">
              <span className="font-label font-semibold text-sm text-on-surface">
                Categories
              </span>
              {CATEGORIES.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  className="text-sm text-on-surface-variant font-body hover:text-on-surface transition-colors"
                >
                  {category.label}
                </Link>
              ))}
            </div>

            {/* Other Links */}
            <div className="flex flex-col gap-3">
              <span className="font-label font-semibold text-sm text-on-surface">
                Links
              </span>
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-on-surface-variant font-body hover:text-on-surface transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-outline-variant pt-4 text-center">
          <p className="text-xs text-on-surface-variant font-label">
            &copy; {currentYear} {SITE_CONFIG.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
