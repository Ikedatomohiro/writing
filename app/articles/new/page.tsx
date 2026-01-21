"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@chakra-ui/react";
import { ArticleForm } from "@/components/articles";
import { createArticle } from "@/lib/articles/storage";
import type { ArticleStatus } from "@/lib/articles/types";

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data: {
    title: string;
    content: string;
    keywords: string[];
    status: ArticleStatus;
  }) => {
    setIsSubmitting(true);
    const article = createArticle(data);
    router.push(`/articles/${article.id}`);
  };

  const handleCancel = () => {
    router.push("/articles");
  };

  return (
    <Container maxW="container.lg" py={8}>
      <ArticleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </Container>
  );
}
