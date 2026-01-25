"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import { Box } from "@chakra-ui/react";

export type TagVariant = "default" | "category";
export type TagSize = "sm" | "md";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: TagSize;
  children: ReactNode;
}

const variantStyles: Record<
  TagVariant,
  { bg: string; color: string }
> = {
  default: {
    bg: "var(--bg-surface)",
    color: "var(--text-secondary)",
  },
  category: {
    bg: "var(--accent-bg)",
    color: "var(--accent)",
  },
};

const sizeStyles: Record<TagSize, { px: number; py: number; fontSize: string }> = {
  sm: { px: 2, py: 1, fontSize: "xs" },
  md: { px: 3, py: 1.5, fontSize: "sm" },
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ variant = "default", size = "md", children, ...props }, ref) => {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    return (
      <Box
        as="span"
        ref={ref}
        display="inline-flex"
        alignItems="center"
        bg={variantStyle.bg}
        color={variantStyle.color}
        px={sizeStyle.px}
        py={sizeStyle.py}
        fontSize={sizeStyle.fontSize}
        fontWeight="medium"
        borderRadius="md"
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Tag.displayName = "Tag";
