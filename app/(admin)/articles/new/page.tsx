"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleForm } from "@/components/articles";
import { createArticle } from "@/lib/articles/storage";
import type { ArticleCreateInput } from "@/lib/content/repository";

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ArticleCreateInput) => {
    setIsSubmitting(true);
    try {
      const article = await createArticle(data);
      router.push(`/articles/${article.slug}`);
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
