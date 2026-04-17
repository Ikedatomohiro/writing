"use client";

import { useParams } from "next/navigation";
import { XSeriesEditor } from "@/components/x/XSeriesEditor";

export default function XDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="max-w-3xl">
      <XSeriesEditor seriesId={id} />
    </div>
  );
}
