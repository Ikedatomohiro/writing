"use client";

import { forwardRef, type ReactNode, type AnchorHTMLAttributes } from "react";
import NextLink from "next/link";
import { Link as ChakraLink } from "@chakra-ui/react";

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  external?: boolean;
  children: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, external = false, children, ...props }, ref) => {
    const externalProps = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <ChakraLink
        as={external ? "a" : NextLink}
        ref={ref}
        href={href}
        color="var(--accent)"
        textDecoration="none"
        _hover={{
          textDecoration: "underline",
        }}
        data-styled="true"
        {...externalProps}
        {...props}
      >
        {children}
      </ChakraLink>
    );
  }
);

Link.displayName = "Link";
