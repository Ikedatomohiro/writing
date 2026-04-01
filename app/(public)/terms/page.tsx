import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants/site";

export const metadata = {
  title: "利用規約",
  description: `${SITE_CONFIG.name}の利用規約について`,
};

const sectionStyle = {
  marginBottom: "2rem",
  padding: "1.5rem",
  backgroundColor: "var(--surface, #f9f9f9)",
  borderRadius: "8px",
};

const headingStyle = {
  fontSize: "1.25rem",
  fontWeight: "bold",
  marginBottom: "1rem",
  paddingBottom: "0.5rem",
  borderBottom: "2px solid var(--primary, #3182ce)",
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>利用規約</h1>

      <p style={{ marginBottom: "2rem", color: "var(--text-secondary, #666)" }}>
        「{SITE_CONFIG.name}
        」（以下、当サイト）をご利用いただくにあたり、以下の利用規約を定めます。
        当サイトを利用された場合、本規約に同意したものとみなします。
      </p>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>適用範囲</h2>
        <p>
          本規約は、当サイトが提供するすべてのサービスおよびコンテンツに適用されます。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>禁止事項</h2>
        <p style={{ marginBottom: "1rem" }}>
          当サイトの利用にあたり、以下の行為を禁止します。
        </p>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li>法令または公序良俗に違反する行為</li>
          <li>当サイトの運営を妨害する行為</li>
          <li>他のユーザーまたは第三者の権利を侵害する行為</li>
          <li>不正アクセスまたはそれに類する行為</li>
          <li>当サイトのコンテンツを無断で転載・複製する行為</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>知的財産権</h2>
        <p>
          当サイトに掲載されている文章、画像、デザインその他のコンテンツに関する知的財産権は、
          当サイト運営者またはコンテンツ提供者に帰属します。
          これらを無断で使用、複製、転載することを禁じます。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>免責事項</h2>
        <p style={{ marginBottom: "1rem" }}>
          当サイトに掲載された情報の正確性、完全性、有用性について保証するものではありません。
          当サイトの利用により生じた損害について、一切の責任を負いかねます。
        </p>
        <p>
          当サイトからリンクやバナーなどによって他のサイトに移動された場合、
          移動先サイトで提供される情報やサービスについて一切の責任を負いません。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>リンクについて</h2>
        <p>
          当サイトへのリンクは、原則として自由に行っていただけます。
          ただし、違法なサイトや公序良俗に反するサイトからのリンクはお断りいたします。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>準拠法・管轄裁判所</h2>
        <p>
          本規約の解釈は日本法に準拠するものとし、
          紛争が生じた場合は日本国の裁判所を専属的合意管轄裁判所とします。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>利用規約の変更</h2>
        <p>
          当サイトは、必要に応じて本規約を変更することがあります。
          変更後の利用規約は、当ページに掲載した時点で効力を生じるものとします。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>お問い合わせ</h2>
        <p style={{ marginBottom: "1rem" }}>
          利用規約に関するお問い合わせは、
          <Link href="/contact">お問い合わせページ</Link>
          よりお願いいたします。
        </p>
        <p>
          個人情報の取扱いについては、
          <Link href="/privacy">プライバシーポリシー</Link>
          をご確認ください。
        </p>
      </section>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          textAlign: "right",
          color: "var(--text-secondary, #666)",
          fontSize: "0.875rem",
        }}
      >
        <p>制定日: 2026年4月1日</p>
      </div>
    </main>
  );
}
