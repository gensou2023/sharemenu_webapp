import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/password-validation";

describe("validatePassword", () => {
  it("8文字未満は無効", () => {
    const result = validatePassword("abc123");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("8文字以上");
  });

  it("数字のみは無効", () => {
    const result = validatePassword("12345678");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("英字と数字");
  });

  it("英字のみは無効", () => {
    const result = validatePassword("abcdefgh");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("英字と数字");
  });

  it("英字+数字で8文字以上は有効", () => {
    const result = validatePassword("password1");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
