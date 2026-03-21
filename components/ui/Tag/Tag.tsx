"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";

export type TagVariant = "default" | "category";
export type TagSize = "sm" | "md";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: TagSize;
  children: ReactNode;
}

const variantClasses: Record<TagVariant, string> = {
  default: "bg-surface-container text-on-surface-variant",
  category: "bg-primary-container text-primary",
};

const sizeClasses: Record<TagSize, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ variant = "default", size = "md", children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center font-label font-medium tracking-widest uppercase rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className ?? ""}`}
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Tag.displayName = "Tag";
