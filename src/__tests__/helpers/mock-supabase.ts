import { vi } from "vitest";

/**
 * Supabase クライアントのチェーン可能なモックファクトリ。
 * from().select().eq().single() などのパターンをサポート。
 */
export function createMockSupabaseClient(overrides: {
  selectResult?: { data: unknown; error: unknown };
  insertResult?: { data: unknown; error: unknown };
  updateResult?: { data: unknown; error: unknown };
} = {}) {
  const defaultResult = { data: null, error: null };

  const selectResult = overrides.selectResult ?? defaultResult;
  const insertResult = overrides.insertResult ?? defaultResult;
  const updateResult = overrides.updateResult ?? defaultResult;

  const chainable = (result: { data: unknown; error: unknown }) => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(result),
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(result),
        }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(result),
          }),
        }),
      }),
    }),
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(result),
      }),
      single: vi.fn().mockResolvedValue(result),
    }),
    single: vi.fn().mockResolvedValue(result),
  });

  return {
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(selectResult),
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(selectResult),
          }),
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(selectResult),
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue(chainable(insertResult)),
      update: vi.fn().mockReturnValue(chainable(updateResult)),
    })),
  };
}
