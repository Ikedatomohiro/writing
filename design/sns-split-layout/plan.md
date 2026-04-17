# SNS管理画面 スプリットレイアウト化 計画

## 背景・課題

`/threads` と `/x` のdraft→queued操作が以下の点で使いづらい：

1. **挙動の非対称**
   - `/threads/[id]`: enqueue / dequeue / prev-next あり
   - `/x/[id]`: enqueueのみ、dequeue・prev-nextなし
2. **ページ遷移のコスト**
   - リスト→詳細がフル遷移。戻るのに時間がかかる
3. **本文確認のたびに遷移が必要**
   - 一覧カードは本文先頭1行のみtruncate表示

## ゴール

- リスト画面に本文全文を展開し、**遷移なしで読める**
- 編集は**右スライドパネル（モバイル: フル画面モーダル）**で完結
- draft↔queued・削除の頻用操作は**一覧カード上のインラインボタン**で1クリック
- queuedの並び替えは**ドラッグ&ドロップ**（モバイルは↑↓ボタンで代替）
- `/threads` と `/x` の挙動を完全に揃える

## スコープ（Stage分割）

### Stage 1: インラインボタン統一（最小で最大効果）
- `/threads` 一覧カードに `enqueue`/`dequeue`/`delete` ボタンを追加
- `/x` 一覧カードに同ボタンを追加
- `/x/[id]` に `dequeue` ボタン追加（詳細画面の挙動も揃える）
- **これだけでユーザーの主訴「draft→queuedがやりにくい」は解消**

### Stage 2: 全文表示＋parallel routes＋D&D
- `app/(admin)/threads/layout.tsx` に2カラムレイアウト
- `@panel/default.tsx` (null) と `@panel/(.)[id]/page.tsx` (intercepting route) を追加
- 既存 `[id]/page.tsx` は直URLアクセス用にフル画面で残す
- 一覧カードの `truncate` / `line-clamp` 廃止、本文全文展開
- `@dnd-kit/core` + `@dnd-kit/sortable` を導入し、queuedタブをD&D対応
- モバイル（`md` 未満）ではD&D無効化＋↑↓ボタン、パネルはフル画面モーダル
- `/x` も同構造に

### Stage 3: X側API整備
- `app/api/x/queue/reorder/route.ts` を新規作成（threads版を参考に）
- X側にもPAGE_SIZEベースのページネーション追加（全文表示でDOM肥大化を回避）

## リスク・対応

| リスク | 対応 |
|---|---|
| intercepting routeでリロード時の挙動 | 空パネルで `click→reload→back` の3シナリオをStage 2冒頭で smoke test |
| モバイルD&Dのスクロール競合 | モバイルでは `@dnd-kit` 無効化、既存↑↓ボタンにフォールバック |
| 既存の `page.test.tsx` が壊れる | 同コミットで更新。現行テストはタイトル・タブ・テーマ名の表示確認がメインなので影響小 |
| DOM肥大化（全文表示） | ページネーション（Stage 3）で対応、Stage 2時点では件数少ない前提 |

## ルール関連の判断

- **`ui-design.md` の pencil MCP ルール**: 今回は新しいビジュアル設計ではなくstructural refactor（既存コンポーネントの再配置・layoutシフト）のため、pencilでの設計step はskip。配色・タイポ・コンポーネントAPIは既存資産をそのまま利用する。
- **`implementation-workflow.md` の spec.md**: 本plan.mdに背景・ゴール・スコープを含めており、独立したspec.mdは作成しない（機能追加ではなく既存UX改善のため）。

## テスト戦略（TDD）

- Stage 1: `page.test.tsx` に「draftカードにキュー追加ボタンがあり、クリックでenqueue APIが呼ばれる」「queuedカードに下書きに戻すボタンがあり、クリックでPATCH呼ばれる」等を追加
- Stage 2: `layout.test.tsx` で parallel slot の描画を確認。`useSortable` 利用箇所はテスト困難なのでスモークテストのみ
- Stage 3: X reorder APIの単体テスト（threads版 `app/api/threads/queue/reorder/route.test.ts` と同パターン）
