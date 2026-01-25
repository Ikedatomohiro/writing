"use client";

import { Box, Text } from "@chakra-ui/react";

export type AdVariant = "leaderboard" | "rectangle" | "skyscraper" | "infeed" | "in-article";

export interface AdProps {
  variant: AdVariant;
  slotId?: string;
  showLabel?: boolean;
  className?: string;
}

type VariantConfig = {
  width: number | "fluid";
  height: number | "auto";
};

const variantConfig: Record<AdVariant, VariantConfig> = {
  leaderboard: { width: 728, height: 90 },
  rectangle: { width: 300, height: 250 },
  skyscraper: { width: 300, height: 600 },
  infeed: { width: "fluid", height: "auto" },
  "in-article": { width: "fluid", height: "auto" },
};

export const getIsProduction = () => process.env.NODE_ENV === "production";

interface AdPlaceholderProps {
  variant: AdVariant;
  config: VariantConfig;
  minHeight?: string;
}

export function AdPlaceholder({ variant, config, minHeight }: AdPlaceholderProps) {
  const isFluid = config.width === "fluid";
  const label = isFluid
    ? `広告 (${variant})`
    : `広告 ${config.width}×${config.height}`;

  return (
    <Box
      data-testid="ad-placeholder"
      display="flex"
      alignItems="center"
      justifyContent="center"
      w="100%"
      h="100%"
      minH={minHeight}
      bg="var(--surface)"
      border="2px dashed"
      borderColor="var(--border)"
      borderRadius="md"
    >
      <Text color="var(--text-tertiary)" fontSize="sm">
        {label}
      </Text>
    </Box>
  );
}

interface AdsenseSlotProps {
  slotId: string;
  isFluid: boolean;
}

export function AdsenseSlot({ slotId, isFluid }: AdsenseSlotProps) {
  return (
    <ins
      data-testid="adsense-slot"
      className="adsbygoogle"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
      }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={slotId}
      data-ad-format={isFluid ? "fluid" : "auto"}
      data-full-width-responsive="true"
    />
  );
}

AdsenseSlot.displayName = "AdsenseSlot";
AdPlaceholder.displayName = "AdPlaceholder";

export function Ad({
  variant,
  slotId,
  showLabel = true,
  className,
}: AdProps) {
  const config = variantConfig[variant];
  const isFluid = config.width === "fluid";
  const width = isFluid ? "100%" : `${config.width}px`;
  const height = config.height === "auto" ? "auto" : `${config.height}px`;
  const minHeight = isFluid ? "90px" : undefined;

  const isProduction = getIsProduction();
  const shouldRenderAdsense = isProduction && slotId;

  return (
    <Box
      as="aside"
      data-testid="ad-container"
      data-variant={variant}
      data-width={isFluid ? "fluid" : config.width}
      data-height={config.height === "auto" ? "auto" : config.height}
      aria-label="広告"
      className={className}
      maxW="100%"
      w={width}
      h={height}
      minH={minHeight}
      bg="var(--surface)"
      borderRadius="md"
      overflow="hidden"
      position="relative"
    >
      {showLabel && (
        <Text
          fontSize="xs"
          color="var(--text-tertiary)"
          position="absolute"
          top={1}
          left={2}
          zIndex={1}
        >
          広告
        </Text>
      )}

      {shouldRenderAdsense ? (
        <AdsenseSlot slotId={slotId} isFluid={isFluid} />
      ) : (
        <AdPlaceholder variant={variant} config={config} minHeight={minHeight} />
      )}
    </Box>
  );
}

Ad.displayName = "Ad";
