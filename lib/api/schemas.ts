import { z } from "zod";

export const CreateArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().min(1, "Description is required").max(1000),
  content: z.string().max(200000).default(""),
  category: z.enum(["asset", "tech", "health"]),
  tags: z.array(z.string().max(50)).max(20).default([]),
  thumbnail: z.string().url().max(500).optional(),
  published: z.boolean().default(false),
});

export const UpdateArticleSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).max(1000).optional(),
  content: z.string().max(200000).optional(),
  category: z.enum(["asset", "tech", "health"]).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  thumbnail: z.string().url().max(500).optional(),
  published: z.boolean().optional(),
});

export const ArticleQuerySchema = z.object({
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
