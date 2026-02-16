import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ createAdminClient: vi.fn() }));

import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import { GET } from "@/app/api/account/usage/route";

const mockAuth = vi.mocked(auth);
const mockCreateAdminClient = vi.mocked(createAdminClient);

function mockSession(id = "user-1") {
  return { user: { id, email: "test@test.com", name: "Test", role: "user" }, expires: "" };
}

function mockUsageClient(monthlyImages = 5, totalImages = 10, totalSessions = 5, plan = "free") {
  const userChain = {
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { plan }, error: null }),
    }),
  };
  const countChain = (count: number) => ({
    eq: vi.fn().mockReturnValue({
      gte: vi.fn().mockResolvedValue({ count, error: null }),
    }),
  });
  const totalChain = (count: number) => ({
    eq: vi.fn().mockResolvedValue({ count, error: null }),
  });
  const dailyChain = {
    eq: vi.fn().mockReturnValue({
      gte: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  };

  let callIndex = 0;
  const client = {
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) return userChain;        // users.plan
        if (callIndex === 2) return countChain(monthlyImages); // monthly images
        if (callIndex === 3) return totalChain(totalImages);   // total images
        if (callIndex === 4) return totalChain(totalSessions); // total sessions
        return dailyChain;                                      // daily chart
      }),
    })),
  };
  mockCreateAdminClient.mockReturnValue(client as never);
  return client;
}

describe("GET /api/account/usage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("利用状況データを正しく返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockUsageClient(5, 10, 5, "free");

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.plan).toBe("free");
    expect(body.current_period).toBeDefined();
    expect(body.current_period.image_generation_limit_month).toBe(10);
    expect(body.current_period.image_generations_this_month).toBe(5);
    expect(body.totals).toBeDefined();
    expect(body.daily_chart).toBeDefined();
    expect(body.daily_chart).toHaveLength(30);
  });

  it("Proプランの制限値を正しく返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockUsageClient(20, 100, 30, "pro");

    const res = await GET();
    const body = await res.json();
    expect(body.plan).toBe("pro");
    expect(body.current_period.image_generation_limit_month).toBe(50);
  });

  it("daily_chartが30日分のデータを含む", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockUsageClient();

    const res = await GET();
    const body = await res.json();
    expect(body.daily_chart).toHaveLength(30);
    for (const entry of body.daily_chart) {
      expect(entry.date).toBeDefined();
      expect(typeof entry.count).toBe("number");
    }
  });

  it("DBエラー時に500を返す", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockCreateAdminClient.mockImplementation(() => { throw new Error("DB down"); });

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
