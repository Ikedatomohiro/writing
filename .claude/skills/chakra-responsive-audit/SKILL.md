---
name: chakra-responsive-audit
description: Chakra UIコンポーネントのレスポンシブ対応状況を監査する。モバイル/タブレット/デスクトップでの表示を確認し、問題を検出する。
---

# Chakra Responsive Audit

Chakra UIコンポーネントのレスポンシブ対応状況を監査し、問題点を検出する。

## 監査対象

1. **レイアウトコンポーネント**: Grid, Flex, Box, Container
2. **表示制御**: display, visibility
3. **スペーシング**: margin, padding, gap
4. **タイポグラフィ**: fontSize, lineHeight
5. **サイズ**: width, height, maxWidth

## 監査手順

### Step 1: レスポンシブ値の検出

```bash
# プロジェクト内のChakraコンポーネントを検索
grep -r "base:" --include="*.tsx" app/
grep -r "{{ base" --include="*.tsx" app/
```

### Step 2: ハードコード値の検出

問題のあるパターン:

```tsx
// NG: ハードコードされた値
<Box width="300px" />
<Grid templateColumns="1fr 300px" />
<Text fontSize="16px" />

// OK: レスポンシブ値
<Box width={{ base: "100%", lg: "300px" }} />
<Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} />
<Text fontSize={{ base: "sm", md: "md" }} />
```

### Step 3: 必須レスポンシブプロパティの確認

| コンポーネント | 必須レスポンシブ化 |
|---------------|-------------------|
| Grid | templateColumns, gap |
| SimpleGrid | columns, spacing |
| Flex | direction, gap |
| Box (レイアウト) | display, width |
| Text (見出し) | fontSize |
| Container | maxW, px |

## 監査チェックリスト

### レイアウト

- [ ] Grid/SimpleGrid の columns がレスポンシブか
- [ ] サイドバーがモバイルで非表示/下部移動か
- [ ] Container に maxW と px が設定されているか
- [ ] Flex の direction がモバイルで column か

### 表示制御

- [ ] モバイル専用要素に `display={{ base: "block", lg: "none" }}` があるか
- [ ] デスクトップ専用要素に `display={{ base: "none", lg: "block" }}` があるか

### スペーシング

- [ ] padding/margin がブレークポイントで調整されているか
- [ ] gap がブレークポイントで調整されているか

### タイポグラフィ

- [ ] 見出しの fontSize がレスポンシブか
- [ ] 本文のテキストが読みやすいサイズか

### 画像・メディア

- [ ] 画像が width="100%" で親要素に追従するか
- [ ] アスペクト比が維持されているか

## 監査コマンド

### 1. ハードコード検出スクリプト

```bash
# 固定幅の検出
grep -rn 'width="[0-9]*px"' --include="*.tsx" app/
grep -rn "width: '[0-9]*px'" --include="*.tsx" app/

# 固定高さの検出
grep -rn 'height="[0-9]*px"' --include="*.tsx" app/

# 固定フォントサイズの検出
grep -rn 'fontSize="[0-9]*px"' --include="*.tsx" app/

# Grid固定カラムの検出
grep -rn 'templateColumns="[^{]' --include="*.tsx" app/
```

### 2. レスポンシブ値の使用状況

```bash
# レスポンシブ値の使用箇所
grep -rn '{{ base:' --include="*.tsx" app/ | wc -l

# ブレークポイント別の使用状況
for bp in base sm md lg xl; do
  echo "$bp: $(grep -rn "$bp:" --include="*.tsx" app/ | wc -l)"
done
```

## 出力フォーマット

```markdown
## Chakra Responsive Audit Report

### サマリー
| 項目 | 件数 |
|------|------|
| 監査ファイル数 | XX |
| レスポンシブ対応済み | XX |
| 要対応 | XX |

### Critical（修正必須）
- [ ] `app/components/Sidebar.tsx:15` - Grid templateColumns がハードコード
- [ ] `app/components/Header.tsx:32` - モバイルでナビが溢れる

### Warning（推奨）
- [ ] `app/components/Card.tsx:8` - fontSize がハードコード

### Info（参考）
- [ ] レスポンシブ値使用率: 85%
```

## 自動修正パターン

### パターン1: 固定幅 → レスポンシブ

```tsx
// Before
<Box width="300px" />

// After
<Box width={{ base: "100%", lg: "300px" }} />
```

### パターン2: 固定カラム → レスポンシブ

```tsx
// Before
<Grid templateColumns="1fr 300px" />

// After
<Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} />
```

### パターン3: 固定表示 → 条件付き

```tsx
// Before
<Sidebar />

// After
<Box display={{ base: "none", lg: "block" }}>
  <Sidebar />
</Box>
```

## 実行例

```bash
# 監査を実行
claude "chakra-responsive-audit を実行して、app/components/ 配下を監査して"
```

## 関連スキル

- `responsive-grid-layout`: レスポンシブレイアウトの実装パターン
