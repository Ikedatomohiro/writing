export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface SubscribersData {
  subscribers: Subscriber[];
  totalCount: number;
}

export function createEmptySubscribersData(): SubscribersData {
  return {
    subscribers: [],
    totalCount: 0,
  };
}
