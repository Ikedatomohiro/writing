import { NextRequest, NextResponse } from "next/server";
import { put, head } from "@vercel/blob";
import { validateRequest, parseJsonBody } from "@/lib/api/request-guard";
import { PublishArticleSchema } from "@/lib/api/schemas";
import type { z } from "zod";

type PublishRequestBody = z.infer<typeof PublishArticleSchema>;

function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const key = authHeader.slice(7);
  return key === process.env.PUBLISH_API_KEY;
}

function buildFrontmatter(body: PublishRequestBody): string {
  const date = new Date().toISOString().split("T")[0];
  const tags = body.tags ?? [];
  const tagsStr = `[${tags.map((t) => `"${t}"`).join(", ")}]`;

  const lines = [
    "---",
    `title: "${body.title}"`,
    `description: "${body.description ?? ""}"`,
    `date: "${date}"`,
    `category: "${body.category}"`,
    `tags: ${tagsStr}`,
  ];

  if (body.thumbnail) {
    lines.push(`thumbnail: "${body.thumbnail}"`);
  }

  lines.push("published: true", "---");
  return lines.join("\n");
}

/**
 * MDXで特殊扱いされる文字をエスケープする。
 * コードブロック内はそのまま保持する。
 */
function escapeMdxSpecialChars(content: string): string {
  // 1. 複数行HTMLコメントを丸ごと削除（メタ情報コメント等）
  let escaped = content.replace(/<!--[\s\S]*?-->/g, "");

  // 2. コードブロック外の中括弧をエスケープ
  const parts = escaped.split(/(```[\s\S]*?```)/g);
  escaped = parts
    .map((part, i) => {
      // 奇数インデックスはコードブロック内 → そのまま
      if (i % 2 === 1) return part;
      // コードブロック外 → 中括弧をエスケープ
      return part.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
    })
    .join("");

  return escaped;
}

async function blobExists(blobPath: string): Promise<boolean> {
  try {
    await head(blobPath);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: "Unauthorized: invalid or missing API key" },
      { status: 401 }
    );
  }

  const guardError = validateRequest(request);
  if (guardError) return guardError;

  const { data: body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = PublishArticleSchema.safeParse(body);

  if (!parsed.success) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const missingFields = (parsed.error.issues as any[])
      .filter((issue) => issue.code === "invalid_type" && issue.received === "undefined")
      .map((issue) => issue.path[0]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const categoryIssue = parsed.error.issues.find(
      (issue) => issue.path.includes("category")
    );
    if (categoryIssue) {
      return NextResponse.json(
        { error: "Invalid category: must be one of asset, tech, health" },
        { status: 400 }
      );
    }

    const slugIssue = parsed.error.issues.find(
      (issue) => issue.path.includes("slug") && issue.code === "invalid_format"
    );
    if (slugIssue) {
      return NextResponse.json(
        { error: "Invalid slug: must contain only lowercase alphanumeric characters and hyphens" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { category, slug } = parsed.data;
  const blobPath = `content/${category}/${slug}.mdx`;

  try {
    if (await blobExists(blobPath)) {
      return NextResponse.json(
        { error: `Conflict: article with slug "${slug}" already exists` },
        { status: 409 }
      );
    }
  } catch (e) {
    console.error("[publish] blobExists check failed:", e);
    // 存在チェック失敗時は続行（上書き許容）
  }

  const frontmatter = buildFrontmatter(parsed.data);
  const escapedContent = escapeMdxSpecialChars(parsed.data.content);
  const fileContent = `${frontmatter}\n\n${escapedContent}\n`;

  try {
    await put(blobPath, fileContent, {
      access: "public",
      addRandomSuffix: false,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[publish] Blob put failed:", message);
    return NextResponse.json(
      { error: "Failed to save article to storage", detail: message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      slug,
      url: `/${category}/${slug}`,
    },
    { status: 201 }
  );
}
