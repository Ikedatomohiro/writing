"use client";

import { type ReactNode } from "react";
import { Box, Text, Center } from "@chakra-ui/react";

export type AdSize = "rectangle" | "skyscraper" | "leaderboard";

export interface AdSlotProps {
  size: AdSize;
  slotId?: string;
  showPlaceholder?: boolean;
  children?: ReactNode;
}

const sizeStyles: Record<AdSize, { width: string | number; height: number }> = {
  rectangle: { width: "100%", height: 250 },
  skyscraper: { width: "100%", height: 600 },
  leaderboard: { width: "100%", height: 90 },
};

export function AdSlot({
  size,
  slotId,
  showPlaceholder = false,
  children,
}: AdSlotProps) {
  const { width, height } = sizeStyles[size];

  return (
    <Box
      role="region"
      aria-label="Advertisement"
      data-testid="ad-slot"
      data-size={size}
      data-slot-id={slotId}
      width={width}
      height={height}
      bg={showPlaceholder ? "var(--bg-surface)" : undefined}
      borderRadius="12px"
      overflow="hidden"
    >
      {showPlaceholder ? (
        <Center h="100%">
          <Text
            fontFamily="'Noto Sans JP', sans-serif"
            fontSize="14px"
            color="var(--text-muted)"
          >
            広告
          </Text>
        </Center>
      ) : (
        children
      )}
    </Box>
  );
}
