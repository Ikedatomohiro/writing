# 利用規約・プロフィールページ 実装計画

## 実装方針

どちらも Server Component の静的ページ。
- 利用規約: `app/(public)/privacy/page.tsx` をベースに構成
- プロフィール: `app/(public)/about/page.tsx` のレイアウトパターンを流用

新規コンポーネント・ライブラリは不要。既存パターンのみで完結する。

---

## ファイル構成

```
app/(public)/
  terms/
    page.tsx          ← 新規
    page.test.tsx     ← 新規
  profile/
    page.tsx          ← 新規
    page.test.tsx     ← 新規
```

---

## 利用規約ページ (`app/(public)/terms/page.tsx`)

### 参考ファイル
`app/(public)/privacy/page.tsx` — 構造・スタイルをそのまま踏襲

### コンテンツ構成

```tsx
sections = [
  { id: "scope",         title: "1. 適用範囲" },
  { id: "prohibited",    title: "2. 禁止事項" },
  { id: "disclaimer",    title: "3. 免責事項" },
  { id: "copyright",     title: "4. 著作権" },
  { id: "links",         title: "5. リンクについて" },
  { id: "privacy",       title: "6. プライバシーポリシー" },
  { id: "changes",       title: "7. 規約の変更" },
  { id: "contact",       title: "8. お問い合わせ" },
]
```

### スタイル
privacy/page.tsx と同じインラインスタイルオブジェクトを流用:
```tsx
const containerStyle = { maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }
const sectionStyle   = { marginBottom: "2rem" }
const headingStyle   = { /* ... */ }
```

---

## プロフィールページ (`app/(public)/profile/page.tsx`)

### 参考ファイル
`app/(public)/about/page.tsx` — セクション構成を参考に

### セクション構成

```tsx
// 1. HeroSection
<section className="py-24 px-6 text-center bg-surface-container-low">
  <h1>運営者プロフィール</h1>
  <p>キャッチコピー</p>
</section>

// 2. IntroSection（自己紹介）
<section className="py-16 px-6 max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
  <div>画像プレースホルダー</div>
  <div>自己紹介テキスト</div>
</section>

// 3. BackgroundSection（経歴）
<section className="py-16 px-6 max-w-3xl mx-auto">
  <h2>経歴・バックグラウンド</h2>
  <ul>箇条書き</ul>
</section>

// 4. BlogStorySection（ブログについて）
<section className="py-16 px-6 bg-surface-container-low">
  <p>ブログを始めた理由</p>
</section>

// 5. CTASection（お問い合わせ）
<section className="py-16 px-6 text-center bg-gradient-to-br from-primary to-primary-container">
  <Button href="/contact" variant="secondary">お問い合わせ</Button>
</section>
```

---

## テスト方針

`page.test.tsx` では以下のみテスト（静的ページのため最小限）:

```tsx
// terms/page.test.tsx
it("利用規約ページが正しくレンダリングされる", () => {
  render(<TermsPage />)
  expect(screen.getByRole("heading", { name: /利用規約/ })).toBeInTheDocument()
})
it("主要セクションが存在する", () => {
  // 禁止事項、免責事項、著作権 の見出しを確認
})

// profile/page.test.tsx
it("プロフィールページが正しくレンダリングされる", () => {
  render(<ProfilePage />)
  expect(screen.getByRole("heading", { name: /プロフィール/ })).toBeInTheDocument()
})
```

---

## 影響範囲

| ファイル | 変更種別 |
|---------|---------|
| `app/(public)/terms/page.tsx` | 新規 |
| `app/(public)/terms/page.test.tsx` | 新規 |
| `app/(public)/profile/page.tsx` | 新規 |
| `app/(public)/profile/page.test.tsx` | 新規 |
| フッターリンク変更 | なし（`/terms` は既存） |

---

## リスクと対策

| リスク | 対策 |
|-------|-----|
| 利用規約の法的内容が不正確 | 一般的なブログ向けテンプレートを使用。必要に応じてユーザーが修正 |
| プロフィール画像が未準備 | `next/image` プレースホルダー or `bg-surface-container` の背景で代替 |
