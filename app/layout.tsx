import { Providers } from "./providers";
import { ThemeScript } from "@/lib/theme/ThemeScript";
import { fontVariables } from "@/lib/fonts";
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
    <html lang="ja" className={fontVariables} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
