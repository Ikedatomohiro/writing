import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { validateRequest, parseJsonBody } from "@/lib/api/request-guard";
import { CreateArticleSchema } from "@/lib/api/schemas";
import {
  getAllArticlesForAdmin,
  createArticle,
} from "@/lib/content/repository";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const articles = await getAllArticlesForAdmin();
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
    return NextResponse.json(
      { error: firstIssue.message, details: parsed.error.issues },
      { status: 400 }
    );
  }

  const article = await createArticle(parsed.data);

  if (!article) {
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }

  return NextResponse.json(article, { status: 201 });
}
