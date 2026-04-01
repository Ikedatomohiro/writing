# ニュースレター購読機能 実装計画

## データ保存先の決定

**採用: Vercel Blob（JSONファイル管理）**

理由:
- プロジェクトが既に `@vercel/blob` を使用（articles管理で実績あり）
- 新規インフラ不要（Vercel Postgres の追加設定・コスト不要）
- 購読者数がスケールアップした場合は将来 Postgres に移行可能
- `lib/articles/backend/vercel-blob.ts` のパターンをそのまま流用できる

保存パス: `newsletter/subscribers.json`

---

## 実装ステップ

### Step 1: 型定義とデータ層

**新規ファイル**: `lib/newsletter/types.ts`
```typescript
// Subscriber, SubscribersData 型
```

**新規ファイル**: `lib/newsletter/storage.ts`
```typescript
// loadSubscribers(): SubscribersData
// saveSubscribers(data: SubscribersData): Promise<void>
// addSubscriber(email: string): Promise<{success: boolean, alreadyExists: boolean}>
```

参考: `lib/articles/backend/vercel-blob.ts` の load/save パターン

---

### Step 2: APIルート

**新規ファイル**: `app/api/newsletter/subscribe/route.ts`

処理フロー:
1. 環境変数チェック（GMAIL_USER, GMAIL_APP_PASSWORD）
2. リクエストボディ解析（email）
3. Zod でメールバリデーション
4. `addSubscriber(email)` 呼び出し
5. 重複ならば 409 を返す
6. 新規ならば確認メール送信（nodemailer）
7. 成功レスポンス返却

参考: `app/api/contact/route.ts` のパターン

**新規ファイル**: `app/api/newsletter/subscribe/route.test.ts`

テストケース:
- 正常系: 新規メール → 200 + success: true
- 重複: 同一メール2回目 → 409
- バリデーション失敗: 不正メール → 400
- 環境変数未設定 → 500
- ストレージエラー → 500

---

### Step 3: カスタムフック（フロントエンド共通化）

**新規ファイル**: `hooks/useNewsletterSubscribe.ts`

```typescript
// 戻り値
// - subscribe(email: string): Promise<void>
// - status: 'idle' | 'loading' | 'success' | 'error'
// - errorMessage: string | null
```

NewsletterSignup.tsx と page.tsx の NewsletterSection 両方で使用。

**新規ファイル**: `hooks/useNewsletterSubscribe.test.ts`

---

### Step 4: フロントエンド更新

**更新ファイル**: `components/layout/Sidebar/NewsletterSignup.tsx`

変更内容:
- `'use client'` 宣言の確認（既に設定済みか確認）
- useState で email, status, errorMessage を管理
- useNewsletterSubscribe フックの適用
- 送信中: ボタン無効化 + "登録中..." テキスト
- 成功: フォームを隠して「登録が完了しました！」表示
- エラー: フォーム下部にエラーメッセージ表示

**更新ファイル**: `app/(public)/page.tsx`

変更内容:
- NewsletterSection を Server Component から切り出して Client Component 化
- 新規ファイル: `components/newsletter/NewsletterSection.tsx`
- useNewsletterSubscribe フックを適用

---

### Step 5: 確認メールテンプレート

**新規ファイル**: `lib/newsletter/email-templates.ts`

```typescript
// getConfirmationEmailContent(email: string): {subject: string, text: string, html: string}
```

メール内容:
- 件名: 「ニュースレター登録が完了しました」
- 本文: 登録完了メッセージ + ブログへのリンク

---

## 影響範囲

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `lib/newsletter/types.ts` | 新規 | 型定義 |
| `lib/newsletter/storage.ts` | 新規 | Vercel Blob CRUD |
| `app/api/newsletter/subscribe/route.ts` | 新規 | APIエンドポイント |
| `app/api/newsletter/subscribe/route.test.ts` | 新規 | APIテスト |
| `lib/newsletter/email-templates.ts` | 新規 | メールテンプレート |
| `hooks/useNewsletterSubscribe.ts` | 新規 | フロントエンドフック |
| `hooks/useNewsletterSubscribe.test.ts` | 新規 | フックテスト |
| `components/newsletter/NewsletterSection.tsx` | 新規 | Client Component切り出し |
| `components/layout/Sidebar/NewsletterSignup.tsx` | 更新 | フォーム送信処理追加 |
| `app/(public)/page.tsx` | 更新 | NewsletterSection をimport |

---

## 依存関係

```
types.ts
  ↓
storage.ts → Vercel Blob
  ↓
email-templates.ts
  ↓
route.ts → nodemailer
  ↓
useNewsletterSubscribe.ts → route.ts
  ↓
NewsletterSignup.tsx / NewsletterSection.tsx
```

---

## テスト計画

| テスト対象 | テストファイル | カバー内容 |
|-----------|-------------|----------|
| APIルート | `route.test.ts` | 正常系/エラー系/重複/バリデーション |
| ストレージ | `storage.test.ts` | load/save/addSubscriber |
| フック | `useNewsletterSubscribe.test.ts` | idle/loading/success/error |
| UIコンポーネント | `NewsletterSignup.test.tsx`（既存更新） | フォーム送信/成功/エラー表示 |

---

## リスクと対策

| リスク | 対策 |
|-------|-----|
| Vercel Blob の並行書き込み競合 | load → merge → save のアトミック操作、将来的にDB移行 |
| Gmail の送信レート制限 | 現状はMVPのため許容、将来は SendGrid/Resend 移行 |
| メール送信失敗時の購読者データ不整合 | メール送信失敗でも登録は成功として扱う（ベストエフォート） |
| 大量スパム登録 | 現状はMVPのため許容、将来はreCAPTCHA/レート制限追加 |
