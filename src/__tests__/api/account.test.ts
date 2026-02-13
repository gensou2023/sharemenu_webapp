import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ createAdminClient: vi.fn() }));
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";
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

describe("PATCH /api/account パスワード変更", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockPasswordSupabase(passwordHash = "$2a$10$hashed") {
    const selectPasswordChain = {
      single: vi.fn().mockResolvedValue({ data: { password_hash: passwordHash }, error: null }),
    };
    const updateChain = {
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "user-1", email: "t@t.com", name: "T", role: "user" }, error: null }),
        }),
      }),
    };
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(selectPasswordChain),
        }),
        update: vi.fn().mockReturnValue(updateChain),
      }),
    };
    mockCreateAdminClient.mockReturnValue(client as never);
    return client;
  }

  it("current_passwordのみ指定で400を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ current_password: "oldpass1" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("両方を入力");
  });

  it("無効な新パスワード（短すぎ）で400を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ current_password: "oldpass1", new_password: "ab1" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("8文字以上");
  });

  it("現在のパスワードが不正で400を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockPasswordSupabase();
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ current_password: "wrongpw1", new_password: "newpass12" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("現在のパスワードが正しくありません");
  });

  it("正しいパスワード変更で200を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockPasswordSupabase();
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);   // current pw valid
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);  // not same
    vi.mocked(bcrypt.hash).mockResolvedValueOnce("$2a$10$newhash" as never);

    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ current_password: "oldpass12", new_password: "newpass12" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("パスワードを変更しました。");
  });
});

describe("PATCH /api/account プロフィール拡張", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("業態カテゴリを更新できる", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const updated = { id: "user-1", email: "t@t.com", name: "T", role: "user" };
    mockSupabase({ updateData: updated });

    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ business_type: "cafe" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("無効な業態カテゴリで400を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockSupabase();

    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ business_type: "invalid_type" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("無効な業態");
  });

  it("店舗コンセプト200文字超で400を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockSupabase();

    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ shop_concept: "あ".repeat(201) }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("200文字");
  });

  it("複数プロフィールフィールドを同時に更新できる", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const updated = { id: "user-1", email: "t@t.com", name: "New Shop", role: "user" };
    mockSupabase({ updateData: updated });

    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({
        name: "New Shop",
        business_type: "ramen",
        shop_concept: "こだわりの一杯",
        prefecture: "東京都",
      }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("nullでフィールドをクリアできる", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const updated = { id: "user-1", email: "t@t.com", name: "T", role: "user" };
    mockSupabase({ updateData: updated });

    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ business_type: null, shop_concept: null }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("空文字のSNSフィールドはnullに変換される", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const updated = { id: "user-1", email: "t@t.com", name: "T", role: "user" };
    const client = mockSupabase({ updateData: updated });

    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ sns_instagram: "", website_url: "" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);

    // updateに渡されたデータを検証
    const fromCall = client.from.mock.calls[0];
    expect(fromCall[0]).toBe("users");
  });

  it("都道府県とWebサイトURLを更新できる", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const updated = { id: "user-1", email: "t@t.com", name: "T", role: "user" };
    mockSupabase({ updateData: updated });

    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ prefecture: "大阪府", website_url: "https://example.com" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("店舗コンセプト200文字ちょうどは許可される", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const updated = { id: "user-1", email: "t@t.com", name: "T", role: "user" };
    mockSupabase({ updateData: updated });

    const req = new NextRequest("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ shop_concept: "あ".repeat(200) }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
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
