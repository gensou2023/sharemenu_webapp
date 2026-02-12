import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { withAdmin } from "@/lib/admin-auth";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/auth";
const mockAuth = vi.mocked(auth);

function createRequest(url = "http://localhost/api/admin/test") {
  return new NextRequest(url);
}

function createContext(params: Record<string, string> = {}) {
  return { params: Promise.resolve(params) };
}

describe("withAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const handler = vi.fn();
    const wrapped = withAdmin(handler);
    const res = await wrapped(createRequest(), createContext());

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("権限がありません");
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns 403 when user role is not admin", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "1", email: "user@test.com", name: "User", role: "user" },
      expires: "",
    });

    const handler = vi.fn();
    const wrapped = withAdmin(handler);
    const res = await wrapped(createRequest(), createContext());

    expect(res.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it("calls handler when user is admin", async () => {
    const session = {
      user: { id: "1", email: "admin@test.com", name: "Admin", role: "admin" },
      expires: "",
    };
    mockAuth.mockResolvedValue(session);

    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const wrapped = withAdmin(handler);
    const req = createRequest();
    const ctx = createContext();
    await wrapped(req, ctx);

    expect(handler).toHaveBeenCalledWith(req, session, ctx);
  });

  it("passes route context with params to handler", async () => {
    const session = {
      user: { id: "1", email: "admin@test.com", name: "Admin", role: "admin" },
      expires: "",
    };
    mockAuth.mockResolvedValue(session);

    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const wrapped = withAdmin(handler);
    const ctx = createContext({ id: "user-123" });
    await wrapped(createRequest(), ctx);

    expect(handler).toHaveBeenCalled();
    const passedContext = handler.mock.calls[0][2];
    const params = await passedContext.params;
    expect(params.id).toBe("user-123");
  });
});
