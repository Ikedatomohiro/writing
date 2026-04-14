import Link from "next/link";

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
    color: "from-blue-500 to-blue-600",
  },
  {
    label: "Threads",
    description: "Threads投稿の管理・キュー",
    href: "/sns",
    icon: "forum",
    color: "from-purple-500 to-purple-600",
  },
  {
    label: "X",
    description: "X（Twitter）投稿の管理・キュー",
    href: "/x",
    icon: "alternate_email",
    color: "from-slate-700 to-slate-900",
  },
];

export default function AdminHomePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">
        Dashboard
      </h2>
      <p className="text-slate-500 text-sm mb-8">
        管理するプラットフォームを選択してください。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLATFORM_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} text-white mb-4 group-hover:scale-105 transition-transform`}
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
