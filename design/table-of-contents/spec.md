# 目次コンポーネント仕様書

## 概要

記事詳細ページで目次を表示し、ナビゲーションを改善する機能を実装する。

## 背景

- ユーザーが長い記事を読む際に、全体構造の把握と特定セクションへの移動を容易にする
- サイドバーにスティッキー表示することで、常にナビゲーション可能にする

## 機能要件

### FR1: 見出し抽出

- 記事本文（HTML/MDX）から見出し（H2, H3）を抽出する
- 各見出しに対して以下の情報を取得：
  - id: 見出し要素のID（アンカーリンク用）
  - title: 見出しテキスト
  - level: 見出しレベル（2 or 3）

### FR2: 目次リスト表示

- 抽出した見出しを目次として表示する
- H3はH2に対してインデントを付ける
- 既存の`TableOfContents`コンポーネントを活用する

### FR3: 現在位置のハイライト

- スクロール位置に連動して、現在表示中のセクションをハイライトする
- Intersection Observer APIを使用してパフォーマンスを確保
- ビューポート上部に最も近い見出しをアクティブとする

### FR4: スムーズスクロール

- 目次項目をクリックすると、対応する見出しにスムーズスクロールする
- ヘッダーの高さ分のオフセットを考慮する

## 非機能要件

### NFR1: パフォーマンス

- Intersection Observer使用でスクロールイベントの負荷を軽減
- 不要な再レンダリングを防止

### NFR2: アクセシビリティ

- 既存のTableOfContentsのaria-label等を維持
- キーボードナビゲーション対応

### NFR3: レスポンシブ

- サイドバーと連動してモバイルでは非表示
- タブレット以上で表示

## 入出力

### extractHeadings関数

```typescript
type HeadingElement = Element | null;

interface TocItem {
  id: string;
  title: string;
  level: number;
}

function extractHeadings(container: HeadingElement): TocItem[]
```

### useActiveHeading hook

```typescript
interface UseActiveHeadingOptions {
  headingIds: string[];
  rootMargin?: string;
}

function useActiveHeading(options: UseActiveHeadingOptions): string | undefined
```

### useScrollToHeading hook

```typescript
interface UseScrollToHeadingOptions {
  offset?: number;
  behavior?: ScrollBehavior;
}

function useScrollToHeading(options?: UseScrollToHeadingOptions): (id: string) => void
```

## 成功基準

1. 記事本文から見出しが正しく抽出される
2. スクロールに連動して目次のアクティブ項目が更新される
3. 目次クリックで対応する見出しにスムーズスクロールする
4. 既存のテストが壊れない

## 制約事項

- 既存のTableOfContentsコンポーネントを活用する
- サイドバー内でスティッキー表示（サイドバー側で対応済み）
- Chakra UIのスタイリングに準拠
