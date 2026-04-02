import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants/site";

export const metadata = {
  title: "プロフィール",
  description: `${SITE_CONFIG.name}の運営者プロフィール`,
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
        「{SITE_CONFIG.name}」の運営者についてご紹介します。
      </p>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>自己紹介</h2>
        <p>
          40代のエンジニア。
          過去に投資で大きな失敗を経験したことをきっかけに、
          お金・技術・健康について真剣に向き合うようになりました。
          失敗から学んだことを等身大で発信しています。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>ブログについて</h2>
        <p>
          このブログでは、プログラミング・資産形成・健康を中心に、
          実体験をもとにした情報を発信しています。
          ご質問やご要望がありましたら、
          <Link href="/contact">お問い合わせ</Link>
          よりご連絡ください。
        </p>
      </section>


    </main>
  );
}
