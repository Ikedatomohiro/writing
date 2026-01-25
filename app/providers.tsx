"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider value={defaultSystem}>
        <ThemeProvider>{children}</ThemeProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}
