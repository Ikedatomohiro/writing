# 基本UIコンポーネント 仕様書

## 目的

サイト全体で再利用する基本的なUIコンポーネントを提供し、デザインの一貫性を確保する。

## 要件

### 1. Buttonコンポーネント

#### バリアント
| バリアント | 説明 | 背景色 | テキスト色 |
|-----------|------|--------|-----------|
| primary | メインアクション | accent | white |
| secondary | サブアクション | accent-bg | accent |
| ghost | 控えめなアクション | transparent | text-secondary |

#### サイズ
| サイズ | padding | font-size |
|--------|---------|-----------|
| sm | 8px 16px | 14px |
| md | 12px 24px | 16px |
| lg | 16px 32px | 18px |

#### 状態
- default
- hover（明度変更）
- disabled（opacity: 0.5）
- loading（スピナー表示）

### 2. Linkコンポーネント

#### スタイル
- テキスト色: accent
- hover: underline
- visited: 同じ色を維持

### 3. Tagコンポーネント

#### バリアント
| バリアント | 用途 | スタイル |
|-----------|------|---------|
| default | 一般タグ | bg-surface, text-secondary |
| category | カテゴリ表示 | accent-bg, accent |

#### サイズ
| サイズ | padding | font-size |
|--------|---------|-----------|
| sm | 4px 8px | 12px |
| md | 6px 12px | 14px |

## 技術要件

- React Server Components対応（Client Componentとして実装、"use client"）
- テーマカラー対応（CSS変数を使用）
- TypeScriptで型安全に実装
- アクセシビリティ対応（適切なaria属性）

## 成功基準

1. すべてのコンポーネントがテスト済み
2. テーマカラーに連動して色が変わる
3. ビルドが成功する
4. Storybookまたはデモページで確認可能
