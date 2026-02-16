-- 016_performance_indexes.sql
-- DB パフォーマンス最適化: インデックス + RPC関数
-- Issue #63

-- =============================================================
-- 1. インデックス
-- =============================================================

-- 月間カウント・日次チャート高速化
CREATE INDEX IF NOT EXISTS idx_generated_images_user_created
  ON generated_images (user_id, created_at DESC);

-- 完了セッション絞り込み高速化
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_status
  ON chat_sessions (user_id, status);

-- セッション別メッセージカウント高速化
CREATE INDEX IF NOT EXISTS idx_messages_session_role
  ON messages (session_id, role);

-- =============================================================
-- 2. RPC関数
-- =============================================================

-- ----- get_shared_image_stats -----
-- ダッシュボードの likes/saves 集計（全行フェッチ → 集計済み1クエリ）
CREATE OR REPLACE FUNCTION get_shared_image_stats(p_shared_ids uuid[])
RETURNS TABLE(shared_image_id uuid, like_count bigint, save_count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    ids.id AS shared_image_id,
    COALESCE(l.cnt, 0) AS like_count,
    COALESCE(s.cnt, 0) AS save_count
  FROM unnest(p_shared_ids) AS ids(id)
  LEFT JOIN (
    SELECT il.shared_image_id, COUNT(*) AS cnt
    FROM image_likes il
    WHERE il.shared_image_id = ANY(p_shared_ids)
    GROUP BY il.shared_image_id
  ) l ON l.shared_image_id = ids.id
  LEFT JOIN (
    SELECT isv.shared_image_id, COUNT(*) AS cnt
    FROM image_saves isv
    WHERE isv.shared_image_id = ANY(p_shared_ids)
    GROUP BY isv.shared_image_id
  ) s ON s.shared_image_id = ids.id;
$$;

-- ----- check_session_messages_lte -----
-- アチーブメント「minimalist」判定（N+1 → 1クエリ）
CREATE OR REPLACE FUNCTION check_session_messages_lte(p_user_id uuid, p_max_messages int)
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM chat_sessions cs
    WHERE cs.user_id = p_user_id
      AND cs.status = 'completed'
      AND EXISTS (
        SELECT 1 FROM generated_images gi WHERE gi.session_id = cs.id
      )
      AND (
        SELECT COUNT(*)
        FROM messages m
        WHERE m.session_id = cs.id
          AND m.role = 'user'
      ) <= p_max_messages
  );
$$;

-- ----- get_admin_timeseries -----
-- 管理画面の日別推移チャート（3テーブル全行フェッチ → 固定30行）
CREATE OR REPLACE FUNCTION get_admin_timeseries(p_since timestamptz)
RETURNS TABLE(day date, user_count bigint, session_count bigint, image_count bigint)
LANGUAGE sql STABLE
AS $$
  WITH days AS (
    SELECT d::date AS day
    FROM generate_series(p_since::date, CURRENT_DATE, '1 day'::interval) AS d
  ),
  u AS (
    SELECT created_at::date AS day, COUNT(*) AS cnt
    FROM users
    WHERE created_at >= p_since
    GROUP BY created_at::date
  ),
  s AS (
    SELECT created_at::date AS day, COUNT(*) AS cnt
    FROM chat_sessions
    WHERE created_at >= p_since
    GROUP BY created_at::date
  ),
  i AS (
    SELECT created_at::date AS day, COUNT(*) AS cnt
    FROM generated_images
    WHERE created_at >= p_since
    GROUP BY created_at::date
  )
  SELECT
    days.day,
    COALESCE(u.cnt, 0) AS user_count,
    COALESCE(s.cnt, 0) AS session_count,
    COALESCE(i.cnt, 0) AS image_count
  FROM days
  LEFT JOIN u ON u.day = days.day
  LEFT JOIN s ON s.day = days.day
  LEFT JOIN i ON i.day = days.day
  ORDER BY days.day;
$$;
