# タイポグラフィ設定 タスクリスト

## タスク

### 1. フォント設定
- [x] `lib/fonts.ts`を作成
- [x] Noto Sans JP（next/font/google）をインポート
- [x] Inter（next/font/google）をインポート
- [x] JetBrains Mono（next/font/google）をインポート
- [x] フォント変数とクラス名をエクスポート

### 2. レイアウト更新
- [x] `app/layout.tsx`でフォントを適用
- [x] `<html>`にフォントクラスを追加

### 3. Tailwind設定
- [x] `tailwind.config.ts`にフォントファミリーを追加
- [x] `fontFamily.sans`にNoto Sans JPを設定
- [x] `fontFamily.mono`にJetBrains Monoを設定
- [x] `fontSize`に見出し・本文サイズを定義

### 4. グローバルCSS
- [x] タイポグラフィ用CSS変数コメントを追加
- [x] 行間（line-height）の設定
- [x] 見出しのデフォルトスタイル

### 5. 検証
- [x] `npm run build`成功
- [x] テスト実行（150テストパス）
- [ ] dev環境で視覚確認

## 完了条件

- [x] すべてのテストが通る
- [x] ビルドが成功する
- [ ] フォントがブラウザで正しく表示される
