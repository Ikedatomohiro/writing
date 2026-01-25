"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getThemeFromPath } from "./utils";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = getThemeFromPath(pathname);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return <>{children}</>;
}
