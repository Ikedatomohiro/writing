export interface RankingItem {
  path: string;
  title: string;
  pageViews: number;
}

export interface RankingResponse {
  ranking: RankingItem[];
  period: {
    startDate: string;
    endDate: string;
  };
}
