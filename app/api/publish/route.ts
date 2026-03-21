import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const VALID_CATEGORIES = ["asset", "tech", "health"] as const;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Category = (typeof VALID_CATEGORIES)[number];

interface PublishRequestBody {
  title: string;
  content: string;
  category: Category;
  slug: string;
  tags?: string[];
  description?: string;
  thumbnail?: string;
}

function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const key = authHeader.slice(7);
  return key === process.env.PUBLISH_API_KEY;
}

function validateRequiredFields(
  body: Record<string, unknown>
): string | null {
  const required = ["title", "content", "category", "slug"];
  const missing = required.filter(
    (field) => !body[field] || typeof body[field] !== "string"
  );
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`;
  }
  return null;
}

function validateCategory(category: string): boolean {
  return VALID_CATEGORIES.includes(category as Category);
}

function validateSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
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

  const body = (await request.json()) as Record<string, unknown>;

  const fieldError = validateRequiredFields(body);
  if (fieldError) {
    return NextResponse.json({ error: fieldError }, { status: 400 });
  }

  const { category, slug } = body as { category: string; slug: string };

  if (!validateCategory(category)) {
    return NextResponse.json(
      { error: `Invalid category: must be one of ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!validateSlug(slug)) {
    return NextResponse.json(
      { error: "Invalid slug: must contain only lowercase alphanumeric characters and hyphens" },
      { status: 400 }
    );
  }

  const contentDir = path.join(process.cwd(), "content", category);
  const filePath = path.join(contentDir, `${slug}.mdx`);

  if (await fileExists(filePath)) {
    return NextResponse.json(
      { error: `Conflict: article with slug "${slug}" already exists` },
      { status: 409 }
    );
  }

  const typedBody = body as unknown as PublishRequestBody;
  const frontmatter = buildFrontmatter(typedBody);
  const fileContent = `${frontmatter}\n\n${typedBody.content}\n`;

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
