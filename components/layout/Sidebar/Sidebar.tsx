"use client";

import { forwardRef, type ReactNode } from "react";
import { Box, type BoxProps } from "@chakra-ui/react";

export interface SidebarProps extends Omit<BoxProps, "children"> {
  children: ReactNode;
  sticky?: boolean;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ children, sticky = true, ...props }, ref) => {
    return (
      <Box
        as="aside"
        ref={ref}
        data-testid="sidebar"
        data-sticky={sticky.toString()}
        data-hide-mobile="true"
        width="300px"
        display="flex"
        flexDirection="column"
        gap={6}
        position={sticky ? "sticky" : "relative"}
        top={sticky ? "100px" : undefined}
        alignSelf="flex-start"
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Sidebar.displayName = "Sidebar";
