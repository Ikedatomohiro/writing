import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function DashboardIcon(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

export function ArticleIcon(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </svg>
  );
}

export function ThreadsIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 192 192" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M141.537 88.9883c-.6168-.2956-1.2432-.5797-1.8786-.8531-1.1063-20.379-12.2411-32.0459-30.9299-32.1652-.0847-.0005-.1691-.0005-.2541-.0005-11.1775 0-20.478 4.7713-26.2025 13.4583l10.2785 7.0528c4.2763-6.4886 10.9849-7.8684 15.9286-7.8684.0571 0 .1142 0 .1712.0005 6.1561.0395 10.8012 1.8284 13.8072 5.3161 2.1869 2.5385 3.6482 6.0489 4.3712 10.4784-5.4433-.925-11.3289-1.2089-17.6233-.8466-17.7316 1.0213-29.135 11.3628-28.3683 25.7325.3889 7.2888 4.021 13.5626 10.2258 17.6641 5.2475 3.4675 12.0057 5.1682 19.0313 4.7841 9.2766-.5088 16.554-4.0466 21.633-10.5133 3.8567-4.9114 6.2953-11.2725 7.3725-19.2854 4.4257 2.6709 7.705 6.1856 9.5156 10.4124 3.0774 7.1843 3.2565 18.9935-6.3225 28.5706-8.392 8.3826-18.4774 12.0085-33.7114 12.1207-16.9027-.1254-29.6831-5.5452-37.9807-16.1062-7.77-9.891-11.7849-24.1775-11.932-42.4515.147-18.2737 4.162-32.5605 11.932-42.4515C74.2127 16.3906 86.9911 10.9714 103.894 10.8459c17.0266.1266 30.0293 5.5726 38.6565 16.183 4.2308 5.2029 7.418 11.7449 9.5208 19.3638l11.902-3.2674c-2.9-9.5308-6.9016-17.4437-12.0076-23.7281C135.989 7.3038 119.77.202 103.953.001L96.013 0c-.0017 0-.0041 0-.0065 0-15.8169.201-32.0288 7.3129-43.3554 20.6078-11.7283 13.7705-17.6233 31.4805-17.7833 52.4482C35.097 87.0083 41.025 104.718 52.7528 118.492c11.327 13.2955 27.5389 20.4069 43.3554 20.6079l.0065.0005v-.0024l2.1669-.0005c11.9794-.1675 22.0812-2.4213 30.2977-6.7488 10.7893-5.6803 19.7082-14.7921 24.2297-23.6884 4.5214-8.8963 6.4842-19.0345 4.5929-28.9144-2.0373-10.7204-9.4815-19.1577-21.8481-25.5585ZM98.4405 117.512c-4.0957.2301-8.342-.5973-11.4013-2.6221-2.9225-1.9343-4.6425-4.7945-4.8236-8.0539-.304-5.8196 4.8408-12.3126 17.3325-13.0324.6168-.0351 1.2209-.0522 1.8138-.0522 5.018 0 9.7197 1.0147 14.0247 2.9581-.9145 13.6595-7.1963 20.2064-17.9461 20.8025Z" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 1200 1227" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M714.163 519.284L1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894L144.011 79.694h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" />
    </svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
