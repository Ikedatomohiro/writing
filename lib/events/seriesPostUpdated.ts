/**
 * モーダル編集（ThreadsSeriesEditor / XSeriesEditor）で投稿本文の保存に成功したことを、
 * 一覧ページ（/threads, /x）へ通知するための軽量なイベントチャンネル。
 *
 * 一覧ページとモーダルは Next.js の並行ルート（children / @panel）で別々にマウントされており
 * 共通の状態を持たないため、window の CustomEvent を使って疎結合に同期する。
 *
 * 必ず「保存APIが成功した後」にのみ emit すること。保存失敗時に emit すると
 * 一覧側が未保存の内容で誤って更新されてしまう。
 */

export interface SeriesPostUpdatedDetail {
  seriesId: string;
  postId: string;
  text: string;
  /** SnsPost の type。Xの投稿には type がないため省略可能。 */
  type?: string;
}

interface Channel<T> {
  emit(detail: T): void;
  subscribe(handler: (detail: T) => void): () => void;
}

function createChannel<T>(eventName: string): Channel<T> {
  return {
    emit(detail: T) {
      if (typeof window === "undefined") return;
      window.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
    },
    subscribe(handler: (detail: T) => void) {
      if (typeof window === "undefined") return () => {};
      const listener = (event: Event) => {
        handler((event as CustomEvent<T>).detail);
      };
      window.addEventListener(eventName, listener);
      return () => window.removeEventListener(eventName, listener);
    },
  };
}

export const threadsPostUpdatedChannel = createChannel<SeriesPostUpdatedDetail>(
  "threads-series-post-updated"
);

export const xPostUpdatedChannel = createChannel<SeriesPostUpdatedDetail>(
  "x-series-post-updated"
);
