# ブログ用ヘッダーコンポーネント 実装計画

## 実装ステップ

### Step 1: コンポーネント構成

```
components/
  layout/
    Header.tsx         # 既存（管理画面用）→ そのまま維持
    BlogHeader/
      BlogHeader.tsx
      BlogHeader.test.tsx
      MobileMenu.tsx
      MobileMenu.test.tsx
      NavLink.tsx
      NavLink.test.tsx
      index.ts
```

### Step 2: NavLinkコンポーネント

1. 型定義（NavLinkProps）
2. アクティブ状態の判定
3. スタイル適用
4. テスト作成

### Step 3: MobileMenuコンポーネント

1. 型定義（MobileMenuProps）
2. 開閉状態の管理
3. ハンバーガーアイコン
4. ドロワーメニュー
5. テスト作成

### Step 4: BlogHeaderコンポーネント

1. 型定義（BlogHeaderProps）
2. ロゴ/サイト名
3. デスクトップナビゲーション
4. モバイルメニュー統合
5. テスト作成

### Step 5: エクスポート設定

1. index.tsの作成
2. components/layout/index.tsの更新

## 影響を受けるファイル

| ファイル | 変更内容 |
|---------|---------|
| `components/layout/BlogHeader/` | 新規作成 |
| `components/layout/index.ts` | エクスポート追加 |

## 依存関係

- #15 テーマシステム（マージ済み）
- CSS変数（--accent, --accent-bg等）

## テスト計画

- NavLink: アクティブ状態、クリック動作（4件）
- MobileMenu: 開閉、キーボード操作（4件）
- BlogHeader: レンダリング、ナビゲーション（6件）

## リスクと対策

| リスク | 対策 |
|--------|------|
| パス判定の複雑化 | usePathnameフックを使用 |
| モバイルメニューのアクセシビリティ | Chakra UIのDrawerを使用 |
