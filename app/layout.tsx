import type { Metadata } from "next";
import { Providers } from "./providers";
import { ThemeScript } from "@/lib/theme/ThemeScript";
import { fontVariables } from "@/lib/fonts";
import { SITE_CONFIG } from "@/lib/constants/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [
      {
        url: SITE_CONFIG.defaultOgImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={fontVariables} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
