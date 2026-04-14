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
          日々の気づきを<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
            {SITE_CONFIG.name}
          </span>
        </h1>
        <p className="font-body text-xl leading-relaxed text-on-surface-variant max-w-2xl">
          ライター・松本翔が日常の観察と思索を綴るノート。
          仙台生まれ、50代。書くことで考え、考えることで書く。
        </p>
      </div>
    </section>
  );
}

function ProfileSection() {
  return (
    <section className="bg-surface-container-low py-24 mb-24">
      <div className="ml-[8%] mr-[12%] grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-square bg-surface-container-highest rounded-xl overflow-hidden shadow-2xl">
            <div className="w-full h-full bg-gradient-to-br from-surface-container to-surface-container-highest flex items-center justify-center">
              <span className="text-on-surface-variant text-6xl font-headline font-bold">
                翔
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary-container rounded-xl p-6 shadow-xl flex items-end">
            <p className="text-on-primary font-headline font-bold leading-tight">
              書くことは、考えること。
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-headline text-4xl font-bold mb-8 tracking-tight">
            書き手について
          </h2>
          <div className="space-y-6 font-body text-lg leading-relaxed text-on-surface-variant">
            <p>
              松本翔（まつもと しょう）。1974年生まれ、宮城県仙台市出身。
              フリーランスのライターとして、テクノロジー・ライフスタイル・思索の交差点にある
              テーマを扱ってきた。
            </p>
            <p>
              このブログ{" "}
              <span className="font-bold text-on-surface">{SITE_CONFIG.name}</span>{" "}
              は、日々の気づきや読書メモ、仕事の裏側で考えたことを
              気軽にまとめる場所として始めた。完成した原稿ではなく、
              思考の途中経過を残しておく「ノート」として。
            </p>
            <p>
              書くことで考えが整理され、整理された考えがまた新しい問いを生む。
              そのサイクルを読者と一緒に楽しめたらと思っている。
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
