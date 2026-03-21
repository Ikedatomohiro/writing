import { NextRequest, NextResponse } from "next/server";
import { VercelBlobBackend } from "@/lib/articles/backend";
import { ArticleService } from "@/lib/articles/service";
import { requireAuth } from "@/lib/auth/api-auth";
import { validateRequest, parseJsonBody } from "@/lib/api/request-guard";
import { UpdateArticleSchema } from "@/lib/api/schemas";

function getService() {
  return new ArticleService(new VercelBlobBackend());
}

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const service = getService();
  const article = await service.getArticle(id);

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth();
  if (authError) return authError;

  const guardError = validateRequest(request);
  if (guardError) return guardError;

  const { id } = await params;
  const { data: body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = UpdateArticleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const service = getService();
  const article = await service.updateArticle(id, parsed.data);

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const service = getService();
  const deleted = await service.deleteArticle(id);

  if (!deleted) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
