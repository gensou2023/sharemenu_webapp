import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ createAdminClient: vi.fn() }));

import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import { GET, PATCH } from "@/app/api/account/settings/route";

const mockAuth = vi.mocked(auth);
const mockCreateAdminClient = vi.mocked(createAdminClient);

function mockSession(id = "user-1") {
  return { user: { id, email: "test@test.com", name: "Test", role: "user" }, expires: "" };
}

const DEFAULT_SETTINGS = {
  default_sizes: ["1:1"],
  default_style: null,
  default_text_language: "ja",
  default_photo_style: null,
};

describe("GET /api/account/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("既存設定を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const settings = { ...DEFAULT_SETTINGS, default_sizes: ["1:1", "9:16"] };
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: settings, error: null }),
          }),
        }),
      }),
    };
    mockCreateAdminClient.mockReturnValue(client as never);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.settings.default_sizes).toEqual(["1:1", "9:16"]);
  });

  it("未作成の場合はデフォルト値で自動作成する", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: DEFAULT_SETTINGS, error: null }),
          }),
        }),
      }),
    };
    mockCreateAdminClient.mockReturnValue(client as never);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.settings.default_sizes).toEqual(["1:1"]);
  });
});

describe("PATCH /api/account/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockUpsertClient(result = DEFAULT_SETTINGS) {
    const client = {
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: result, error: null }),
          }),
        }),
      }),
    };
    mockCreateAdminClient.mockReturnValue(client as never);
    return client;
  }

  it("認証なしで401を返す", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/account/settings", {
      method: "PATCH",
      body: JSON.stringify({ default_sizes: ["1:1"] }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("空のサイズ配列で400を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const req = new NextRequest("http://localhost/api/account/settings", {
      method: "PATCH",
      body: JSON.stringify({ default_sizes: [] }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("1つ以上");
  });

  it("無効なサイズで400を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const req = new NextRequest("http://localhost/api/account/settings", {
      method: "PATCH",
      body: JSON.stringify({ default_sizes: ["4:3"] }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("無効なサイズ");
  });

  it("無効なスタイルで400を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const req = new NextRequest("http://localhost/api/account/settings", {
      method: "PATCH",
      body: JSON.stringify({ default_style: "invalid" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("無効なスタイル");
  });

  it("無効な写真スタイルで400を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const req = new NextRequest("http://localhost/api/account/settings", {
      method: "PATCH",
      body: JSON.stringify({ default_photo_style: "invalid" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("無効な写真スタイル");
  });

  it("無効な言語で400を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const req = new NextRequest("http://localhost/api/account/settings", {
      method: "PATCH",
      body: JSON.stringify({ default_text_language: "fr" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("無効な言語");
  });

  it("更新項目なしで400を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const req = new NextRequest("http://localhost/api/account/settings", {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("更新する項目");
  });

  it("有効なサイズ更新で200を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const updated = { ...DEFAULT_SETTINGS, default_sizes: ["1:1", "16:9"] };
    mockUpsertClient(updated);

    const req = new NextRequest("http://localhost/api/account/settings", {
      method: "PATCH",
      body: JSON.stringify({ default_sizes: ["1:1", "16:9"] }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.settings.default_sizes).toEqual(["1:1", "16:9"]);
    expect(body.message).toContain("保存");
  });

  it("スタイルをnullに戻せる", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockUpsertClient({ ...DEFAULT_SETTINGS, default_style: null });

    const req = new NextRequest("http://localhost/api/account/settings", {
      method: "PATCH",
      body: JSON.stringify({ default_style: null }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("複数フィールドを同時に更新できる", async () => {
    mockAuth.mockResolvedValue(mockSession());
    const updated = {
      default_sizes: ["9:16"],
      default_style: "pop",
      default_text_language: "en",
      default_photo_style: "watercolor",
    };
    mockUpsertClient(updated);

    const req = new NextRequest("http://localhost/api/account/settings", {
      method: "PATCH",
      body: JSON.stringify(updated),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.settings.default_style).toBe("pop");
    expect(body.settings.default_text_language).toBe("en");
  });
});
