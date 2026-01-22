import { NextRequest, NextResponse } from "next/server";
import { VercelBlobBackend } from "@/lib/articles/backend";
import { ArticleService } from "@/lib/articles/service";

function getService() {
  return new ArticleService(new VercelBlobBackend());
}

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const service = getService();
  const article = await service.getArticle(id);

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

  const service = getService();
  const article = await service.updateArticle(id, {
    title: body.title,
    content: body.content,
    keywords: body.keywords,
    status: body.status,
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const service = getService();
  const deleted = await service.deleteArticle(id);

  if (!deleted) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
