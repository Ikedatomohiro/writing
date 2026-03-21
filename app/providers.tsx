"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider } from "@/lib/theme";

/**
 * Root providers for the application.
 * ChakraProvider is kept temporarily during migration to Tailwind CSS.
 * It will be removed once all components are migrated.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider>{children}</ThemeProvider>
    </ChakraProvider>
  );
}
