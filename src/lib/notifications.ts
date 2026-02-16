import { createAdminClient } from "@/lib/supabase";

type NotificationType = "achievement_unlock" | "gallery_reaction" | "new_feature" | "generation_complete" | "system";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();

  // notification_preferences チェック
  const prefColumn: Record<NotificationType, string | null> = {
    achievement_unlock: null, // アチーブメントは常に通知
    gallery_reaction: "gallery_reactions",
    new_feature: "new_features",
    generation_complete: "generation_complete",
    system: null, // システム通知は常に通知
  };

  const column = prefColumn[params.type];
  if (column) {
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select(column)
      .eq("user_id", params.userId)
      .single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (prefs && !(prefs as any)[column]) return; // ユーザーが無効にしている
  }

  await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    metadata: params.metadata || {},
  });
}
