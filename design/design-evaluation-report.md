# デザイン評価レポート

## 総合スコア: 7.2/10

### 観点別スコア

| 観点 | スコア | コメント |
|------|--------|---------|
| 可読性 | 6.5/10 | line-height 1.8は良いが、コンテンツ幅制限なし・フォントサイズ16px・見出し余白不足が課題 |
| タイポグラフィ | 8/10 | フォント選定・スケール・ウェイト分けが体系的。letter-spacing未指定が惜しい |
| カラー&コントラスト | 7.5/10 | MD3ベースで体系的。テーマ切替も良い。colors.tsとの二重管理が課題 |
| レイアウト&ホワイトスペース | 7/10 | グリッドシステムは適切。記事本文の幅制限なし、見出し前余白不足が課題 |
| ビジュアルデザイン&洗練度 | 7/10 | カード・ヒーローは現代的。角丸の不統一、opacity頼りのホバーが課題 |
| レスポンシブ&アクセシビリティ | 7.5/10 | モバイルメニューのa11yは優秀。フッターのタッチターゲット、フォーカスリングが課題 |

---

## 良い点

- **Material Design 3カラーシステムの採用**: CSS変数ベースでカテゴリ別テーマを切り替え可能。体系的かつ拡張性が高い
- **日本語を考慮した行間設定**: 本文の `line-height: 1.8` は日本語ブログとして適切
- **フォント戦略が明確**: 見出し(Manrope)、本文(Inter)、コード(Fira Code)、日本語フォールバック(Noto Sans JP) と役割分離が明確
- **タイポグラフィスケールの一貫性**: H1(32px) > H2(24px) > H3(20px) > H4(18px) > Body(16px) と黄金比に近いスケール
- **記事本文のスタイリングが丁寧**: `.article-body` で見出し・段落・リスト・引用・コード・テーブル・画像すべてにスタイルが定義
- **アクセシビリティへの配慮**: モバイルメニューにフォーカストラップ、ESCキー対応、aria属性が実装されている
- **テキスト選択のカスタムスタイル**: `::selection` でブランドカラーベースの選択色を定義

---

## 改善リスト

### 🔴 重要度: 高（可読性に直接影響）

#### 1. 本文フォントサイズが日本語ブログとして小さい

- **問題**: `font-size: 1rem`(16px) は英語では標準だが、日本語は漢字の画数が多く16pxでは可読性が低下する
- **現状**: `font-size: 1rem;`
- **改善案**: 本文を `font-size: 1.0625rem;`(17px) または `font-size: 1.125rem;`(18px) に変更
- **対象ファイル**: `app/globals.css:265`

#### 2. 記事本文のコンテンツ幅制限がない

- **問題**: `.article-body` に `max-width` が未設定。`max-w-7xl`(1280px) の 8/12 = 約853px で、日本語推奨の640-720pxを大幅に超える。1行50-60文字以上になり、視線の往復が疲れる
- **現状**: `<article className="lg:col-span-8">` でグリッド依存
- **改善案**: `.article-body` に `max-width: 720px;` を追加
- **対象ファイル**: `app/globals.css:263-268` または `components/blog/ArticleBody/ArticleBody.tsx:20`

#### 3. 見出し前の余白（margin-top）が不十分

- **問題**: h2の `margin-top: 2.5rem`(40px) ではセクションの区切り感が弱い。本文が24pxのマージンで流れている中、40pxでは差が小さい
- **現状**: `margin-top: 2.5rem;`
- **改善案**: h2 → `margin-top: 3.5rem;`(56px)、h3 → `margin-top: 2.5rem;`(40px)、h4 → `margin-top: 2rem;`(32px)
- **対象ファイル**: `app/globals.css:276,287,296`

#### 4. 段落間マージンがやや不足

- **問題**: `margin-bottom: 1.5rem`(24px) は基準値を満たすが、`line-height: 1.8` だと行高約28.8pxとなり、段落間と行間の差が小さく段落の区切りが弱い
- **現状**: `margin-bottom: 1.5rem;`
- **改善案**: `margin-bottom: 1.75rem;` または `margin-bottom: 2rem;` に変更
- **対象ファイル**: `app/globals.css:302`

#### 5. colors.ts とCSS変数の二重管理で不整合リスク

- **問題**: `colors.ts` ではStone系の色(`#1C1917`, `#FAFAF9`)を定義、`globals.css` ではMD3トークン(`#191c21`, `#f9f9ff`)を使用。微妙に異なる色で不整合リスク
- **現状**: `colors.ts` の `textPrimary: "#1C1917"` vs `globals.css` の `--md3-on-surface: #191c21`
- **改善案**: `colors.ts` を廃止するか、MD3トークンを参照するようにリファクタリング。カラー定義は一箇所に集約
- **対象ファイル**: `lib/theme/colors.ts` 全体

---

### 🟡 重要度: 中（洗練度の向上）

#### 6. 角丸の不統一

- **問題**: `tailwind.config.ts` の `xl: "1.5rem"`(24px) と `design-system.md` の `--radius-xl: 16px` が乖離。`rounded-xl` 使用時に想定と異なるサイズになる
- **現状**: BlogArticleCard → `rounded-xl`、Button → `rounded-full`、blockquote → `0.5rem`、コードブロック → `0.5rem`
- **改善案**: `tailwind.config.ts` の `borderRadius` をデザインシステムに合わせる: `sm: "4px"`, `md: "8px"`, `lg: "12px"`, `xl: "16px"`
- **対象ファイル**: `tailwind.config.ts:56-61`

#### 7. letter-spacingの欠如

- **問題**: 日本語本文に `letter-spacing` が未指定。日本語テキストは `0.02em` ～ `0.05em` を加えると可読性が向上する
- **現状**: `.article-body` に `letter-spacing` の指定なし
- **改善案**: `.article-body` に `letter-spacing: 0.03em;` を追加
- **対象ファイル**: `app/globals.css:263-268`

#### 8. ホバーエフェクトが opacity ベースで単調

- **問題**: Button の全バリアントのホバーが `hover:opacity-90` / `hover:opacity-80` で画一的。手抜き感があり洗練されたUIと言えない
- **現状**: `primary: "hover:opacity-90"`, `secondary: "hover:opacity-80"`, `ghost: "hover:opacity-80"`
- **改善案**: primary → `hover:brightness-110`、secondary → `hover:bg-surface-container-highest`、ghost → `hover:bg-primary/5` など、バリアントごとに適切なホバーを使い分ける
- **対象ファイル**: `components/ui/Button/Button.tsx:16-23`

#### 9. Buttonのフォーカスリングが薄い

- **問題**: `focus:ring-2 focus:ring-primary/50` と `focus:outline-none` の組み合わせで、キーボードナビゲーション時にフォーカスが見づらい
- **現状**: `focus:outline-none focus:ring-2 focus:ring-primary/50`
- **改善案**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` に変更
- **対象ファイル**: `components/ui/Button/Button.tsx:52`

#### 10. Techテーマのグラデーションテキストの可読性

- **問題**: ダークモードで `--md3-primary: #a9c7ff` → `--md3-primary-fixed: #d5e3ff` のグラデーションは色差が小さく、コントラストが低下する
- **改善案**: グラデーションの色域を広げるか、タイトルにはソリッドカラーを使用
- **対象ファイル**: `app/(public)/[category]/page.tsx:156`

#### 11. ヘッダーの「Subscribe」ボタンの遷移先が不適切

- **問題**: Subscribeボタンが `/search` ページにリンクしており、UXとして矛盾
- **改善案**: `/newsletter` への遷移に変更するか、モーダルで登録フォームを表示
- **対象ファイル**: `components/layout/BlogHeader/BlogHeader.tsx:68`

#### 12. 未使用CSSクラスの存在

- **問題**: `.editorial-asymmetry`（左8%、右12%マージン）が定義されているが、使用箇所が見当たらない
- **改善案**: 使用箇所がなければ削除
- **対象ファイル**: `app/globals.css:230-233`

---

### 🟢 重要度: 低（さらなる改善）

#### 13. bg-background クラスが未定義の可能性

- **問題**: `bg-background` が使われているが、Tailwindテーマに `background` カラートークンが明示的に定義されていない
- **改善案**: `bg-surface` に変更するか、`--color-background` をテーマに追加
- **対象ファイル**: `app/(public)/layout.tsx:7`

#### 14. フッターリンクのサイズが小さすぎる

- **問題**: フッターリンクが `text-xs`(12px) で、モバイルでのタッチターゲット(推奨44x44px)を確保できていない
- **改善案**: モバイルでは `text-sm` にサイズアップし、`py-2` のパディングを追加
- **対象ファイル**: `components/layout/Footer.tsx:39-48`

#### 15. デザインシステムドキュメントと実装のフォント乖離

- **問題**: `design-system.md` では `Noto Sans JP`(見出し・本文)、`JetBrains Mono`(コード) と定義しているが、実装は Manrope(見出し)、Inter(本文)、Fira Code(コード) と異なる
- **改善案**: ドキュメントを実装に合わせて更新
- **対象ファイル**: `design/design-system.md:32-36`

#### 16. globals.css の CSS変数二重定義

- **問題**: `:root` で `--md3-*` と `--color-*` が同じ値で二重定義されている。`@theme inline` で `var(--md3-*)` 参照しているのに `:root` で再度直値を書いている
- **改善案**: `:root` 内の `--color-*` 直接定義（100-143行目）を削除
- **対象ファイル**: `app/globals.css:100-143`

#### 17. サイドバーがモバイルで完全非表示

- **問題**: `hidden lg:flex` でlg未満では完全非表示。人気記事やニュースレター登録がモバイルユーザーに提供されない
- **改善案**: モバイルではメインコンテンツの下にサイドバーコンテンツを配置
- **対象ファイル**: `components/layout/Sidebar/Sidebar.tsx:24`

#### 18. 記事ページのボタンテキストが英語混在

- **問題**: 日本語ブログなのにニュースレターCTAが「Subscribe Now」と英語。トップページは「登録」と日本語で不統一
- **改善案**: 「登録する」に統一
- **対象ファイル**: `app/(public)/[category]/[slug]/page.tsx:207`
