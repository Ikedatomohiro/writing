"use client";

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

export const getAdsEnabled = () => process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

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
    <div
      data-testid="ad-placeholder"
      className="flex items-center justify-center w-full h-full bg-surface-container border-2 border-dashed border-outline-variant rounded-lg"
      style={{ minHeight }}
    >
      <span className="text-outline text-sm">{label}</span>
    </div>
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
  const adsEnabled = getAdsEnabled();
  if (!adsEnabled) return null;

  const config = variantConfig[variant];
  const isFluid = config.width === "fluid";
  const width = isFluid ? "100%" : `${config.width}px`;
  const height = config.height === "auto" ? "auto" : `${config.height}px`;
  const minHeight = isFluid ? "90px" : undefined;

  const isProduction = getIsProduction();
  const shouldRenderAdsense = isProduction && slotId;

  return (
    <aside
      data-testid="ad-container"
      data-variant={variant}
      data-width={isFluid ? "fluid" : config.width}
      data-height={config.height === "auto" ? "auto" : config.height}
      aria-label="広告"
      className={`max-w-full bg-surface-container rounded-lg overflow-hidden relative ${className ?? ""}`}
      style={{ width, height, minHeight }}
    >
      {showLabel && (
        <span className="text-xs text-outline absolute top-1 left-2 z-10">
          広告
        </span>
      )}

      {shouldRenderAdsense ? (
        <AdsenseSlot slotId={slotId} isFluid={isFluid} />
      ) : (
        <AdPlaceholder variant={variant} config={config} minHeight={minHeight} />
      )}
    </aside>
  );
}

Ad.displayName = "Ad";
