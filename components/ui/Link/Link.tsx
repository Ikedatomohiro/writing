"use client";

import { forwardRef, type ReactNode, type AnchorHTMLAttributes } from "react";
import NextLink from "next/link";

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  external?: boolean;
  children: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, external = false, children, className, ...props }, ref) => {
    const externalProps = external
      ? { target: "_blank" as const, rel: "noopener noreferrer" }
      : {};

    const linkClasses = `text-primary no-underline hover:underline transition-colors ${className ?? ""}`;

    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          className={linkClasses}
          data-styled="true"
          {...externalProps}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <NextLink
        ref={ref}
        href={href}
        className={linkClasses}
        data-styled="true"
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);

Link.displayName = "Link";
