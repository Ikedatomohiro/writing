import { type ReactNode } from "react";

export interface SidebarProps {
  children: ReactNode;
  sticky?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function Sidebar({
  children,
  sticky = true,
  className = "",
  "aria-label": ariaLabel,
}: SidebarProps) {
  const stickyClass = sticky ? "sticky top-[100px]" : "relative";

  return (
    <aside
      data-testid="sidebar"
      data-sticky={sticky.toString()}
      data-hide-mobile="true"
      aria-label={ariaLabel}
      className={`w-[300px] hidden lg:flex flex-col gap-6 self-start ${stickyClass} ${className}`}
    >
      {children}
    </aside>
  );
}
