import Link from "next/link";

export interface AuthorBylineProps {
  name: string;
  href: string;
  className?: string;
}

/**
 * AuthorByline component
 * Renders author name as a link to the /about page for E-E-A-T signal.
 */
export function AuthorByline({ name, href, className = "" }: AuthorBylineProps) {
  return (
    <div
      className={`flex items-center gap-1 text-sm text-on-surface-variant ${className}`}
      data-testid="author-byline"
    >
      <span>by</span>
      <Link
        href={href}
        className="font-bold text-primary hover:underline transition-colors"
      >
        {name}
      </Link>
    </div>
  );
}
