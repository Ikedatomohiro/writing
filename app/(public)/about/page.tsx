import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: `このブログについて - ${SITE_CONFIG.name}`,
  description: `${SITE_CONFIG.name} について — 書き手のプロフィールとブログの方針。`,
};

function HeroSection() {
  return (
    <section className="ml-[8%] mr-[12%] mb-24">
      <div className="max-w-4xl">
        <span className="font-label text-xs tracking-widest uppercase text-primary font-bold mb-4 block">
          このブログについて
        </span>
        <h1 className="font-headline text-6xl md:text-7xl font-extrabold tracking-tighter text-on-surface leading-[0.9] mb-8">
          現役エンジニアの<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
            {SITE_CONFIG.name}
          </span>
        </h1>
        <p className="font-body text-xl leading-relaxed text-on-surface-variant max-w-2xl">
          36歳で異業種からエンジニアに転職した筆者が、
          Claude Code / MCP / AIエージェント時代の実践を等身大で書くノート。
        </p>
      </div>
    </section>
  );
}

function ProfileSection() {
  return (
    <section className="bg-surface-container-low py-24 mb-24">
      <div className="ml-[8%] mr-[12%] grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="relative">
          <div className="aspect-square bg-surface-container-highest rounded-xl overflow-hidden shadow-2xl">
            <div className="w-full h-full bg-gradient-to-br from-surface-container to-surface-container-highest flex items-center justify-center">
              <span className="text-on-surface-variant text-6xl font-headline font-bold">
                pao
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary-container rounded-xl p-6 shadow-xl flex items-end">
            <p className="text-on-primary font-headline font-bold leading-tight">
              まずClaude Codeにやらせてみよう。
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-headline text-4xl font-bold mb-8 tracking-tight">
            書き手について
          </h2>
          <div className="space-y-6 font-body text-lg leading-relaxed text-on-surface-variant">
            <p>
              <span className="font-bold text-on-surface">pao.cho</span>。
              40代の現役エンジニア。新卒で一部上場メーカーの
              技術営業部に入り、化学系の仕事を13年経験した後、
              36歳でプログラミング学習を開始。37歳で異業種からエンジニアに転職した。
            </p>
            <p>
              現在はSaaS企業で、生成AI活用推進・LLM・RAG基盤など、
              AIをプロダクトに組み込む仕事を担当している。
              Claude Code MAXプランを日常の開発OSにして、
              自分で書くより「まずAIにやらせる」働き方を実践中。
            </p>
            <p>
              ブログ <span className="font-bold text-on-surface">{SITE_CONFIG.name}</span> は、
              現場で試して効いたこと・失敗したこと・ツールの選別を、
              同じく現役で戦うエンジニア向けに記録する場所。
              投資で合計1,000万円を溶かした経験や、AI時代の生き残り戦略も、
              感情論ではなく手を動かして得た一次情報として書いていく。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="ml-[8%] mr-[12%] text-center mb-24">
      <div className="bg-gradient-to-br from-primary to-primary-container p-16 rounded-xl text-on-primary shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-headline text-4xl font-bold mb-6">
            読んでくれているあなたへ
          </h2>
          <p className="font-body text-lg mb-10 opacity-90 max-w-xl mx-auto">
            感想や質問があればお気軽にどうぞ。
            コラボレーションのご相談も歓迎しています。
          </p>
          <Link
            href="/contact"
            className="inline-block bg-surface-container-lowest text-primary font-headline font-extrabold px-10 py-4 rounded-full hover:scale-105 active:scale-95 transition-transform duration-200 shadow-xl"
          >
            お問い合わせ
          </Link>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-black/10 rounded-full blur-3xl" />
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="pt-32 pb-20 bg-surface font-body text-on-surface">
      <HeroSection />
      <ProfileSection />
      <CtaSection />
    </main>
  );
}
