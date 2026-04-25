import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getAccountLabel } from "@/lib/constants/labels";

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

const ACCOUNTS = ["pao-pao-cho", "matsumoto_sho", "morita_rin"] as const;

type StatusCounts = { draft: number; queued: number };

async function fetchCounts(): Promise<{
  threadsByAccount: Record<string, StatusCounts>;
  xByAccount: Record<string, StatusCounts>;
}> {
  try {
    const supabase = createServerClient();

    const [{ data: snsRows }, { data: xRows }] = await Promise.all([
      supabase
        .from("sns_series")
        .select("status, account, is_posted")
        .in("status", ["draft", "queued"])
        .eq("is_posted", false),
      supabase
        .from("x_series")
        .select("status, account, is_posted")
        .in("status", ["draft", "queued"])
        .eq("is_posted", false),
    ]);

    // sns_series.account 列は 20260425000000 マイグレーションで追加済み。
    // 該当列を直接 GROUP BY せず、行を pull して JS でバケットする
    // （x_series と同じ方式で統一）。
    const threadsByAccount: Record<string, StatusCounts> = {};
    for (const account of ACCOUNTS) {
      threadsByAccount[account] = { draft: 0, queued: 0 };
    }
    for (const row of (snsRows ?? []) as Array<{ status: string; account: string }>) {
      if (!threadsByAccount[row.account]) {
        threadsByAccount[row.account] = { draft: 0, queued: 0 };
      }
      if (row.status === "draft") threadsByAccount[row.account].draft++;
      if (row.status === "queued") threadsByAccount[row.account].queued++;
    }

    const xByAccount: Record<string, StatusCounts> = {};
    for (const account of ACCOUNTS) {
      xByAccount[account] = { draft: 0, queued: 0 };
    }
    for (const row of (xRows ?? []) as Array<{ status: string; account: string }>) {
      if (!xByAccount[row.account]) {
        xByAccount[row.account] = { draft: 0, queued: 0 };
      }
      if (row.status === "draft") xByAccount[row.account].draft++;
      if (row.status === "queued") xByAccount[row.account].queued++;
    }

    return { threadsByAccount, xByAccount };
  } catch {
    return {
      threadsByAccount: Object.fromEntries(
        ACCOUNTS.map((a) => [a, { draft: 0, queued: 0 }])
      ),
      xByAccount: Object.fromEntries(
        ACCOUNTS.map((a) => [a, { draft: 0, queued: 0 }])
      ),
    };
  }
}

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const { threadsByAccount, xByAccount } = await fetchCounts();

  return (
    <div>
      <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">
        ダッシュボード
      </h2>
      <p className="text-slate-600 text-sm mb-8">
        管理するプラットフォームを選択してください。
      </p>

      <section className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          未投稿の件数
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(threadsByAccount).map(([account, counts]) => (
            <StatusBlock
              key={`threads-${account}`}
              title="Threads"
              subtitle={getAccountLabel(account)}
              href={`/threads?account=${encodeURIComponent(account)}`}
              icon="forum"
              accentColor="bg-purple-500"
              counts={counts}
            />
          ))}
          {Object.entries(xByAccount).map(([account, counts]) => (
            <StatusBlock
              key={`x-${account}`}
              title="X"
              subtitle={getAccountLabel(account)}
              href={`/x?account=${encodeURIComponent(account)}`}
              icon="alternate_email"
              accentColor="bg-slate-700"
              counts={counts}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          プラットフォーム
        </h3>
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
      </section>
    </div>
  );
}

function StatusBlock({
  title,
  subtitle,
  href,
  icon,
  accentColor,
  counts,
}: {
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  accentColor: string;
  counts: StatusCounts;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${accentColor} text-white shrink-0`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500 truncate">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <CountCell label="下書き" value={counts.draft} />
        <CountCell label="予約中" value={counts.queued} />
      </div>
    </Link>
  );
}

function CountCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <span className="text-2xl font-bold text-slate-900 leading-none tabular-nums">
        {value}
      </span>
    </div>
  );
}
