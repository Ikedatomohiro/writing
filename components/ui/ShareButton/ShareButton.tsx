"use client";

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
  bgClass: string;
  textClass: string;
};

const platformConfig: Record<SharePlatform, PlatformConfig> = {
  twitter: {
    icon: <FaXTwitter size={18} />,
    label: "Xでシェア",
    bgClass: "bg-black",
    textClass: "text-white",
  },
  facebook: {
    icon: <FaFacebookF size={18} />,
    label: "Facebookでシェア",
    bgClass: "bg-[#1877F2]",
    textClass: "text-white",
  },
  hatena: {
    icon: <SiHatenabookmark size={18} />,
    label: "はてなブックマーク",
    bgClass: "bg-[#00A4DE]",
    textClass: "text-white",
  },
  line: {
    icon: <FaLine size={18} />,
    label: "LINEでシェア",
    bgClass: "bg-[#06C755]",
    textClass: "text-white",
  },
  copy: {
    icon: <FaLink size={18} />,
    label: "リンクをコピー",
    bgClass: "bg-surface-container-high",
    textClass: "text-on-surface-variant",
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

  return (
    <button
      aria-label={copied ? "コピーしました" : config.label}
      onClick={handleClick}
      className={`w-10 h-10 flex items-center justify-center rounded-full ${config.bgClass} ${config.textClass} hover:opacity-80 transition-all ${className || ""}`}
    >
      {config.icon}
    </button>
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
    <div
      role="group"
      aria-label="シェアボタン"
      className={`flex items-center gap-3 ${className || ""}`}
    >
      {showLabel && (
        <span className="text-sm font-medium text-on-surface-variant">
          Share:
        </span>
      )}
      {platforms.map((platform) => (
        <ShareButton
          key={platform}
          platform={platform}
          url={url}
          title={title}
        />
      ))}
    </div>
  );
}

ShareButtonGroup.displayName = "ShareButtonGroup";
