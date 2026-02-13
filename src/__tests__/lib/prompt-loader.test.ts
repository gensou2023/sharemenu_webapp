import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({ createAdminClient: vi.fn() }));

import { createAdminClient } from "@/lib/supabase";
import { getActivePrompt, clearPromptCache } from "@/lib/prompt-loader";

const mockCreateAdminClient = vi.mocked(createAdminClient);

function mockSupabase(data: unknown, error: unknown = null) {
  const client = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data, error }),
              }),
            }),
          }),
        }),
      }),
    }),
  };
  mockCreateAdminClient.mockReturnValue(client as never);
  return client;
}

describe("getActivePrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearPromptCache();
  });

  it("returns DB data when fetch succeeds", async () => {
    mockSupabase({ content: "DB prompt content" });
    const result = await getActivePrompt("chat_system");
    expect(result).toBe("DB prompt content");
  });

  it("returns fallback when DB returns error", async () => {
    mockSupabase(null, { message: "table not found" });
    const result = await getActivePrompt("chat_system");
    expect(result).toContain("MenuCraft AI");
  });

  it("returns fallback when DB returns no content", async () => {
    mockSupabase({ content: null });
    const result = await getActivePrompt("chat_system");
    expect(result).toContain("MenuCraft AI");
  });

  it("uses cache on subsequent calls", async () => {
    mockSupabase({ content: "Cached content" });
    const first = await getActivePrompt("chat_system");
    expect(first).toBe("Cached content");

    // Change mock return value
    mockSupabase({ content: "New content" });
    const second = await getActivePrompt("chat_system");
    // Should still return cached value
    expect(second).toBe("Cached content");
  });

  it("refetches after cache is cleared", async () => {
    mockSupabase({ content: "Original" });
    await getActivePrompt("chat_system");

    clearPromptCache();

    mockSupabase({ content: "Updated" });
    const result = await getActivePrompt("chat_system");
    expect(result).toBe("Updated");
  });

  it("returns fallback when createAdminClient throws", async () => {
    mockCreateAdminClient.mockImplementation(() => { throw new Error("Connection failed"); });
    const result = await getActivePrompt("image_gen");
    expect(result).toContain("food photography");
  });

  it("returns correct fallback for image_gen type", async () => {
    mockSupabase(null, { message: "error" });
    const result = await getActivePrompt("image_gen");
    expect(result).toContain("food photography");
  });
});
