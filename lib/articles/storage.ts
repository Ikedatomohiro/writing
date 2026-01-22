import type {
  Article,
  ArticleCreateInput,
  ArticleUpdateInput,
  ArticleListOptions,
} from "./types";

const API_BASE = "/api/articles";

function buildQueryString(options: ArticleListOptions): string {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  if (options.sortBy) params.set("sortBy", options.sortBy);
  if (options.sortOrder) params.set("sortOrder", options.sortOrder);
  if (options.searchQuery) params.set("searchQuery", options.searchQuery);
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getArticles(
  options: ArticleListOptions = {}
): Promise<Article[]> {
  const response = await fetch(`${API_BASE}${buildQueryString(options)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }
  return response.json();
}

export async function getArticle(id: string): Promise<Article | null> {
  const response = await fetch(`${API_BASE}/${id}`);
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
  id: string,
  input: ArticleUpdateInput
): Promise<Article | null> {
  const response = await fetch(`${API_BASE}/${id}`, {
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

export async function deleteArticle(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/${id}`, {
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
