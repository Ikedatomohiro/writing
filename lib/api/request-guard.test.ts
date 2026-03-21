import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { validateRequest, parseJsonBody } from "./request-guard";

function createRequest(
  method: string,
  options: {
    contentType?: string;
    contentLength?: string;
    body?: string;
  } = {}
): NextRequest {
  const headers = new Headers();
  if (options.contentType) {
    headers.set("content-type", options.contentType);
  }
  if (options.contentLength) {
    headers.set("content-length", options.contentLength);
  }

  const init: RequestInit = { method, headers };
  if (options.body) {
    init.body = options.body;
  }

  return new NextRequest("http://localhost/api/test", init);
}

describe("validateRequest", () => {
  it("returns 415 when POST request has no Content-Type", () => {
    const request = createRequest("POST", { body: "{}" });
    const result = validateRequest(request);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(415);
  });

  it("returns 415 when POST request has wrong Content-Type", () => {
    const request = createRequest("POST", {
      contentType: "text/plain",
      body: "hello",
    });
    const result = validateRequest(request);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(415);
  });

  it("returns 415 when PUT request has no Content-Type", () => {
    const request = createRequest("PUT", { body: "{}" });
    const result = validateRequest(request);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(415);
  });

  it("returns 413 when content-length exceeds limit", () => {
    const request = createRequest("POST", {
      contentType: "application/json",
    });
    // happy-dom strips content-length as a forbidden header,
    // so we mock headers.get to return a large value
    const originalGet = request.headers.get.bind(request.headers);
    vi.spyOn(request.headers, "get").mockImplementation((name: string) => {
      if (name === "content-length") return "200000";
      return originalGet(name);
    });

    const result = validateRequest(request);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(413);
  });

  it("returns null for valid POST request", () => {
    const request = createRequest("POST", {
      contentType: "application/json",
      contentLength: "100",
      body: JSON.stringify({ title: "test" }),
    });
    const result = validateRequest(request);

    expect(result).toBeNull();
  });

  it("returns null for GET request without Content-Type", () => {
    const request = createRequest("GET");
    const result = validateRequest(request);

    expect(result).toBeNull();
  });

  it("accepts application/json with charset parameter", () => {
    const request = createRequest("POST", {
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({ title: "test" }),
    });
    const result = validateRequest(request);

    expect(result).toBeNull();
  });
});

describe("parseJsonBody", () => {
  it("parses valid JSON body", async () => {
    const body = { title: "test", content: "hello" };
    const request = createRequest("POST", {
      contentType: "application/json",
      body: JSON.stringify(body),
    });

    const result = await parseJsonBody(request);

    expect(result.error).toBeUndefined();
    expect(result.data).toEqual(body);
  });

  it("returns 400 error for invalid JSON", async () => {
    const request = createRequest("POST", {
      contentType: "application/json",
      body: "not valid json{{{",
    });

    const result = await parseJsonBody(request);

    expect(result.data).toBeUndefined();
    expect(result.error).not.toBeNull();
    expect(result.error!.status).toBe(400);
  });
});
