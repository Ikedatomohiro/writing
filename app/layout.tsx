import { Providers } from "./providers";
import { ThemeScript } from "@/lib/theme/ThemeScript";
import "./globals.css";

export const metadata = {
  title: "Writing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
