import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー",
  description: "当サイトのプライバシーポリシーについて",
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>プライバシーポリシー</h1>

      <section>
        <h2>個人情報の取得について</h2>
        <p>
          お問い合わせフォームでは、お名前とメールアドレスをご入力いただいております。
          これらの情報は、お問い合わせへの返信のためにのみ使用いたします。
        </p>
      </section>

      <section>
        <h2>アクセス解析ツールについて</h2>
        <p>
          当サイトでは、Googleによるアクセス解析ツール「Google
          Analytics」を使用しています。
          このGoogle
          Analyticsはデータの収集のためにCookieを使用しています。
          このデータは匿名で収集されており、個人を特定するものではありません。
        </p>
        <p>
          この機能はCookieを無効にすることで収集を拒否することができますので、
          お使いのブラウザの設定をご確認ください。 詳しくは
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

      <section>
        <h2>広告配信について</h2>
        <p>
          当サイトでは、第三者配信の広告サービス「Google
          Adsense」を使用しています。
          広告配信事業者は、ユーザーの興味に応じた広告を表示するために
          Cookieを使用することがあります。
        </p>
        <p>
          Cookieを無効にする設定およびGoogleアドセンスに関する詳細は、
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            広告設定
          </a>
          をご覧ください。
        </p>
      </section>

      <section>
        <h2>Amazonアソシエイトについて</h2>
        <p>
          当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
        </p>
      </section>

      <section>
        <h2>個人情報の第三者提供について</h2>
        <p>
          当サイトは、法令に基づく場合を除き、
          ご本人の同意なく個人情報を第三者に提供することはありません。
        </p>
      </section>

      <section>
        <h2>お問い合わせ</h2>
        <p>
          プライバシーポリシーに関するお問い合わせは、
          <Link href="/contact">お問い合わせページ</Link>
          よりお願いいたします。
        </p>
      </section>

      <section>
        <h2>プライバシーポリシーの変更について</h2>
        <p>
          当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、
          本ポリシーの内容を適宜見直しその改善に努めます。
          修正された最新のプライバシーポリシーは常に本ページにて開示されます。
        </p>
      </section>
    </main>
  );
}
