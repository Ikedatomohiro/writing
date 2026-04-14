import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants/site";

export const metadata = {
  title: "利用規約",
  description: `${SITE_CONFIG.name}の利用規約について`,
  alternates: {
    canonical: "/terms",
  },
};

const sectionClass = "mb-8 p-6 bg-surface-container-low rounded-xl";
const headingClass = "text-lg font-bold text-slate-900 mb-3 pl-3 border-l-4 border-primary";

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-headline mb-6 text-on-surface">利用規約</h1>

      <p className="mb-8 text-on-surface-variant">
        「{SITE_CONFIG.name}
        」（以下、当サイト）をご利用いただくにあたり、以下の利用規約を定めます。
        当サイトを利用された場合、本規約に同意したものとみなします。
      </p>

      <section className={sectionClass}>
        <h2 className={headingClass}>適用範囲</h2>
        <p>
          本規約は、当サイトが提供するすべてのサービスおよびコンテンツに適用されます。
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>禁止事項</h2>
        <p className="mb-4">
          当サイトの利用にあたり、以下の行為を禁止します。
        </p>
        <ul className="list-disc pl-6 space-y-1 text-on-surface-variant">
          <li>法令または公序良俗に違反する行為</li>
          <li>当サイトの運営を妨害する行為</li>
          <li>他のユーザーまたは第三者の権利を侵害する行為</li>
          <li>不正アクセスまたはそれに類する行為</li>
          <li>当サイトのコンテンツを無断で転載・複製する行為</li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>免責事項</h2>
        <p className="mb-4">
          当サイトに掲載された情報の正確性、完全性、有用性について保証するものではありません。
          当サイトの利用により生じた損害について、一切の責任を負いかねます。
        </p>
        <p>
          当サイトからリンクやバナーなどによって他のサイトに移動された場合、
          移動先サイトで提供される情報やサービスについて一切の責任を負いません。
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>著作権</h2>
        <p>
          当サイトに掲載されている文章、画像、デザインその他のコンテンツに関する著作権は、
          当サイト運営者またはコンテンツ提供者に帰属します。
          これらを無断で使用、複製、転載することを禁じます。
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>リンクについて</h2>
        <p>
          当サイトへのリンクは、原則として自由に行っていただけます。
          ただし、違法なサイトや公序良俗に反するサイトからのリンクはお断りいたします。
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>プライバシーポリシー</h2>
        <p>
          個人情報の取扱いについては、
          <Link href="/privacy">プライバシーポリシー</Link>
          をご確認ください。
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>規約の変更</h2>
        <p>
          当サイトは、必要に応じて本規約を変更することがあります。
          変更後の利用規約は、当ページに掲載した時点で効力を生じるものとします。
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>お問い合わせ</h2>
        <p>
          利用規約に関するお問い合わせは、
          <Link href="/contact">お問い合わせページ</Link>
          よりお願いいたします。
        </p>
      </section>

      <div className="mt-8 p-4 text-right text-slate-500 text-sm">
        <p>制定日: 2026年4月1日</p>
        <p>最終改定日: 2026年4月1日</p>
      </div>
    </main>
  );
}
