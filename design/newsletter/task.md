# ニュースレター購読機能 タスクリスト

## フェーズ1: データ層

### Task 1.1: 型定義の作成
- [ ] `lib/newsletter/types.ts` を作成
  - `Subscriber` インターフェース（id, email, subscribedAt）
  - `SubscribersData` インターフェース（updatedAt, subscribers）
- **完了条件**: TypeScript 型チェックが通る

### Task 1.2: ストレージ層の実装（TDD）
- [ ] `lib/newsletter/storage.test.ts` を作成（先にテストを書く）
  - `loadSubscribers()` のテスト（初回空データ、既存データ）
  - `addSubscriber()` のテスト（新規追加、重複検出）
- [ ] テストが失敗することを確認（Red）
- [ ] `lib/newsletter/storage.ts` を実装
  - `loadSubscribers(): Promise<SubscribersData>`
  - `addSubscriber(email: string): Promise<{success: boolean, alreadyExists: boolean}>`
- [ ] テストが通ることを確認（Green）
- **完了条件**: ストレージのユニットテストが全て通る

---

## フェーズ2: APIルート

### Task 2.1: メールテンプレートの作成
- [ ] `lib/newsletter/email-templates.ts` を作成
  - `getConfirmationEmailContent(email: string)` 関数
  - 件名・本文・HTML形式
- **完了条件**: テンプレート関数が正しい形式を返す

### Task 2.2: APIルートの実装（TDD）
- [ ] `app/api/newsletter/subscribe/route.test.ts` を作成（先にテストを書く）
  - 正常系: 新規メール → 200 + `{success: true}`
  - 重複: 同一メール2回目 → 409
  - バリデーション失敗: 不正メール形式 → 400
  - 環境変数未設定 → 500
  - ストレージエラー → 500
- [ ] テストが失敗することを確認（Red）
- [ ] `app/api/newsletter/subscribe/route.ts` を実装
  - Zod によるメール形式バリデーション
  - `addSubscriber()` 呼び出し
  - nodemailer で確認メール送信
  - エラーハンドリング
- [ ] テストが通ることを確認（Green）
- **完了条件**: APIテストが全て通る

---

## フェーズ3: フロントエンド

### Task 3.1: カスタムフックの実装（TDD）
- [ ] `hooks/useNewsletterSubscribe.test.ts` を作成（先にテストを書く）
  - 初期状態: `status === 'idle'`
  - 送信中: `status === 'loading'`
  - 成功: `status === 'success'`
  - エラー: `status === 'error'` + `errorMessage` 設定
- [ ] テストが失敗することを確認（Red）
- [ ] `hooks/useNewsletterSubscribe.ts` を実装
  - `subscribe(email)` 関数
  - `status: 'idle' | 'loading' | 'success' | 'error'`
  - `errorMessage: string | null`
- [ ] テストが通ることを確認（Green）
- **完了条件**: フックのユニットテストが全て通る

### Task 3.2: NewsletterSignup コンポーネント更新
- [ ] `components/layout/Sidebar/NewsletterSignup.tsx` を更新
  - `'use client'` 宣言を確認・追加
  - `useNewsletterSubscribe` フックを適用
  - 送信中: ボタン無効化 + "登録中..." テキスト
  - 成功: 「登録が完了しました！確認メールをご確認ください。」
  - エラー: フォーム下部にエラーメッセージ（赤テキスト）
- [ ] `components/layout/Sidebar/NewsletterSignup.test.tsx` を更新
  - フォーム送信時のローディング状態テスト
  - 成功時のメッセージ表示テスト
  - エラー時のメッセージ表示テスト
- [ ] テストが通ることを確認
- **完了条件**: コンポーネントテストが全て通る

### Task 3.3: NewsletterSection の Client Component 化
- [ ] `components/newsletter/NewsletterSection.tsx` を新規作成
  - page.tsx の NewsletterSection JSX を切り出し
  - `'use client'` 宣言
  - `useNewsletterSubscribe` フックを適用
  - 成功/エラー状態の表示
- [ ] `app/(public)/page.tsx` を更新
  - インラインの NewsletterSection を import に変更
- [ ] `app/(public)/page.test.tsx` のテストが壊れていないか確認
- **完了条件**: トップページのニュースレターフォームが動作する

---

## フェーズ4: 統合確認

### Task 4.1: 全テストの実行
- [ ] `npm run test` を実行して全テストが通ることを確認
- [ ] カバレッジが 80% 以上であることを確認

### Task 4.2: 手動動作確認
- [ ] ローカルで新規メールアドレスを登録 → 確認メールが届くことを確認
- [ ] 同一メールで再登録 → 「すでに登録済み」エラーが表示されることを確認
- [ ] 不正メールアドレス入力 → バリデーションエラーが表示されることを確認

---

## spec.md との照合チェック

- [ ] ✅ メールアドレスを入力して登録ボタンを押すと購読者データが保存される（Task 1.2 + 2.2）
- [ ] ✅ 登録確認メールがユーザーに届く（Task 2.1 + 2.2）
- [ ] ✅ 重複登録時にエラーメッセージが表示される（Task 2.2 + 3.2/3.3）
- [ ] ✅ 不正なメールアドレス入力時にエラーメッセージが表示される（Task 2.2 + 3.2/3.3）
- [ ] ✅ すべてのユニットテストが通る（Task 4.1）

---

## タスク依存関係

```
Task 1.1（型定義）
  ↓
Task 1.2（ストレージ）
  ↓
Task 2.1（メールテンプレート）
Task 2.2（APIルート） ← 1.2 + 2.1 に依存
  ↓
Task 3.1（カスタムフック） ← 2.2 に依存
  ↓
Task 3.2（NewsletterSignup更新） ← 3.1 に依存
Task 3.3（NewsletterSection化） ← 3.1 に依存
  ↓
Task 4.1, 4.2（統合確認）
```
