import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({ createAdminClient: vi.fn() }));

import { createAdminClient } from "@/lib/supabase";
import { logApiUsage } from "@/lib/api-logger";

const mockCreateAdminClient = vi.mocked(createAdminClient);

describe("logApiUsage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts log record with correct fields", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    mockCreateAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: insertMock }),
    } as never);

    await logApiUsage({
      userId: "user-1",
      sessionId: "session-1",
      apiType: "chat",
      model: "gemini-2.0-flash",
      durationMs: 1234.5,
      status: "success",
      tokensIn: 100,
      tokensOut: 200,
    });

    expect(insertMock).toHaveBeenCalledWith({
      user_id: "user-1",
      session_id: "session-1",
      api_type: "chat",
      model: "gemini-2.0-flash",
      duration_ms: 1235,
      status: "success",
      error_message: null,
      tokens_in: 100,
      tokens_out: 200,
    });
  });

  it("handles null optional fields correctly", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    mockCreateAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: insertMock }),
    } as never);

    await logApiUsage({
      userId: "user-1",
      apiType: "image_gen",
      model: "gemini-2.0-flash",
      durationMs: 500,
      status: "error",
      errorMessage: "timeout",
    });

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        session_id: null,
        error_message: "timeout",
        tokens_in: null,
        tokens_out: null,
      })
    );
  });

  it("does not throw when insert fails", async () => {
    mockCreateAdminClient.mockImplementation(() => { throw new Error("DB down"); });

    // Should not throw
    await expect(
      logApiUsage({
        userId: "user-1",
        apiType: "chat",
        model: "gemini-2.0-flash",
        durationMs: 100,
        status: "success",
      })
    ).resolves.toBeUndefined();
  });
});
