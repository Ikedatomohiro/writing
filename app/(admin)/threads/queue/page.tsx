import { redirect } from "next/navigation";

/**
 * /threads/queue は /threads?tab=queued にリダイレクト
 * (V-M4: エラー表示だけの画面を廃止)
 */
export default function ThreadsQueuePage() {
  redirect("/threads?tab=queued");
}
