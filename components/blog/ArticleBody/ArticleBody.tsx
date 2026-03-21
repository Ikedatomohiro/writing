import { ReactNode } from "react";

export interface ArticleBodyProps {
  children: ReactNode;
  className?: string;
}

/**
 * ArticleBody component
 * Wraps MDX content and applies article-specific styles
 *
 * @param children - MDX rendered content
 * @param className - Additional CSS class names
 */
export function ArticleBody({ children, className = "" }: ArticleBodyProps) {
  const classes = ["article-body", className].filter(Boolean).join(" ");

  return (
    <div
      className={`${classes} prose prose-slate max-w-none`}
      data-testid="article-body"
    >
      {children}
    </div>
  );
}
