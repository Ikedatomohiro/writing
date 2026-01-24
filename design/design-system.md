# Blog Design System

ブログUI用デザインシステム基盤の定義。

## カラートークン

### ベースカラー

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | #FAFAF9 | ページ背景 |
| `--bg-surface` | #F5F5F4 | サーフェス背景 |
| `--bg-card` | #FFFFFF | カード背景 |
| `--text-primary` | #1C1917 | 主要テキスト |
| `--text-secondary` | #57534E | 二次テキスト |
| `--text-muted` | #A8A29E | 控えめなテキスト |
| `--border` | #E7E5E4 | ボーダー |
| `--border-strong` | #D6D3D1 | 強調ボーダー |

### カテゴリ別テーマカラー

| Category | Accent | Background |
|----------|--------|------------|
| Investment (資産形成) | #0891B2 (cyan-600) | #ECFEFF (cyan-50) |
| Programming | #7C3AED (violet-600) | #F5F3FF (violet-50) |
| Health (健康) | #16A34A (green-600) | #F0FDF4 (green-50) |

## タイポグラフィ

### フォントファミリー

| Token | Value | Usage |
|-------|-------|-------|
| `--font-primary` | Noto Sans JP | 見出し、本文 |
| `--font-secondary` | Inter | UI要素、英字 |
| `--font-mono` | JetBrains Mono | コード |

### 見出し

| Level | Size | Weight |
|-------|------|--------|
| H1 | 32px | 700 |
| H2 | 24px | 700 |
| H3 | 20px | 600 |
| H4 | 18px | 600 |

### 本文

| Type | Size | Weight |
|------|------|--------|
| Body | 16px | 400 |
| Caption | 14px | 400 |
| Small | 12px | 400 |

## 角丸

| Token | Value |
|-------|-------|
| `--radius-sm` | 4px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |

## コンポーネント

### Button

4種類のボタンバリアント:

1. **Primary** - 主要アクション
   - Background: accent color
   - Text: white
   - Padding: 12px 24px
   - Border Radius: 8px

2. **Secondary** - 二次アクション
   - Background: bg-surface
   - Border: border (1px)
   - Text: text-primary

3. **Outline** - アウトラインスタイル
   - Background: transparent
   - Border: accent color (1px)
   - Text: accent color

4. **Ghost** - 最小限のスタイル
   - Background: transparent
   - Text: accent color

### Card/Article

記事カードコンポーネント:

```
Width: 320px
Border Radius: 12px
Border: 1px solid border
Background: bg-card

Structure:
├── Thumbnail (height: 180px)
├── Content (padding: 16px, gap: 12px)
│   ├── Category Badge
│   ├── Title (18px, 600)
│   ├── Excerpt (14px, line-height: 1.6)
│   └── Meta (date, read time)
```

### Header/Main

メインヘッダーコンポーネント:

```
Height: 64px
Background: bg-card
Border Bottom: 1px solid border
Padding: 0 24px

Structure:
├── Left
│   ├── Logo (20px, 700)
│   └── Navigation (14px, 500)
└── Right
    └── Search Button (40x40)
```

### Footer/Main

メインフッターコンポーネント:

```
Background: bg-surface
Padding: 48px 24px 24px 24px
Gap: 32px

Structure:
├── Top (space-between)
│   ├── Brand (logo + description)
│   └── Links (Categories, Links)
└── Bottom (centered, border-top)
    └── Copyright
```

### 広告エリア枠

Google Adsense対応の広告枠:

| Name | Size | Usage |
|------|------|-------|
| Ad/Leaderboard | 728×90 | ページ上部・下部 |
| Ad/Rectangle | 300×250 | サイドバー |
| Ad/Skyscraper | 300×600 | サイドバー（大） |

## 使用方法

後続のデザインタスク（トップページ、カテゴリ一覧、記事詳細）では、
これらのコンポーネントをインスタンスとして使用してください。

### Pencilでの使用例

```javascript
// 記事カードを配置
card=I(container, {type: "ref", ref: "v54fK"})
U(card+"/title", {content: "新しい記事タイトル"})
U(card+"/categoryLabel", {content: "Programming", fill: "$--accent-programming"})
U(card+"/category", {fill: "$--accent-programming-bg"})
```

## ページデザイン

### トップページ (Top Page)

```
Width: 1280px
Layout: vertical

Structure:
├── Header (Header/Main)
├── Ad Area (Ad/Leaderboard) - ヘッダー下
├── Hero Section
│   ├── Site Title (48px, 700)
│   ├── Subtitle (18px)
│   └── Category Navigation (3 badges)
├── Main Content (padding: 0 40px, gap: 64px)
│   ├── Investment Section
│   │   ├── Section Header (badge + title + "View All")
│   │   └── Article Cards (3x Card/Article)
│   ├── Programming Section
│   │   ├── Section Header
│   │   └── Article Cards (3x Card/Article)
│   ├── Ad Area (Ad/Leaderboard) - コンテンツ間
│   └── Health Section
│       ├── Section Header
│       └── Article Cards (3x Card/Article)
└── Footer (Footer/Main)
```

### カテゴリ一覧ページ (Category Page)

3カテゴリ分のテーマ適用例を作成。

```
Width: 1280px
Layout: vertical

Structure:
├── Header (Header/Main)
├── Category Hero
│   ├── Category Badge (テーマカラー)
│   ├── Category Title (36px, 700)
│   └── Category Description
├── Content Area (horizontal, gap: 32px)
│   ├── Main (fill_container)
│   │   ├── Article Grid Row 1 (2x Card/Article)
│   │   ├── Article Grid Row 2 (2x Card/Article)
│   │   └── Pagination
│   └── Sidebar (300px)
│       ├── Popular Articles Card
│       └── Ad/Rectangle
└── Footer (Footer/Main)
```

**テーマカラー適用箇所**:
- Category Hero背景
- Category Badge
- ページネーションのアクティブボタン

### 記事詳細ページ (Article Detail Page)

```
Width: 1280px
Layout: vertical

Structure:
├── Header (Header/Main)
├── Content Area (horizontal, gap: 32px)
│   ├── Main (fill_container)
│   │   ├── Article Meta
│   │   │   ├── Category Badge
│   │   │   ├── Title (32px, 700)
│   │   │   └── Date/Update/ReadTime
│   │   ├── Featured Image (height: 400px)
│   │   ├── Ad/Leaderboard (記事上部)
│   │   ├── Article Body (本文ブロック1)
│   │   ├── Ad/Leaderboard (記事中)
│   │   ├── Article Body 2 (本文ブロック2)
│   │   ├── Ad/Leaderboard (記事下部)
│   │   ├── Share Section (Twitter, Facebook, Link)
│   │   └── Related Articles (2x Card/Article)
│   └── Sidebar (300px)
│       ├── Table of Contents
│       └── Ad/Rectangle
└── Footer (Footer/Main)
```

**本文スタイル**:
- H2: 24px, 700
- H3: 20px, 600
- Body: 16px, line-height 1.8
- List: indent 24px
- Code: JetBrains Mono, dark background

**広告配置 (Google Adsense対応)**:
- 記事上部（タイトル下）
- 記事中（本文途中）
- 記事下部（関連記事前）
- サイドバー（目次下）

## 関連Issue

- #11: デザインシステム基盤の作成 ✓
- #12: トップページのデザイン ✓
- #13: カテゴリ一覧ページのデザイン ✓
- #14: 記事詳細ページのデザイン ✓
