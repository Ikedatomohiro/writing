# 利用規約・プロフィールページ タスクリスト

## Task 1: 利用規約ページ（TDD）

- [ ] `app/(public)/terms/page.test.tsx` を作成（先にテストを書く）
  - ページがレンダリングされる
  - 「利用規約」見出しが存在する
  - 「禁止事項」「免責事項」「著作権」セクションが存在する
- [ ] テストが失敗することを確認（Red）
- [ ] `app/(public)/terms/page.tsx` を実装
  - `metadata` を設定（title・description・canonical）
  - privacy/page.tsx のスタイルを踏襲
  - 8セクションの本文コンテンツを記述
- [ ] テストが通ることを確認（Green）
- **完了条件**: `/terms` でページが表示され、テストが全通過

---

## Task 2: プロフィールページ（TDD）

- [ ] `app/(public)/profile/page.test.tsx` を作成（先にテストを書く）
  - ページがレンダリングされる
  - 「プロフィール」見出しが存在する
  - 「お問い合わせ」リンクが存在する
- [ ] テストが失敗することを確認（Red）
- [ ] `app/(public)/profile/page.tsx` を実装
  - `metadata` を設定
  - about/page.tsx のレイアウトパターンを参考に5セクション構成
  - 自己紹介・経歴・ブログについて・CTA
- [ ] テストが通ることを確認（Green）
- **完了条件**: `/profile` でページが表示され、テストが全通過

---

## Task 3: 全テスト確認

- [ ] `npx vitest run app/\(public\)/terms` でテスト通過
- [ ] `npx vitest run app/\(public\)/profile` でテスト通過
- [ ] `npx tsc --noEmit` で型エラーなし
- [ ] `npm run build` でビルドエラーなし

---

## タスク依存関係

```
Task 1（利用規約）┐
                  ├→ Task 3（全確認）
Task 2（プロフィール）┘
```

Task 1・2 は独立しているため並列実装可能。
