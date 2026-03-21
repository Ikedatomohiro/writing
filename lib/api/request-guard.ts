import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_SIZE = 100 * 1024; // 100KB

export function validateRequest(request: NextRequest): NextResponse | null {
  const method = request.method;
  if (method === "POST" || method === "PUT") {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large. Maximum size is 100KB" },
        { status: 413 }
      );
    }
  }

  return null;
}

export async function parseJsonBody(
  request: NextRequest
): Promise<{ data?: unknown; error?: NextResponse }> {
  try {
    const data = await request.json();
    return { data };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      ),
    };
  }
}
