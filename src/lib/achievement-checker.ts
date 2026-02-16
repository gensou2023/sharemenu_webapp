import { createAdminClient } from "@/lib/supabase";

type NewAchievement = {
  id: string;
  key: string;
  name: string;
  icon: string;
};

/**
 * ユーザーのバッジ達成を判定し、新規獲得バッジをDBに記録して返す
 */
export async function checkAchievements(userId: string): Promise<NewAchievement[]> {
  const supabase = createAdminClient();

  // 全バッジ定義を取得
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("id, key, name, icon, threshold")
    .order("sort_order");

  if (!allAchievements || allAchievements.length === 0) return [];

  // ユーザーの既獲得バッジを取得
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlockedIds = new Set((userAchievements || []).map((ua) => ua.achievement_id));

  // 未獲得バッジのみ判定
  const unchecked = allAchievements.filter((a) => !unlockedIds.has(a.id));
  if (unchecked.length === 0) return [];

  // 統計データを並列取得
  const [
    imageCountResult,
    messageCountResult,
    sessionCompletedResult,
    shareCountResult,
    saveCountResult,
    loginDaysResult,
    userResult,
  ] = await Promise.all([
    supabase.from("generated_images").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("messages").select("id, chat_sessions!inner(user_id)", { count: "exact", head: true }).eq("chat_sessions.user_id", userId).eq("role", "user"),
    supabase.from("chat_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
    supabase.from("shared_images").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("image_saves").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("api_usage_logs").select("created_at").eq("user_id", userId),
    supabase.from("users").select("created_at").eq("id", userId).single(),
  ]);

  const imageCount = imageCountResult.count || 0;
  const messageCount = messageCountResult.count || 0;
  const sessionCompleted = sessionCompletedResult.count || 0;
  const shareCount = shareCountResult.count || 0;
  const saveCount = saveCountResult.count || 0;

  // ログイン日数（distinct dates）
  const loginDates = new Set(
    (loginDaysResult.data || []).map((log) =>
      new Date(log.created_at).toISOString().slice(0, 10)
    )
  );
  const loginDays = loginDates.size;

  const userCreatedAt = userResult.data?.created_at ? new Date(userResult.data.created_at) : null;

  // thresholdからタイプと値を抽出するヘルパー
  // DB format: {"type":"image_count","value":1} or {"type":"signup_hours_images","hours":24,"images":3}
  const getThresholdType = (t: Record<string, number | string>) => String(t.type);

  // いいね関連（遅延取得 — 必要な場合のみ）
  let totalLikesReceived: number | null = null;
  let singleImageMaxLikes: number | null = null;

  const needsLikes = unchecked.some((a) => {
    const type = getThresholdType(a.threshold as Record<string, number | string>);
    return type === "total_likes_received" || type === "single_image_likes";
  });

  if (needsLikes) {
    const { data: myShared } = await supabase
      .from("shared_images")
      .select("id")
      .eq("user_id", userId);

    if (myShared && myShared.length > 0) {
      const myIds = myShared.map((s) => s.id);
      const { data: likes } = await supabase
        .from("image_likes")
        .select("shared_image_id")
        .in("shared_image_id", myIds);

      const likesPerImage: Record<string, number> = {};
      for (const l of likes || []) {
        likesPerImage[l.shared_image_id] = (likesPerImage[l.shared_image_id] || 0) + 1;
      }
      totalLikesReceived = Object.values(likesPerImage).reduce((sum, v) => sum + v, 0);
      singleImageMaxLikes = Math.max(0, ...Object.values(likesPerImage));
    } else {
      totalLikesReceived = 0;
      singleImageMaxLikes = 0;
    }
  }

  // カテゴリ数（遅延取得）
  let categoryCount: number | null = null;
  const needsCategory = unchecked.some((a) => getThresholdType(a.threshold as Record<string, number | string>) === "category_count");
  if (needsCategory) {
    const { data: sessions } = await supabase
      .from("chat_sessions")
      .select("category")
      .eq("user_id", userId)
      .not("category", "is", null);
    const categories = new Set((sessions || []).map((s) => s.category).filter(Boolean));
    categoryCount = categories.size;
  }

  // 判定
  const newlyUnlocked: NewAchievement[] = [];

  for (const achievement of unchecked) {
    const t = achievement.threshold as Record<string, number | string>;
    const type = getThresholdType(t);
    const value = t.value;
    let unlocked = false;

    switch (type) {
      case "image_count":
        unlocked = imageCount >= Number(value);
        break;
      case "message_count":
        unlocked = messageCount >= Number(value);
        break;
      case "session_completed":
        unlocked = sessionCompleted >= Number(value);
        break;
      case "share_count":
        unlocked = shareCount >= Number(value);
        break;
      case "save_count":
        unlocked = saveCount >= Number(value);
        break;
      case "login_days":
        unlocked = loginDays >= Number(value);
        break;
      case "total_likes_received":
        unlocked = (totalLikesReceived ?? 0) >= Number(value);
        break;
      case "single_image_likes":
        unlocked = (singleImageMaxLikes ?? 0) >= Number(value);
        break;
      case "category_count":
        unlocked = (categoryCount ?? 0) >= Number(value);
        break;
      case "hour_before":
        unlocked = await checkHourCondition(supabase, userId, "before", Number(value));
        break;
      case "hour_after":
        unlocked = await checkHourCondition(supabase, userId, "after", Number(value));
        break;
      case "signup_hours_images": {
        if (userCreatedAt) {
          const hours = Number(t.hours);
          const images = Number(t.images);
          const cutoff = new Date(userCreatedAt.getTime() + hours * 60 * 60 * 1000);
          const { count } = await supabase
            .from("generated_images")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .lte("created_at", cutoff.toISOString());
          unlocked = (count || 0) >= images;
        }
        break;
      }
      case "session_messages_lte": {
        const { data: result } = await supabase.rpc("check_session_messages_lte", {
          p_user_id: userId,
          p_max_messages: Number(value),
        });
        unlocked = result === true;
        break;
      }
      case "session_regenerate_gte": {
        const { data: sessionsWithImages } = await supabase
          .from("chat_sessions")
          .select("id, generated_images(id)")
          .eq("user_id", userId);
        for (const sess of sessionsWithImages || []) {
          const imgs = sess.generated_images as unknown as { id: string }[];
          if (imgs && imgs.length >= Number(value)) {
            unlocked = true;
            break;
          }
        }
        break;
      }
    }

    if (unlocked) {
      newlyUnlocked.push({
        id: achievement.id,
        key: achievement.key,
        name: (achievement as unknown as { name: string }).name,
        icon: (achievement as unknown as { icon: string }).icon,
      });
    }
  }

  // 新規獲得バッジをDBに記録
  if (newlyUnlocked.length > 0) {
    await supabase.from("user_achievements").insert(
      newlyUnlocked.map((a) => ({
        user_id: userId,
        achievement_id: a.id,
      }))
    );
  }

  return newlyUnlocked;
}

async function checkHourCondition(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  direction: "before" | "after",
  hour: number
): Promise<boolean> {
  const { data: images } = await supabase
    .from("generated_images")
    .select("created_at")
    .eq("user_id", userId);

  if (!images || images.length === 0) return false;

  return images.some((img) => {
    const h = new Date(img.created_at).getHours();
    if (direction === "before") {
      return h < hour;
    } else {
      return h >= hour && h < 5; // 0:00〜4:59
    }
  });
}
