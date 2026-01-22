import { NextRequest, NextResponse } from "next/server";
import { VercelBlobBackend } from "@/lib/articles/backend";
import { ArticleService } from "@/lib/articles/service";
import type { ArticleListOptions, ArticleStatus } from "@/lib/articles/types";

function getService() {
  return new ArticleService(new VercelBlobBackend());
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const options: ArticleListOptions = {};

  const status = searchParams.get("status");
  if (status) {
    options.status = status as ArticleStatus;
  }

  const sortBy = searchParams.get("sortBy");
  if (sortBy) {
    options.sortBy = sortBy as ArticleListOptions["sortBy"];
  }

  const sortOrder = searchParams.get("sortOrder");
  if (sortOrder) {
    options.sortOrder = sortOrder as ArticleListOptions["sortOrder"];
  }

  const searchQuery = searchParams.get("searchQuery");
  if (searchQuery) {
    options.searchQuery = searchQuery;
  }

  const service = getService();
  const articles = await service.getArticles(options);

  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (body.content !== undefined && typeof body.content !== "string") {
    return NextResponse.json(
      { error: "Content must be a string" },
      { status: 400 }
    );
  }

  const service = getService();
  const article = await service.createArticle({
    title: body.title,
    content: body.content ?? "",
    keywords: body.keywords ?? [],
    status: body.status ?? "draft",
  });

  return NextResponse.json(article, { status: 201 });
}
