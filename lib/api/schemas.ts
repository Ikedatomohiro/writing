import { z } from "zod";

export const CreateArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  content: z.string().max(100000).default(""),
  keywords: z.array(z.string().max(50)).max(20).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const UpdateArticleSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().max(100000).optional(),
  keywords: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const ArticleQuerySchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  searchQuery: z.string().max(200).optional(),
});

export const PublishArticleSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(200000),
  category: z.enum(["asset", "tech", "health"]),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  tags: z.array(z.string().max(50)).max(20).default([]),
  description: z.string().max(1000).default(""),
  thumbnail: z.string().url().max(500).optional(),
});

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;
export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>;
export type ArticleQueryInput = z.infer<typeof ArticleQuerySchema>;
export type PublishArticleInput = z.infer<typeof PublishArticleSchema>;
