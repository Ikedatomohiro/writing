# 目次コンポーネント実装計画

## 実装ステップ

### Step 1: 見出し抽出ユーティリティ

**ファイル**: `lib/toc/extractHeadings.ts`

- DOM要素から見出し（H2, H3）を抽出
- 見出しにIDがない場合は自動生成
- TocItem配列を返す

### Step 2: useActiveHeading hook

**ファイル**: `hooks/useActiveHeading.ts`

- Intersection Observerを使用
- 複数の見出しIDを監視
- 現在アクティブな見出しIDを返す

### Step 3: useScrollToHeading hook

**ファイル**: `hooks/useScrollToHeading.ts`

- 見出しIDを受け取りスムーズスクロール
- ヘッダーオフセット考慮
- scrollIntoView または scroll + offset計算

### Step 4: TableOfContentsContainer

**ファイル**: `components/layout/Sidebar/TableOfContentsContainer.tsx`

- 見出し抽出、アクティブ検出、スクロールを統合
- 既存のTableOfContentsコンポーネントをラップ

## 影響を受けるファイル

### 新規作成
- `lib/toc/extractHeadings.ts`
- `lib/toc/extractHeadings.test.ts`
- `hooks/useActiveHeading.ts`
- `hooks/useActiveHeading.test.ts`
- `hooks/useScrollToHeading.ts`
- `hooks/useScrollToHeading.test.ts`
- `components/layout/Sidebar/TableOfContentsContainer.tsx`
- `components/layout/Sidebar/TableOfContentsContainer.test.tsx`

### 既存ファイル
- `components/layout/Sidebar/index.ts` - エクスポート追加

## 依存関係

```
extractHeadings (独立)
    ↓
useActiveHeading (extractHeadingsの結果を使用)
    ↓
useScrollToHeading (独立)
    ↓
TableOfContentsContainer (上記すべてを統合)
```

## テスト計画

### ユニットテスト
- extractHeadings: 各種HTMLパターンでの抽出テスト
- useActiveHeading: Observer動作のモックテスト
- useScrollToHeading: scroll関数呼び出しテスト

### 統合テスト
- TableOfContentsContainer: 全体の動作テスト

## リスクと対策

### リスク1: SSR対応
- 対策: DOM操作はクライアントサイドのみで実行

### リスク2: 見出しIDの重複
- 対策: extractHeadingsでユニークID生成ロジックを実装

### リスク3: パフォーマンス
- 対策: Intersection Observerで効率化、適切なthrottling
