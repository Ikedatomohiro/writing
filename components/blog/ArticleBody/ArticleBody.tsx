import { Box } from "@chakra-ui/react";
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
    <Box
      as="article"
      className={classes}
      data-testid="article-body"
      borderRadius="lg"
      bg="var(--bg-card)"
      p={8}
      borderWidth="1px"
      borderColor="var(--border)"
    >
      {children}
    </Box>
  );
}
