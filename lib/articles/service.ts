import type { StorageBackend } from "./backend";
import type {
  Article,
  ArticleCreateInput,
  ArticleUpdateInput,
  ArticleListOptions,
} from "./types";

export class ArticleService {
  constructor(private backend: StorageBackend) {}

  async getArticles(options: ArticleListOptions = {}): Promise<Article[]> {
    const { status, sortBy = "createdAt", sortOrder = "desc", searchQuery } = options;
    const data = await this.backend.load();
    let articles = data.articles;

    if (status) {
      articles = articles.filter((article) => article.status === status);
    }

    if (searchQuery) {
      articles = articles.filter((article) =>
        this.matchesSearchQuery(article, searchQuery)
      );
    }

    articles.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else {
        comparison =
          new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return articles;
  }

  async getArticle(id: string): Promise<Article | null> {
    const data = await this.backend.load();
    return data.articles.find((article) => article.id === id) ?? null;
  }

  async createArticle(input: ArticleCreateInput): Promise<Article> {
    const data = await this.backend.load();
    const now = new Date().toISOString();

    const article: Article = {
      id: crypto.randomUUID(),
      title: input.title,
      content: input.content,
      keywords: input.keywords ?? [],
      status: input.status ?? "draft",
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    };

    data.articles.push(article);
    await this.backend.save(data);

    return article;
  }

  async updateArticle(
    id: string,
    input: ArticleUpdateInput
  ): Promise<Article | null> {
    const data = await this.backend.load();
    const index = data.articles.findIndex((article) => article.id === id);

    if (index === -1) {
      return null;
    }

    const existing = data.articles[index];
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

    data.articles[index] = updated;
    await this.backend.save(data);

    return updated;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const data = await this.backend.load();
    const index = data.articles.findIndex((article) => article.id === id);

    if (index === -1) {
      return false;
    }

    data.articles = data.articles.filter((article) => article.id !== id);
    await this.backend.save(data);

    return true;
  }

  private matchesSearchQuery(article: Article, query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return (
      article.title.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery) ||
      article.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
    );
  }
}
