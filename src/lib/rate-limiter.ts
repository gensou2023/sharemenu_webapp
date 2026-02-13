/**
 * インメモリ スライディングウィンドウ レートリミッター
 *
 * Vercel Serverless 環境ではコールドスタートごとにリセットされるが、
 * 同一インスタンス内での連続リクエストに対しては有効に機能する。
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  chat: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30リクエスト/分
  },
  image_gen: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10リクエスト/分
  },
  signup: {
    maxRequests: 3,
    windowMs: 10 * 60 * 1000, // 3リクエスト/10分
  },
};

// compositeKey = `${userId}:${apiType}` → タイムスタンプ配列
const requestStore = new Map<string, number[]>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5分ごとにクリーンアップ
let lastCleanup = Date.now();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
  remaining: number;
  limit: number;
}

/**
 * リクエストがレート制限内かチェックする。
 * スライディングウィンドウ方式でユーザー×API種別ごとに制限。
 */
export function checkRateLimit(
  userId: string,
  apiType: string
): RateLimitResult {
  const config = RATE_LIMITS[apiType];
  if (!config) {
    return { allowed: true, remaining: 999, limit: 999 };
  }

  const now = Date.now();
  const key = `${userId}:${apiType}`;
  const windowStart = now - config.windowMs;

  // 遅延クリーンアップ
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    cleanupOldEntries();
    lastCleanup = now;
  }

  // 現在のウィンドウ内のタイムスタンプをフィルタ
  let timestamps = requestStore.get(key) || [];
  timestamps = timestamps.filter((ts) => ts > windowStart);

  if (timestamps.length >= config.maxRequests) {
    const oldestInWindow = timestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;

    requestStore.set(key, timestamps);

    return {
      allowed: false,
      retryAfterMs: Math.max(retryAfterMs, 1000),
      remaining: 0,
      limit: config.maxRequests,
    };
  }

  // リクエストを記録
  timestamps.push(now);
  requestStore.set(key, timestamps);

  return {
    allowed: true,
    remaining: config.maxRequests - timestamps.length,
    limit: config.maxRequests,
  };
}

/**
 * 全キーの古いエントリを削除してメモリリークを防ぐ。
 */
function cleanupOldEntries(): void {
  const maxWindow = Math.max(
    ...Object.values(RATE_LIMITS).map((c) => c.windowMs)
  );
  const cutoff = Date.now() - maxWindow;

  for (const [key, timestamps] of requestStore.entries()) {
    const filtered = timestamps.filter((ts) => ts > cutoff);
    if (filtered.length === 0) {
      requestStore.delete(key);
    } else {
      requestStore.set(key, filtered);
    }
  }
}
