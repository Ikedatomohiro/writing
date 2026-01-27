import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants/site";

export const metadata = {
  title: "プライバシーポリシー",
  description: `${SITE_CONFIG.name}のプライバシーポリシーについて`,
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

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>
        プライバシーポリシー
      </h1>

      <p style={{ marginBottom: "2rem", color: "var(--text-secondary, #666)" }}>
        「{SITE_CONFIG.name}」（以下、当サイト）は、ユーザーの個人情報の取扱いについて、
        以下のとおりプライバシーポリシーを定めます。
      </p>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>運営者情報</h2>
        <p>サイト名: {SITE_CONFIG.name}</p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>個人情報の取得について</h2>
        <p style={{ marginBottom: "1rem" }}>
          当サイトでは、以下の場合に個人情報を取得することがあります。
        </p>
        <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
          <li>お問い合わせフォームのご利用時（お名前、メールアドレス）</li>
          <li>コメント投稿時（お名前、メールアドレス）</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>個人情報の利用目的</h2>
        <p style={{ marginBottom: "1rem" }}>
          取得した個人情報は、以下の目的で利用いたします。
        </p>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li>お問い合わせへの返信</li>
          <li>サービスの改善・向上</li>
          <li>重要なお知らせの連絡</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>アクセス解析ツールについて</h2>
        <p style={{ marginBottom: "1rem" }}>
          当サイトでは、Googleによるアクセス解析ツール「Google Analytics」を使用しています。
          このGoogle Analyticsはデータの収集のためにCookieを使用しています。
          このデータは匿名で収集されており、個人を特定するものではありません。
        </p>
        <p>
          この機能はCookieを無効にすることで収集を拒否することができますので、
          お使いのブラウザの設定をご確認ください。詳しくは{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Googleプライバシーポリシー
          </a>
          をご覧ください。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>広告配信について</h2>
        <p style={{ marginBottom: "1rem" }}>
          当サイトでは、第三者配信の広告サービス「Google Adsense」を使用しています。
        </p>
        <p style={{ marginBottom: "1rem" }}>
          Google Adsenseでは、ユーザーの興味に応じたパーソナライズ広告を表示するために
          Cookieを使用することがあります。パーソナライズ広告は、過去のアクセス情報に基づいて
          ユーザーに最適化された広告を表示する仕組みです。
        </p>
        <p style={{ marginBottom: "1rem" }}>
          パーソナライズ広告を望まない場合は、
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            広告設定
          </a>
          からパーソナライズ広告を無効にすることができます。
        </p>
        <p>
          また、
          <a
            href="https://optout.aboutads.info/"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.aboutads.info
          </a>
          にアクセスすれば、第三者配信事業者がパーソナライズ広告の掲載で使用するCookieを
          無効にすることができます。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Amazonアソシエイトについて</h2>
        <p>
          当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>外部送信規律について（改正電気通信事業法）</h2>
        <p style={{ marginBottom: "1rem" }}>
          当サイトでは、2023年6月に施行された改正電気通信事業法に基づき、
          以下の外部サービスにユーザー情報を送信しています。
        </p>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li>Google Analytics（アクセス解析）</li>
          <li>Google AdSense（広告配信）</li>
          <li>Amazonアソシエイト（アフィリエイト）</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>個人情報の第三者提供について</h2>
        <p>
          当サイトは、法令に基づく場合を除き、
          ご本人の同意なく個人情報を第三者に提供することはありません。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>免責事項</h2>
        <p style={{ marginBottom: "1rem" }}>
          当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますので、
          ご了承ください。
        </p>
        <p>
          当サイトからリンクやバナーなどによって他のサイトに移動された場合、
          移動先サイトで提供される情報、サービス等について一切の責任を負いません。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>著作権について</h2>
        <p>
          当サイトに掲載されている文章、画像等の著作権は、当サイト運営者または
          コンテンツ提供者に帰属します。無断転載・複製を禁じます。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>お問い合わせ</h2>
        <p>
          プライバシーポリシーに関するお問い合わせは、
          <Link href="/contact">お問い合わせページ</Link>
          よりお願いいたします。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>プライバシーポリシーの変更について</h2>
        <p>
          当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、
          本ポリシーの内容を適宜見直しその改善に努めます。
          修正された最新のプライバシーポリシーは常に本ページにて開示されます。
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
        <p>制定日: 2026年1月28日</p>
        <p>最終改定日: 2026年1月28日</p>
      </div>
    </main>
  );
}
