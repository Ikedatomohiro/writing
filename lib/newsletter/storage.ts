import { head, put } from "@vercel/blob";
import type { Subscriber, SubscribersData } from "./types";
import { createEmptySubscribersData } from "./types";

const BLOB_PATH = "newsletter/subscribers.json";

export interface AddSubscriberResult {
  success: boolean;
  subscriber?: Subscriber;
  error?: "duplicate";
}

export async function loadSubscribers(): Promise<SubscribersData> {
  try {
    const blob = await head(BLOB_PATH);
    const response = await fetch(blob.url);
    const data: SubscribersData = await response.json();
    return data;
  } catch {
    return createEmptySubscribersData();
  }
}

export async function saveSubscribers(data: SubscribersData): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(data, null, 2), {
    access: "public",
    // TODO: Migrate to Supabase for proper private storage of PII
    // @vercel/blob v2.0.0 only supports public access
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

export async function addSubscriber(
  email: string
): Promise<AddSubscriberResult> {
  const data = await loadSubscribers();

  const isDuplicate = data.subscribers.some((s) => s.email === email);
  if (isDuplicate) {
    return { success: false, error: "duplicate" };
  }

  const subscriber: Subscriber = {
    id: crypto.randomUUID(),
    email,
    createdAt: new Date().toISOString(),
  };

  data.subscribers.push(subscriber);
  data.totalCount = data.subscribers.length;

  await saveSubscribers(data);

  return { success: true, subscriber };
}
