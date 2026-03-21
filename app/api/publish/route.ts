import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
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

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
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
  const contentDir = path.join(process.cwd(), "content", category);
  const filePath = path.join(contentDir, `${slug}.mdx`);

  if (await fileExists(filePath)) {
    return NextResponse.json(
      { error: `Conflict: article with slug "${slug}" already exists` },
      { status: 409 }
    );
  }

  const frontmatter = buildFrontmatter(parsed.data);
  const fileContent = `${frontmatter}\n\n${parsed.data.content}\n`;

  await fs.mkdir(contentDir, { recursive: true });
  await fs.writeFile(filePath, fileContent, "utf-8");

  return NextResponse.json(
    {
      success: true,
      slug,
      url: `/${category}/${slug}`,
    },
    { status: 201 }
  );
}
