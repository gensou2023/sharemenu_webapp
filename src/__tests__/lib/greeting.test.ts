import { describe, it, expect, vi, afterEach } from "vitest";
import { getGreeting, getStatsMessage } from "@/lib/greeting";

describe("getGreeting", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("朝（8時）は「おはようございます」を返す", () => {
    vi.setSystemTime(new Date(2025, 0, 1, 8, 0, 0));
    expect(getGreeting()).toBe("おはようございます");
  });

  it("昼（14時）は「こんにちは」を返す", () => {
    vi.setSystemTime(new Date(2025, 0, 1, 14, 0, 0));
    expect(getGreeting()).toBe("こんにちは");
  });

  it("夜（20時）は「おつかれさまです」を返す", () => {
    vi.setSystemTime(new Date(2025, 0, 1, 20, 0, 0));
    expect(getGreeting()).toBe("おつかれさまです");
  });

  it("深夜（3時）は「おつかれさまです」を返す", () => {
    vi.setSystemTime(new Date(2025, 0, 1, 3, 0, 0));
    expect(getGreeting()).toBe("おつかれさまです");
  });
});

describe("getStatsMessage", () => {
  it("0枚の場合は始めましょうメッセージを返す", () => {
    expect(getStatsMessage(0)).toBe("まだ画像を生成していません。始めましょう！");
  });

  it("N枚の場合はN枚メッセージを返す", () => {
    expect(getStatsMessage(12)).toBe("今月 12枚 のメニュー画像を作成しました");
  });

  it("セッション0件の場合は初回誘導メッセージを返す", () => {
    expect(getStatsMessage(0, 0)).toBe("最初のメニュー画像を作ってみましょう！");
  });
});
