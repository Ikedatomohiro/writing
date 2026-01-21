import type {
  Article,
  ArticleCreateInput,
  ArticleUpdateInput,
  ArticleListOptions,
} from "./types";

const STORAGE_KEY = "articles";

function generateId(): string {
  return crypto.randomUUID();
}

function getStoredArticles(): Article[] {
  if (typeof window === "undefined") {
    return [];
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveArticles(articles: Article[]): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

export function getArticles(options: ArticleListOptions = {}): Article[] {
  const { status, sortBy = "createdAt", sortOrder = "desc" } = options;
  let articles = getStoredArticles();

  if (status) {
    articles = articles.filter((article) => article.status === status);
  }

  articles.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "title") {
      comparison = a.title.localeCompare(b.title);
    } else {
      comparison = new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime();
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return articles;
}

export function getArticle(id: string): Article | null {
  const articles = getStoredArticles();
  return articles.find((article) => article.id === id) ?? null;
}

export function createArticle(input: ArticleCreateInput): Article {
  const articles = getStoredArticles();
  const now = new Date().toISOString();

  const article: Article = {
    id: generateId(),
    title: input.title,
    content: input.content,
    keywords: input.keywords ?? [],
    status: input.status ?? "draft",
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
  };

  saveArticles([...articles, article]);
  return article;
}

export function updateArticle(
  id: string,
  input: ArticleUpdateInput
): Article | null {
  const articles = getStoredArticles();
  const index = articles.findIndex((article) => article.id === id);

  if (index === -1) {
    return null;
  }

  const existing = articles[index];
  const now = new Date().toISOString();

  const updated: Article = {
    ...existing,
    ...input,
    updatedAt: now,
    publishedAt:
      input.status === "published" && existing.status !== "published"
        ? now
        : existing.publishedAt,
  };

  const newArticles = [...articles];
  newArticles[index] = updated;
  saveArticles(newArticles);

  return updated;
}

export function deleteArticle(id: string): boolean {
  const articles = getStoredArticles();
  const index = articles.findIndex((article) => article.id === id);

  if (index === -1) {
    return false;
  }

  const newArticles = articles.filter((article) => article.id !== id);
  saveArticles(newArticles);
  return true;
}
