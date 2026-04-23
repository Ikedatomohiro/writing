import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants/site";

const FOOTER_LINKS = [
  { label: "運営者について", href: "/about" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "利用規約", href: "/terms" },
  { label: "お問い合わせ", href: "/contact" },
] as const;

const SOCIAL_ICONS = [
  { icon: "mail", href: "/contact", label: "Email" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-container-lowest py-12 border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand Section */}
          <div className="flex flex-col">
            <span className="font-headline text-lg font-extrabold tracking-tighter text-on-surface">
              {SITE_CONFIG.name}
            </span>
            <p className="font-label text-xs tracking-wider text-on-surface-variant mt-1">
              知見を綴る、ひとりの時間。
            </p>
            <p className="font-label text-[10px] tracking-wider text-on-surface-variant/50 mt-2">
              &copy; {currentYear} {SITE_CONFIG.name}. All rights reserved.
            </p>
          </div>

          {/* Links Row */}
          <div className="flex flex-col gap-4">
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs tracking-wider uppercase underline underline-offset-4 decoration-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Social Icons */}
            <div className="flex gap-3">
              {SOCIAL_ICONS.map((social) => (
                <Link
                  key={social.icon}
                  href={social.href}
                  aria-label={social.label}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    {social.icon}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
