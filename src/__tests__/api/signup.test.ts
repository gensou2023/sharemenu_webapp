import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/supabase", () => ({ createAdminClient: vi.fn() }));
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed_password") },
}));
vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 2, limit: 3 }),
}));

import { createAdminClient } from "@/lib/supabase";
import { POST } from "@/app/api/signup/route";

const mockCreateAdminClient = vi.mocked(createAdminClient);

function createRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function mockSupabase(overrides: {
  existingUser?: unknown;
  insertData?: unknown;
  insertError?: unknown;
} = {}) {
  const client = {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: overrides.existingUser ?? null,
                error: overrides.existingUser ? null : { code: "PGRST116" },
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: overrides.insertData ?? null,
                error: overrides.insertError ?? null,
              }),
            }),
          }),
        };
      }
      return {};
    }),
  };
  mockCreateAdminClient.mockReturnValue(client as never);
  return client;
}

describe("POST /api/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(createRequest({ name: "Test" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("必須");
  });

  it("returns 400 for missing name", async () => {
    const res = await POST(createRequest({ email: "a@b.com", password: "pass1234" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const res = await POST(createRequest({ name: "Test", email: "invalid", password: "pass1234" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("メールアドレスの形式");
  });

  it("returns 400 for short password", async () => {
    const res = await POST(createRequest({ name: "Test", email: "a@b.com", password: "short" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("8文字以上");
  });

  it("returns 400 for password without both letters and numbers", async () => {
    const res = await POST(createRequest({ name: "Test", email: "a@b.com", password: "onlyletters" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("英字と数字");
  });

  it("returns 400 for name over 100 characters", async () => {
    const res = await POST(createRequest({ name: "a".repeat(101), email: "a@b.com", password: "pass1234" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("100文字");
  });

  it("returns 409 for duplicate email", async () => {
    mockSupabase({ existingUser: { id: "existing-user" } });
    const res = await POST(createRequest({ name: "Test", email: "a@b.com", password: "pass1234" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("既に登録");
  });

  it("returns 200 on successful registration", async () => {
    const newUser = { id: "new-user-1", email: "a@b.com", name: "Test", role: "user" };
    mockSupabase({ insertData: newUser });
    const res = await POST(createRequest({ name: "Test", email: "a@b.com", password: "pass1234" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.id).toBe("new-user-1");
    expect(body.message).toContain("作成");
  });

  it("returns 500 on insert error", async () => {
    mockSupabase({ insertError: { message: "insert failed" } });
    const res = await POST(createRequest({ name: "Test", email: "a@b.com", password: "pass1234" }));
    expect(res.status).toBe(500);
  });
});
