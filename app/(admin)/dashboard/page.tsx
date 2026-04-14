import Link from "next/link";
import { headers } from "next/headers";

interface PlatformCard {
  label: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

const PLATFORM_CARDS: PlatformCard[] = [
  {
    label: "Blog",
    description: "記事の管理・執筆・公開",
    href: "/articles",
    icon: "article",
    color: "bg-blue-500",
  },
  {
    label: "Threads",
    description: "Threads投稿の管理・キュー",
    href: "/threads",
    icon: "forum",
    color: "bg-purple-500",
  },
  {
    label: "X",
    description: "X（Twitter）投稿の管理・キュー",
    href: "/x",
    icon: "alternate_email",
    color: "bg-slate-700",
  },
];

interface KpiCount {
  label: string;
  value: number;
  href: string;
  icon: string;
}

async function fetchCount(url: string): Promise<number> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return 0;
    const json = await res.json();
    return Array.isArray(json.data) ? json.data.length : 0;
  } catch {
    return 0;
  }
}

export default async function AdminHomePage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const base = `${protocol}://${host}`;

  const [threadsDraft, threadsQueued, xDraft, xQueued] = await Promise.all([
    fetchCount(`${base}/api/threads/series?status=draft`),
    fetchCount(`${base}/api/threads/series?status=queued`),
    fetchCount(`${base}/api/x/series?status=draft`),
    fetchCount(`${base}/api/x/series?status=queued`),
  ]);

  const kpiItems: KpiCount[] = [
    { label: "Threads 下書き", value: threadsDraft, href: "/threads", icon: "forum" },
    { label: "Threads 予約中", value: threadsQueued, href: "/threads", icon: "schedule" },
    { label: "X 下書き", value: xDraft, href: "/x", icon: "alternate_email" },
    { label: "X 予約中", value: xQueued, href: "/x", icon: "schedule_send" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">
        ダッシュボード
      </h2>
      <p className="text-slate-500 text-sm mb-8">
        管理するプラットフォームを選択してください。
      </p>

      {/* KPI Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {kpiItems.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-slate-400 text-lg">{kpi.icon}</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLATFORM_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${card.color} text-white mb-4 group-hover:scale-105 transition-transform`}
            >
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{card.label}</h3>
            <p className="text-sm text-slate-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
