"use client";

import { useParams } from "next/navigation";
import { ThreadsSeriesEditor } from "@/components/sns/ThreadsSeriesEditor";

export default function SnsDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="max-w-3xl">
      <ThreadsSeriesEditor seriesId={id} />
    </div>
  );
}
