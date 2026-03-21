import { NextRequest, NextResponse } from "next/server";
import { VercelBlobBackend } from "@/lib/articles/backend";
import { ArticleService } from "@/lib/articles/service";
import { requireAuth } from "@/lib/auth/api-auth";
import { validateRequest, parseJsonBody } from "@/lib/api/request-guard";
import {
  CreateArticleSchema,
  ArticleQuerySchema,
} from "@/lib/api/schemas";

function getService() {
  return new ArticleService(new VercelBlobBackend());
}

export async function GET(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const searchParams = request.nextUrl.searchParams;
  const rawQuery: Record<string, string> = {};

  for (const key of ["status", "sortBy", "sortOrder", "searchQuery"]) {
    const value = searchParams.get(key);
    if (value) {
      rawQuery[key] = value;
    }
  }

  const parsed = ArticleQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const service = getService();
  const articles = await service.getArticles(parsed.data);

  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const guardError = validateRequest(request);
  if (guardError) return guardError;

  const { data: body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = CreateArticleSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const errorMessage =
      firstIssue.path.includes("title") && firstIssue.code === "invalid_type"
        ? "Title is required"
        : firstIssue.message === "Title is required"
          ? "Title is required"
          : firstIssue.path.includes("content") &&
              firstIssue.code === "invalid_type"
            ? "Content must be a string"
            : firstIssue.message;

    return NextResponse.json(
      { error: errorMessage, details: parsed.error.issues },
      { status: 400 }
    );
  }

  const service = getService();
  const article = await service.createArticle(parsed.data);

  return NextResponse.json(article, { status: 201 });
}
