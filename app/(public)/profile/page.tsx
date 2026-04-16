import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants/site";

export const metadata = {
  title: "プロフィール",
  description: `${SITE_CONFIG.name}の運営者プロフィール — 36歳未経験からエンジニア転職、現役SaaS、AI活用を担当`,
  alternates: {
    canonical: "/profile",
  },
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

export default function ProfilePage() {
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>プロフィール</h1>

      <p style={{ marginBottom: "2rem", color: "var(--text-secondary, #666)" }}>
        「{SITE_CONFIG.name}」を書いている pao.cho の自己紹介です。
      </p>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>経歴</h2>
        <ul style={{ lineHeight: 1.8, paddingLeft: "1.5rem" }}>
          <li>2006年、一部上場メーカーに新卒入社。技術営業部で化学系の仕事を13年</li>
          <li>2018年、36歳でプログラミング学習を開始。Udemyで挫折→プログラミングスクールでRuby on Rails習得</li>
          <li>2019年、37歳で異業種からエンジニア転職。年収700万→400万に下がるも一度も後悔なし</li>
          <li>現在は三井物産スピンアウトのSaaS企業で、生成AI活用推進・OCR×LLM・RAG基盤などを担当</li>
          <li>フルリモート勤務、副業でプログラミング講師・メンター</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>投資で合計950万円を溶かした話</h2>
        <p style={{ lineHeight: 1.8 }}>
          2007年、50万円の情報商材を買ってスイングトレードで200万円を失いました。
          その後ソーシャルレンディング（トラストレンディング）に900万円を投資し、
          750万円が戻ってきませんでした。合計950万円の損失を経て、
          現在は新NISAでS&P500一本に絞ったインデックス投資に落ち着いています。
          投資の失敗から学んだことは、記事では裏側として書くことがあります。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>このブログについて</h2>
        <p style={{ lineHeight: 1.8 }}>
          {SITE_CONFIG.name} は、現役エンジニアとして Claude Code / MCP / AIエージェント /
          Agent SDK などを業務で使って得た実践的な知見を、
          同じく現場で戦うエンジニア向けに記録する場所です。
          机上の論ではなく、手を動かして効いたこと・効かなかったことを書いていきます。
          ご質問やご要望は
          <Link href="/contact">お問い合わせ</Link>
          からどうぞ。
        </p>
      </section>
    </main>
  );
}
