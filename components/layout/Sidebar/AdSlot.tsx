"use client";

import { type ReactNode } from "react";
import { getAdsEnabled } from "@/components/ui/Ad/Ad";

export type AdSize = "rectangle" | "skyscraper" | "leaderboard";

export interface AdSlotProps {
  size: AdSize;
  slotId?: string;
  showPlaceholder?: boolean;
  children?: ReactNode;
}

const sizeStyles: Record<AdSize, { height: string }> = {
  rectangle: { height: "h-[250px]" },
  skyscraper: { height: "h-[600px]" },
  leaderboard: { height: "h-[90px]" },
};

export function AdSlot({
  size,
  slotId,
  showPlaceholder = false,
  children,
}: AdSlotProps) {
  const adsEnabled = getAdsEnabled();
  if (!adsEnabled) return null;

  const { height } = sizeStyles[size];
  const bgClass = showPlaceholder ? "bg-surface-container" : "";

  return (
    <div
      role="region"
      aria-label="Advertisement"
      data-testid="ad-slot"
      data-size={size}
      data-slot-id={slotId}
      className={`w-full ${height} ${bgClass} rounded-xl overflow-hidden`}
    >
      {showPlaceholder ? (
        <div className="flex items-center justify-center h-full">
          <span className="font-body text-sm text-on-surface-variant">
            広告
          </span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
