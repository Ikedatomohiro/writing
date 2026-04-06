---
name: vercel-react-best-practices
description: ReactとNext.jsのパフォーマンス最適化ガイド。コンポーネント実装・データフェッチ・バンドル最適化の際に参照する。
---

# Vercel React Best Practices

React / Next.js アプリのパフォーマンス最適化ルール集（69ルール）。
実装・レビュー時に該当カテゴリを参照すること。

## 1. Eliminating Waterfalls（CRITICAL）

非同期処理の直列化を避ける。

- **async-cheap-condition-before-await**: awaitの前に安価な同期チェックを行う
- **async-defer-await**: awaitは実際に使うブランチの中へ移動する
- **async-parallel**: 独立した処理は `Promise.all()` で並列化する
- **async-dependencies**: 部分的な依存には `better-all` を使う
- **async-api-routes**: APIルートでは Promise を早めに開始し、awaitは後回しにする
- **async-suspense-boundaries**: `<Suspense>` でコンテンツをストリーミングする

## 2. Bundle Size Optimization（CRITICAL）

バンドルサイズを削減する。

- **bundle-barrel-imports**: barrel ファイル経由のインポートを避け、直接インポートする
- **bundle-dynamic-imports**: 重いコンポーネントは `next/dynamic` で遅延ロードする
- **bundle-defer-third-party**: analytics/logging はハイドレーション後にロードする
- **bundle-conditional**: 機能が有効な時だけモジュールをロードする
- **bundle-preload**: ホバー/フォーカス時にプリロードして体感速度を上げる

## 3. Server-Side Performance（HIGH）

サーバー側の処理を最適化する。

- **server-auth-actions**: Server Actions も API ルートと同様に認証する
- **server-cache-react**: リクエスト単位の重複排除に `React.cache()` を使う
- **server-cache-lru**: リクエスト横断のキャッシュに LRU キャッシュを使う
- **server-dedup-props**: RSC の props で重複シリアライズを避ける
- **server-hoist-static-io**: フォント・ロゴ等の静的 I/O はモジュールレベルに移す
- **server-no-shared-module-state**: RSC/SSR でモジュールレベルの可変状態を避ける
- **server-serialization**: クライアントコンポーネントへ渡すデータを最小化する
- **server-parallel-fetching**: コンポーネントを並列フェッチできる構造に変える
- **server-parallel-nested-fetching**: ネストしたフェッチは `Promise.all` でチェーンする
- **server-after-nonblocking**: ノンブロッキング処理には `after()` を使う

## 4. Client-Side Data Fetching（MEDIUM-HIGH）

クライアント側のデータ取得を最適化する。

- **client-swr-dedup**: SWR でリクエストの自動重複排除を行う
- **client-event-listeners**: グローバルイベントリスナーを重複登録しない
- **client-passive-event-listeners**: スクロール系リスナーは `passive` オプションを使う
- **client-localstorage-schema**: localStorage データはバージョン管理し最小化する

## 5. Re-render Optimization（MEDIUM）

不要な再レンダリングを削減する。

- **rerender-defer-reads**: コールバック内でしか使わない state を購読しない
- **rerender-memo**: 重い処理はメモ化コンポーネントに切り出す
- **rerender-memo-with-default-value**: 非プリミティブなデフォルト props はホイストする
- **rerender-dependencies**: effect の依存にはプリミティブ値を使う
- **rerender-derived-state**: 生の値ではなく派生した boolean を購読する
- **rerender-derived-state-no-effect**: effect ではなくレンダー中に state を派生させる
- **rerender-functional-setstate**: 安定したコールバックには関数型 setState を使う
- **rerender-lazy-state-init**: 重い初期値は `useState` に関数を渡す
- **rerender-simple-expression-in-memo**: 単純なプリミティブに memo は不要
- **rerender-split-combined-hooks**: 独立した依存を持つフックは分割する
- **rerender-move-effect-to-event**: インタラクションのロジックはイベントハンドラへ
- **rerender-transitions**: 緊急でない更新は `startTransition` を使う
- **rerender-use-deferred-value**: 重いレンダリングは `useDeferredValue` で遅延させる
- **rerender-use-ref-transient-values**: 頻繁に変わる一時的な値は ref を使う
- **rerender-no-inline-components**: コンポーネント内でコンポーネントを定義しない

## 6. Rendering Performance（MEDIUM）

レンダリング処理を効率化する。

- **rendering-animate-svg-wrapper**: SVG 要素ではなく div ラッパーをアニメーションする
- **rendering-content-visibility**: 長いリストに `content-visibility` を使う
- **rendering-hoist-jsx**: 静的な JSX はコンポーネント外に切り出す
- **rendering-svg-precision**: SVG 座標の精度を落とす
- **rendering-hydration-no-flicker**: クライアント専用データはインラインスクリプトで渡す
- **rendering-hydration-suppress-warning**: 意図的な不一致は警告を抑制する
- **rendering-activity**: 表示/非表示の切り替えに `Activity` コンポーネントを使う
- **rendering-conditional-render**: 条件レンダリングは `&&` より三項演算子を使う
- **rendering-usetransition-loading**: ローディング状態には `useTransition` を優先する
- **rendering-resource-hints**: React DOM のリソースヒントでプリロードする
- **rendering-script-defer-async**: script タグは `defer` または `async` を使う

## 7. JavaScript Performance（LOW-MEDIUM）

JS の実行効率を改善する。

- **js-batch-dom-css**: CSS 変更はクラスや cssText でまとめて適用する
- **js-index-maps**: 繰り返し検索には Map を構築する
- **js-cache-property-access**: ループ内でオブジェクトプロパティをキャッシュする
- **js-cache-function-results**: 関数結果をモジュールレベルの Map でキャッシュする
- **js-cache-storage**: localStorage/sessionStorage の読み取りをキャッシュする
- **js-combine-iterations**: 複数の filter/map を1ループにまとめる
- **js-length-check-first**: 重い比較の前に配列長チェックを行う
- **js-early-exit**: 関数は早期リターンする
- **js-hoist-regexp**: RegExp 生成をループの外に出す
- **js-min-max-loop**: min/max は sort より loop で求める
- **js-set-map-lookups**: O(1) 検索に Set/Map を使う
- **js-tosorted-immutable**: イミュータブルな sort には `toSorted()` を使う
- **js-flatmap-filter**: map と filter は `flatMap` で1パスにまとめる
- **js-request-idle-callback**: 重要でない処理は `requestIdleCallback` で遅延させる

## 8. Advanced Patterns（LOW）

高度な実装パターン。

- **advanced-effect-event-deps**: `useEffectEvent` の結果を effect の依存に入れない
- **advanced-event-handler-refs**: イベントハンドラを ref に格納する
- **advanced-init-once**: アプリ初期化は1回だけ実行する
- **advanced-use-latest**: 安定したコールバック ref には `useLatest` を使う
