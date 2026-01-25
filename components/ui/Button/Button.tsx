"use client";

import { forwardRef, type ReactNode } from "react";
import {
  Button as ChakraButton,
  Spinner,
  type ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<ChakraButtonProps, "variant" | "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<
  ButtonVariant,
  { bg: string; color: string; _hover: { opacity: number } }
> = {
  primary: {
    bg: "var(--accent)",
    color: "white",
    _hover: { opacity: 0.9 },
  },
  secondary: {
    bg: "var(--accent-bg)",
    color: "var(--accent)",
    _hover: { opacity: 0.8 },
  },
  ghost: {
    bg: "transparent",
    color: "var(--text-secondary)",
    _hover: { opacity: 0.8 },
  },
};

const sizeStyles: Record<ButtonSize, { px: number; py: number; fontSize: string }> = {
  sm: { px: 4, py: 2, fontSize: "sm" },
  md: { px: 6, py: 3, fontSize: "md" },
  lg: { px: 8, py: 4, fontSize: "lg" },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <ChakraButton
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        bg={variantStyle.bg}
        color={variantStyle.color}
        px={sizeStyle.px}
        py={sizeStyle.py}
        fontSize={sizeStyle.fontSize}
        fontWeight="medium"
        borderRadius="md"
        opacity={isDisabled ? 0.5 : 1}
        cursor={isDisabled ? "not-allowed" : "pointer"}
        _hover={!isDisabled ? variantStyle._hover : undefined}
        _focus={{
          outline: "none",
          boxShadow: "0 0 0 2px var(--accent)",
        }}
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {loading && (
          <Spinner
            data-testid="button-spinner"
            size="sm"
            mr={2}
          />
        )}
        {children}
      </ChakraButton>
    );
  }
);

Button.displayName = "Button";
