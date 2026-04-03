import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { validateRequest, parseJsonBody } from "@/lib/api/request-guard";
import { UpdateArticleSchema } from "@/lib/api/schemas";
import {
  getArticleBySlug,
  updateArticle,
  deleteArticle,
} from "@/lib/content/repository";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { slug } = await params;
  const article = await getArticleBySlug(slug);

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

  const { slug } = await params;
  const { data: body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = UpdateArticleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const article = await updateArticle(slug, parsed.data);

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { slug } = await params;
  const deleted = await deleteArticle(slug);

  if (!deleted) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
