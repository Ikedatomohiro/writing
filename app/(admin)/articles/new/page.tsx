"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleForm } from "@/components/articles";
import { createArticle } from "@/lib/articles/storage";
import type { ArticleStatus } from "@/lib/articles/types";

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    keywords: string[];
    status: ArticleStatus;
  }) => {
    setIsSubmitting(true);
    try {
      const article = await createArticle(data);
      router.push(`/articles/${article.id}`);
    } catch (error) {
      console.error("Failed to create article:", error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/articles");
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <ArticleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
