---
name: responsive-grid-layout
description: Chakra UI Gridを使ったレスポンシブカラムレイアウトを実装する。モバイルファーストで1→2→3カラムのレイアウトを構築する際に使用する。
---

# Responsive Grid Layout

Chakra UI の Grid/SimpleGrid を使用したレスポンシブレイアウトの実装パターン。

## ブレークポイント

Chakra UI のデフォルトブレークポイント:

| キー | サイズ | 用途 |
|------|--------|------|
| base | 0px〜 | モバイル（デフォルト） |
| sm | 640px〜 | 大きめモバイル |
| md | 768px〜 | タブレット |
| lg | 1024px〜 | デスクトップ |
| xl | 1280px〜 | 大画面 |

## 基本パターン

### 1. SimpleGrid（等幅カラム）

```tsx
import { SimpleGrid } from "@chakra-ui/react";

// 記事カード一覧など
<SimpleGrid
  columns={{ base: 1, md: 2, lg: 3 }}
  spacing={{ base: 4, md: 6 }}
>
  {articles.map((article) => (
    <ArticleCard key={article.id} {...article} />
  ))}
</SimpleGrid>
```

### 2. Grid + GridItem（不等幅カラム）

```tsx
import { Grid, GridItem } from "@chakra-ui/react";

// メインコンテンツ + サイドバー
<Grid
  templateColumns={{
    base: "1fr",
    lg: "1fr 300px",
  }}
  gap={{ base: 4, lg: 6 }}
>
  <GridItem>
    <MainContent />
  </GridItem>
  <GridItem display={{ base: "none", lg: "block" }}>
    <Sidebar />
  </GridItem>
</Grid>
```

### 3. Flex（柔軟なレイアウト）

```tsx
import { Flex, Box } from "@chakra-ui/react";

// ヘッダーナビゲーション
<Flex
  direction={{ base: "column", md: "row" }}
  justify="space-between"
  align={{ base: "stretch", md: "center" }}
  gap={4}
>
  <Logo />
  <Navigation />
</Flex>
```

## 実装手順

### Step 1: モバイルファーストで設計

```tsx
// 良い例: base から始める
columns={{ base: 1, md: 2, lg: 3 }}

// 悪い例: デスクトップから始める
columns={{ lg: 3, md: 2, base: 1 }}  // 動作するが意図が不明瞭
```

### Step 2: 要素の表示/非表示

```tsx
// モバイルで非表示、デスクトップで表示
<Box display={{ base: "none", lg: "block" }}>
  <Sidebar />
</Box>

// モバイルで表示、デスクトップで非表示
<Box display={{ base: "block", lg: "none" }}>
  <MobileMenu />
</Box>
```

### Step 3: スペーシングの調整

```tsx
<SimpleGrid
  columns={{ base: 1, md: 2, lg: 3 }}
  spacing={{ base: 4, md: 6, lg: 8 }}
  p={{ base: 4, md: 6 }}
>
```

## よくあるレイアウト

### ブログトップページ

```tsx
<Box maxW="1280px" mx="auto" px={{ base: 4, md: 6 }}>
  {/* ヒーローセクション */}
  <Box mb={{ base: 6, md: 10 }} />

  {/* 記事グリッド */}
  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
    {articles.map((a) => <ArticleCard key={a.id} {...a} />)}
  </SimpleGrid>
</Box>
```

### 記事詳細ページ

```tsx
<Grid
  maxW="1280px"
  mx="auto"
  templateColumns={{ base: "1fr", lg: "1fr 300px" }}
  gap={6}
  px={{ base: 4, md: 6 }}
>
  <GridItem>
    <Article />
  </GridItem>
  <GridItem display={{ base: "none", lg: "block" }}>
    <Sidebar>
      <TableOfContents />
      <RelatedArticles />
    </Sidebar>
  </GridItem>
</Grid>
```

### カテゴリ一覧

```tsx
<SimpleGrid
  columns={{ base: 2, sm: 3, md: 4, lg: 6 }}
  spacing={{ base: 2, md: 4 }}
>
  {categories.map((cat) => (
    <CategoryCard key={cat.id} {...cat} />
  ))}
</SimpleGrid>
```

## テスト

```tsx
import { render, screen } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

const renderWithChakra = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
  );
};

describe("ResponsiveLayout", () => {
  it("renders grid with correct columns", () => {
    renderWithChakra(<ArticleGrid articles={mockArticles} />);
    expect(screen.getAllByTestId("article-card")).toHaveLength(3);
  });
});
```

## チェックリスト

実装時の確認事項:

- [ ] `base` から始めているか（モバイルファースト）
- [ ] 各ブレークポイントで適切なカラム数か
- [ ] スペーシングがブレークポイントごとに調整されているか
- [ ] モバイルで不要な要素は非表示にしているか
- [ ] `maxW` で最大幅を制限しているか
- [ ] `mx="auto"` で中央寄せしているか
- [ ] `px` で左右パディングを設定しているか
