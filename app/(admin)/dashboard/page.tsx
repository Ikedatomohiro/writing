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

const X_ACCOUNTS = ["pao-pao-cho", "matsumoto_sho"] as const;

type StatusCounts = { draft: number; queued: number };

async function fetchCounts(): Promise<{
  threads: StatusCounts;
  xByAccount: Record<string, StatusCounts>;
}> {
  try {
    const supabase = createServerClient();

    const [{ data: snsRows }, { data: xRows }] = await Promise.all([
      supabase
        .from("sns_series")
        .select("status, is_posted")
        .in("status", ["draft", "queued"])
        .eq("is_posted", false),
      supabase
        .from("x_series")
        .select("status, account, is_posted")
        .in("status", ["draft", "queued"])
        .eq("is_posted", false),
    ]);

    const threads: StatusCounts = { draft: 0, queued: 0 };
    for (const row of (snsRows ?? []) as Array<{ status: string }>) {
      if (row.status === "draft") threads.draft++;
      if (row.status === "queued") threads.queued++;
    }

    const xByAccount: Record<string, StatusCounts> = {};
    for (const account of X_ACCOUNTS) {
      xByAccount[account] = { draft: 0, queued: 0 };
    }
    for (const row of (xRows ?? []) as Array<{ status: string; account: string }>) {
      if (!xByAccount[row.account]) {
        xByAccount[row.account] = { draft: 0, queued: 0 };
      }
      if (row.status === "draft") xByAccount[row.account].draft++;
      if (row.status === "queued") xByAccount[row.account].queued++;
    }

    return { threads, xByAccount };
  } catch {
    return {
      threads: { draft: 0, queued: 0 },
      xByAccount: Object.fromEntries(
        X_ACCOUNTS.map((a) => [a, { draft: 0, queued: 0 }])
      ),
    };
  }
}

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const { threads, xByAccount } = await fetchCounts();

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
        <div className="space-y-3">
          <StatusRow
            title="Threads"
            subtitle="パオパオ長"
            href="/threads"
            icon="forum"
            accentColor="bg-purple-500"
            counts={threads}
          />
          {Object.entries(xByAccount).map(([account, counts]) => (
            <StatusRow
              key={account}
              title="X"
              subtitle={getAccountLabel(account)}
              href="/x"
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

function StatusRow({
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
      className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${accentColor} text-white shrink-0`}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <CountCell label="下書き" value={counts.draft} />
        <CountCell label="予約中" value={counts.queued} />
      </div>
    </Link>
  );
}

function CountCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-right">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 leading-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}
