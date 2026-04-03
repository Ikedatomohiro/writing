import type { Article } from "@/lib/content/types";
import type {
  ArticleCreateInput,
  ArticleUpdateInput,
} from "@/lib/content/repository";

const API_BASE = "/api/articles";

export async function getArticles(): Promise<Article[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }
  return response.json();
}

export async function getArticle(slug: string): Promise<Article | null> {
  const response = await fetch(`${API_BASE}/${slug}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Failed to fetch article");
  }
  return response.json();
}

export async function createArticle(
  input: ArticleCreateInput
): Promise<Article> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create article");
  }
  return response.json();
}

export async function updateArticle(
  slug: string,
  input: ArticleUpdateInput
): Promise<Article | null> {
  const response = await fetch(`${API_BASE}/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Failed to update article");
  }
  return response.json();
}

export async function deleteArticle(slug: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/${slug}`, {
    method: "DELETE",
  });
  if (response.status === 404) {
    return false;
  }
  if (!response.ok) {
    throw new Error("Failed to delete article");
  }
  return true;
}
