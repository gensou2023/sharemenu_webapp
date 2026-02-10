import { createAdminClient } from "@/lib/supabase";
import type { ApiType, ApiStatus } from "@/lib/database.types";

interface LogApiUsageParams {
  userId: string;
  sessionId?: string | null;
  apiType: ApiType;
  model: string;
  durationMs: number;
  status: ApiStatus;
  errorMessage?: string | null;
  tokensIn?: number | null;
  tokensOut?: number | null;
}

/**
 * API使用ログを記録する。
 * ログ書き込みの失敗がAPIレスポンスに影響しないよう、エラーは握りつぶす。
 */
export async function logApiUsage(params: LogApiUsageParams): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("api_usage_logs").insert({
      user_id: params.userId,
      session_id: params.sessionId ?? null,
      api_type: params.apiType,
      model: params.model,
      duration_ms: Math.round(params.durationMs),
      status: params.status,
      error_message: params.errorMessage ?? null,
      tokens_in: params.tokensIn ?? null,
      tokens_out: params.tokensOut ?? null,
    });
  } catch (err) {
    console.error("Failed to log API usage:", err);
  }
}
