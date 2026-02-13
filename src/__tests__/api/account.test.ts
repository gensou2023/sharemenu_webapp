import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ createAdminClient: vi.fn() }));

import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import { GET, PATCH, DELETE } from "@/app/api/account/route";

const mockAuth = vi.mocked(auth);
const mockCreateAdminClient = vi.mocked(createAdminClient);

function mockSession(id = "user-1") {
  return { user: { id, email: "test@test.com", name: "Test", role: "user" }, expires: "" };
}

function mockSupabase(overrides: {
  selectData?: unknown;
  selectError?: unknown;
  updateData?: unknown;
  updateError?: unknown;
} = {}) {
  const selectChain = {
    single: vi.fn().mockResolvedValue({ data: overrides.selectData ?? null, error: overrides.selectError ?? null }),
  };
  const updateChain = {
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: overrides.updateData ?? null, error: overrides.updateError ?? null }),
      }),
    }),
  };
  const updateOnlyChain = {
    eq: vi.fn().mockResolvedValue({ error: overrides.updateError ?? null }),
  };

  const client = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(selectChain),
      }),
      update: vi.fn().mockReturnValue(
        overrides.updateData !== undefined ? updateChain : updateOnlyChain
      ),
    }),
  };
  mockCreateAdminClient.mockReturnValue(client as never);
  return client;
}

describe("GET /api/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("認証");
  });

  it("returns user data on success", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const userData = { id: "user-1", email: "test@test.com", name: "Test", role: "user", created_at: "2024-01-01", deleted_at: null, onboarding_completed_at: null };
    mockSupabase({ selectData: userData });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toEqual(userData);
  });

  it("returns 404 when user not found", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockSupabase({ selectError: { message: "not found" } });

    const res = await GET();
    expect(res.status).toBe(404);
  });

  it("returns 401 for withdrawn user", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const userData = { id: "user-1", email: "test@test.com", name: "Test", role: "user", created_at: "2024-01-01", deleted_at: "2024-06-01" };
    mockSupabase({ selectData: userData });

    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("退会");
  });

  it("returns 500 on unexpected error", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockCreateAdminClient.mockImplementation(() => { throw new Error("DB down"); });

    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for empty name", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ name: "   " }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("店舗名");
  });

  it("returns 400 for name over 100 characters", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ name: "a".repeat(101) }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("100文字");
  });

  it("returns 400 when no update fields provided", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockSupabase();
    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("更新する項目");
  });

  it("returns 200 on successful update", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const updated = { id: "user-1", email: "test@test.com", name: "New Name", role: "user" };
    mockSupabase({ updateData: updated });

    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.name).toBe("New Name");
  });
});

describe("DELETE /api/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it("returns 200 on successful withdrawal", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockSupabase();

    const res = await DELETE();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain("退会");
  });

  it("returns 500 on database error", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockSupabase({ updateError: { message: "db error" } });

    const res = await DELETE();
    expect(res.status).toBe(500);
  });
});
