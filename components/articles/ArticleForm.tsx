"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Textarea,
  VStack,
  HStack,
  Badge,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import type { Article, ArticleStatus } from "@/lib/articles/types";

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: {
    title: string;
    content: string;
    keywords: string[];
    status: ArticleStatus;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ArticleForm({
  article,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ArticleFormProps) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [keywords, setKeywords] = useState<string[]>(article?.keywords ?? []);
  const [keywordInput, setKeywordInput] = useState("");
  const [status, setStatus] = useState<ArticleStatus>(
    article?.status ?? "draft"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, keywords, status });
  };

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack gap={6} align="stretch">
        <Heading size="lg">{article ? "記事を編集" : "新規記事作成"}</Heading>

        <Field.Root>
          <Field.Label>タイトル</Field.Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="記事のタイトルを入力"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>本文</Field.Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="記事の本文を入力"
            rows={15}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>キーワード</Field.Label>
          <HStack>
            <Input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              placeholder="キーワードを入力してEnter"
            />
            <Button type="button" onClick={addKeyword} variant="outline">
              追加
            </Button>
          </HStack>
          {keywords.length > 0 && (
            <HStack mt={2} flexWrap="wrap" gap={2}>
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="solid" size="lg">
                  <HStack gap={1}>
                    <Text>{keyword}</Text>
                    <IconButton
                      aria-label={`${keyword}を削除`}
                      size="2xs"
                      variant="ghost"
                      onClick={() => removeKeyword(keyword)}
                    >
                      <LuX />
                    </IconButton>
                  </HStack>
                </Badge>
              ))}
            </HStack>
          )}
        </Field.Root>

        <Field.Root>
          <Field.Label>ステータス</Field.Label>
          <HStack gap={2}>
            {(["draft", "published", "archived"] as const).map((s) => (
              <Button
                key={s}
                type="button"
                variant={status === s ? "solid" : "outline"}
                onClick={() => setStatus(s)}
                size="sm"
              >
                {s === "draft" && "下書き"}
                {s === "published" && "公開"}
                {s === "archived" && "アーカイブ"}
              </Button>
            ))}
          </HStack>
        </Field.Root>

        <Flex gap={3} justify="flex-end">
          <Button type="button" variant="ghost" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit" colorPalette="blue" loading={isSubmitting}>
            {article ? "更新" : "作成"}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
