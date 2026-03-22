"use client";

import { useEffect, useState } from "react";
import type { RankingResponse } from "@/lib/analytics/types";

export function AccessRanking() {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics/ranking")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch(() => {
        setError("ランキングの取得に失敗しました");
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6">
      <h2 className="text-lg font-headline font-bold text-on-surface mb-4">
        Access Ranking
      </h2>

      {isLoading && (
        <p className="text-sm text-on-surface-variant">読み込み中...</p>
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      {data && data.ranking.length === 0 && (
        <p className="text-sm text-on-surface-variant">データがありません</p>
      )}

      {data && data.ranking.length > 0 && (
        <>
          <div className="space-y-3">
            {data.ranking.map((item, index) => (
              <div
                key={item.path}
                className="flex items-center gap-3"
              >
                <span className="text-sm font-bold text-on-surface-variant w-6 text-right">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-on-surface hover:text-primary truncate block"
                  >
                    {item.title}
                  </a>
                </div>
                <span className="text-sm font-semibold text-on-surface-variant whitespace-nowrap">
                  {item.pageViews.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-on-surface-variant mt-4">
            {data.period.startDate} 〜 {data.period.endDate}
          </p>
        </>
      )}
    </div>
  );
}
