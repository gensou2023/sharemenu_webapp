import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limiter";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within limit", () => {
    const result = checkRateLimit("user-1", "chat");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29); // 30 max - 1 used
    expect(result.limit).toBe(30);
  });

  it("allows unknown apiType without limit", () => {
    const result = checkRateLimit("user-1", "unknown_type");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(999);
  });

  it("blocks requests exceeding limit", () => {
    // Use up all 10 image_gen requests
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit("user-block", "image_gen");
      expect(r.allowed).toBe(true);
    }

    // 11th should be blocked
    const result = checkRateLimit("user-block", "image_gen");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("allows requests again after window expires", () => {
    // Use up all 10 image_gen requests
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user-expire", "image_gen");
    }

    expect(checkRateLimit("user-expire", "image_gen").allowed).toBe(false);

    // Advance past the 60s window
    vi.advanceTimersByTime(61_000);

    const result = checkRateLimit("user-expire", "image_gen");
    expect(result.allowed).toBe(true);
  });

  it("tracks users independently", () => {
    // Fill up user-a
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user-a", "image_gen");
    }
    expect(checkRateLimit("user-a", "image_gen").allowed).toBe(false);

    // user-b should still be allowed
    const result = checkRateLimit("user-b", "image_gen");
    expect(result.allowed).toBe(true);
  });
});
