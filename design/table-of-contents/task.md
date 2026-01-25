# 目次コンポーネント タスクリスト

## タスク一覧

### Task 1: extractHeadings実装
- [x] テストファイル作成 (`lib/toc/extractHeadings.test.ts`)
- [x] 基本的な抽出テスト（H2, H3）
- [x] 空の場合のテスト
- [x] IDがない見出しのテスト
- [x] 実装（`lib/toc/extractHeadings.ts`）
- [x] テストがパス

**完了条件**: DOM要素から見出しを正しく抽出できる ✓

### Task 2: useActiveHeading実装
- [x] テストファイル作成 (`hooks/useActiveHeading.test.ts`)
- [x] Intersection Observer動作テスト
- [x] 複数見出しでのアクティブ切り替えテスト
- [x] 実装（`hooks/useActiveHeading.ts`）
- [x] テストがパス

**完了条件**: スクロール位置に応じてアクティブ見出しIDを返す ✓

### Task 3: useScrollToHeading実装
- [x] テストファイル作成 (`hooks/useScrollToHeading.test.ts`)
- [x] スクロール呼び出しテスト
- [x] オフセット適用テスト
- [x] 実装（`hooks/useScrollToHeading.ts`）
- [x] テストがパス

**完了条件**: 指定IDへスムーズスクロールできる ✓

### Task 4: TableOfContentsContainer実装
- [x] テストファイル作成 (`components/layout/Sidebar/TableOfContentsContainer.test.tsx`)
- [x] レンダリングテスト
- [x] 見出し抽出統合テスト
- [x] 実装（`components/layout/Sidebar/TableOfContentsContainer.tsx`）
- [x] Sidebar/index.tsにエクスポート追加
- [x] テストがパス

**完了条件**: 統合コンポーネントとして動作する ✓

### Task 5: 最終検証
- [x] 全テストがパス (405 tests)
- [x] ビルドが成功
- [x] リンター/フォーマッターがパス

## タスク依存関係

```
Task 1 (extractHeadings) ─┐
                          ├→ Task 4 (Container)
Task 2 (useActiveHeading) ┤
                          │
Task 3 (useScrollToHeading)┘

Task 4 → Task 5 (検証)
```

## spec.md照合チェック

- [x] FR1: 見出し抽出 → Task 1
- [x] FR2: 目次リスト表示 → 既存TableOfContents使用
- [x] FR3: 現在位置のハイライト → Task 2
- [x] FR4: スムーズスクロール → Task 3
- [x] 統合 → Task 4
