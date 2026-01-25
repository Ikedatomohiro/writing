"use client";

import { Text, IconButton, HStack } from "@chakra-ui/react";
import { FaXTwitter, FaFacebookF, FaLine, FaLink } from "react-icons/fa6";
import { SiHatenabookmark } from "react-icons/si";
import { useState, useCallback } from "react";

export type SharePlatform = "twitter" | "facebook" | "hatena" | "line" | "copy";

export interface ShareButtonProps {
  platform: SharePlatform;
  url: string;
  title: string;
  className?: string;
}

export interface ShareButtonGroupProps {
  url: string;
  title: string;
  platforms?: SharePlatform[];
  showLabel?: boolean;
  className?: string;
}

type PlatformConfig = {
  icon: React.ReactNode;
  label: string;
  bg: string;
  color: string;
  hoverBg?: string;
};

const platformConfig: Record<SharePlatform, PlatformConfig> = {
  twitter: {
    icon: <FaXTwitter size={18} />,
    label: "Xでシェア",
    bg: "#000000",
    color: "#FFFFFF",
  },
  facebook: {
    icon: <FaFacebookF size={18} />,
    label: "Facebookでシェア",
    bg: "#1877F2",
    color: "#FFFFFF",
  },
  hatena: {
    icon: <SiHatenabookmark size={18} />,
    label: "はてなブックマーク",
    bg: "#00A4DE",
    color: "#FFFFFF",
  },
  line: {
    icon: <FaLine size={18} />,
    label: "LINEでシェア",
    bg: "#06C755",
    color: "#FFFFFF",
  },
  copy: {
    icon: <FaLink size={18} />,
    label: "リンクをコピー",
    bg: "var(--surface)",
    color: "var(--text-secondary)",
    hoverBg: "var(--surface-hover)",
  },
};

function getShareUrl(platform: SharePlatform, url: string, title: string): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  switch (platform) {
    case "twitter":
      return `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "hatena":
      return `https://b.hatena.ne.jp/add?mode=confirm&url=${encodedUrl}&title=${encodedTitle}`;
    case "line":
      return `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
    default:
      return "";
  }
}

export function ShareButton({ platform, url, title, className }: ShareButtonProps) {
  const config = platformConfig[platform];
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    if (platform === "copy") {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // クリップボードへのアクセスが拒否された場合は何もしない
      });
      return;
    }

    const shareUrl = getShareUrl(platform, url, title);
    window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer");
  }, [platform, url, title]);

  const isCopyButton = platform === "copy";
  const borderStyle = isCopyButton
    ? { border: "1px solid", borderColor: "var(--border)" }
    : {};

  return (
    <IconButton
      aria-label={copied ? "コピーしました" : config.label}
      onClick={handleClick}
      bg={config.bg}
      color={config.color}
      borderRadius="md"
      w={10}
      h={10}
      minW={10}
      _hover={{
        opacity: 0.8,
        bg: config.hoverBg || config.bg,
      }}
      className={className}
      {...borderStyle}
    >
      {config.icon}
    </IconButton>
  );
}

ShareButton.displayName = "ShareButton";

const DEFAULT_PLATFORMS: SharePlatform[] = [
  "twitter",
  "facebook",
  "hatena",
  "line",
  "copy",
];

export function ShareButtonGroup({
  url,
  title,
  platforms = DEFAULT_PLATFORMS,
  showLabel = false,
  className,
}: ShareButtonGroupProps) {
  return (
    <HStack
      aria-label="シェアボタン"
      gap={4}
      align="center"
      className={className}
    >
      {showLabel && (
        <Text
          fontSize="sm"
          fontWeight="500"
          color="var(--text-secondary)"
        >
          Share:
        </Text>
      )}
      {platforms.map((platform) => (
        <ShareButton
          key={platform}
          platform={platform}
          url={url}
          title={title}
        />
      ))}
    </HStack>
  );
}

ShareButtonGroup.displayName = "ShareButtonGroup";
