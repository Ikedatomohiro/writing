import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const TEST_API_KEY = "test-api-key-12345";

const mockExists = vi.fn();
const mockWriteFile = vi.fn();
const mockMkdir = vi.fn();

vi.mock("fs", () => ({
  default: {
    promises: {
      access: (...args: unknown[]) => mockExists(...args),
      writeFile: (...args: unknown[]) => mockWriteFile(...args),
      mkdir: (...args: unknown[]) => mockMkdir(...args),
    },
  },
  promises: {
    access: (...args: unknown[]) => mockExists(...args),
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
    mkdir: (...args: unknown[]) => mockMkdir(...args),
  },
}));

function createRequest(
  body: Record<string, unknown>,
  apiKey?: string
): NextRequest {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }
  return new NextRequest("http://localhost:3000/api/publish", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const validBody = {
  title: "テスト記事",
  content: "# テスト\n\nこれはテスト記事です。",
  category: "tech",
  slug: "test-article",
  tags: ["TypeScript", "テスト"],
  description: "テスト記事の概要",
};

describe("POST /api/publish", () => {
  beforeEach(() => {
    vi.stubEnv("PUBLISH_API_KEY", TEST_API_KEY);
    mockExists.mockRejectedValue(new Error("ENOENT"));
    mockWriteFile.mockResolvedValue(undefined);
    mockMkdir.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("returns 401 when no authorization header is provided", async () => {
    const { POST } = await import("./route");
    const request = createRequest(validBody);
    const response = await POST(request);

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it("returns 401 when API key is invalid", async () => {
    const { POST } = await import("./route");
    const request = createRequest(validBody, "wrong-key");
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    const { POST } = await import("./route");
    const request = createRequest({ title: "Only title" }, TEST_API_KEY);
    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it("returns 400 when category is invalid", async () => {
    const { POST } = await import("./route");
    const request = createRequest(
      { ...validBody, category: "invalid" },
      TEST_API_KEY
    );
    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("category");
  });

  it("returns 400 when slug format is invalid", async () => {
    const { POST } = await import("./route");
    const request = createRequest(
      { ...validBody, slug: "invalid slug!@#" },
      TEST_API_KEY
    );
    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("slug");
  });

  it("returns 409 when slug already exists", async () => {
    mockExists.mockResolvedValue(undefined);

    const { POST } = await import("./route");
    const request = createRequest(validBody, TEST_API_KEY);
    const response = await POST(request);

    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it("returns 201 and creates MDX file on success", async () => {
    const { POST } = await import("./route");
    const request = createRequest(validBody, TEST_API_KEY);
    const response = await POST(request);

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.slug).toBe("test-article");
    expect(json.url).toBe("/tech/test-article");

    expect(mockWriteFile).toHaveBeenCalledOnce();
    const writtenContent = mockWriteFile.mock.calls[0][1] as string;
    expect(writtenContent).toContain("title: \"テスト記事\"");
    expect(writtenContent).toContain("category: \"tech\"");
    expect(writtenContent).toContain("tags: [\"TypeScript\", \"テスト\"]");
    expect(writtenContent).toContain("published: true");
    expect(writtenContent).toContain("# テスト");
  });

  it("includes thumbnail in frontmatter when provided", async () => {
    const { POST } = await import("./route");
    const request = createRequest(
      { ...validBody, thumbnail: "https://example.com/image.png" },
      TEST_API_KEY
    );
    const response = await POST(request);

    expect(response.status).toBe(201);
    const writtenContent = mockWriteFile.mock.calls[0][1] as string;
    expect(writtenContent).toContain(
      'thumbnail: "https://example.com/image.png"'
    );
  });

  it("omits thumbnail from frontmatter when not provided", async () => {
    const { POST } = await import("./route");
    const request = createRequest(validBody, TEST_API_KEY);
    await POST(request);

    const writtenContent = mockWriteFile.mock.calls[0][1] as string;
    expect(writtenContent).not.toContain("thumbnail:");
  });
});
