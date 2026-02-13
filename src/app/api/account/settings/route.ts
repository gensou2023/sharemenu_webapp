import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

const VALID_SIZES = ["1:1", "9:16", "16:9"];
const VALID_STYLES = ["pop", "chic", "japanese", "modern", "natural", "minimal"];
const VALID_PHOTO_STYLES = ["realistic", "illustration", "watercolor", "flat"];
const VALID_LANGUAGES = ["ja", "en"];
const VALID_FREQUENCIES = ["realtime", "daily", "weekly", "off"];

const NOTIF_SELECT = "new_features, generation_complete, gallery_reactions, marketing, email_frequency";
const DEFAULT_NOTIFICATIONS = {
  new_features: true,
  generation_complete: true,
  gallery_reactions: true,
  marketing: false,
  email_frequency: "realtime",
};

const DEFAULT_SETTINGS = {
  default_sizes: ["1:1"],
  default_style: null,
  default_text_language: "ja",
  default_photo_style: null,
  ai_data_usage: true,
  gallery_show_shop_name: true,
  analytics_data_sharing: true,
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // 既存設定を取得
    const { data, error } = await supabase
      .from("user_settings")
      .select("default_sizes, default_style, default_text_language, default_photo_style, ai_data_usage, gallery_show_shop_name, analytics_data_sharing")
      .eq("user_id", session.user.id)
      .single();

    if (error || !data) {
      // 未作成の場合はデフォルト値で自動作成
      const { data: created, error: insertError } = await supabase
        .from("user_settings")
        .insert({ user_id: session.user.id })
        .select("default_sizes, default_style, default_text_language, default_photo_style, ai_data_usage, gallery_show_shop_name, analytics_data_sharing")
        .single();

      if (insertError) {
        // UNIQUE制約違反の場合は再取得（競合対策）
        if (insertError.code === "23505") {
          const { data: retry } = await supabase
            .from("user_settings")
            .select("default_sizes, default_style, default_text_language, default_photo_style, ai_data_usage, gallery_show_shop_name, analytics_data_sharing")
            .eq("user_id", session.user.id)
            .single();
          return NextResponse.json({ settings: retry || DEFAULT_SETTINGS });
        }
        return NextResponse.json({ settings: DEFAULT_SETTINGS });
      }

      return NextResponse.json({ settings: created });
    }

    // 通知設定を取得（別テーブル）
    const { data: notifData } = await supabase
      .from("notification_preferences")
      .select(NOTIF_SELECT)
      .eq("user_id", session.user.id)
      .single();

    let notifications = notifData;
    if (!notifications) {
      const { data: createdNotif } = await supabase
        .from("notification_preferences")
        .insert({ user_id: session.user.id })
        .select(NOTIF_SELECT)
        .single();
      notifications = createdNotif || DEFAULT_NOTIFICATIONS;
    }

    return NextResponse.json({ settings: data, notifications });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { default_sizes, default_style, default_text_language, default_photo_style, ai_data_usage, gallery_show_shop_name, analytics_data_sharing, notifications } = body;

    const updateData: Record<string, unknown> = {};

    // バリデーション
    if (default_sizes !== undefined) {
      if (!Array.isArray(default_sizes) || default_sizes.length === 0) {
        return NextResponse.json({ error: "サイズを1つ以上選択してください。" }, { status: 400 });
      }
      if (!default_sizes.every((s: string) => VALID_SIZES.includes(s))) {
        return NextResponse.json({ error: "無効なサイズが指定されました。" }, { status: 400 });
      }
      updateData.default_sizes = default_sizes;
    }

    if (default_style !== undefined) {
      if (default_style !== null && !VALID_STYLES.includes(default_style)) {
        return NextResponse.json({ error: "無効なスタイルが指定されました。" }, { status: 400 });
      }
      updateData.default_style = default_style;
    }

    if (default_text_language !== undefined) {
      if (!VALID_LANGUAGES.includes(default_text_language)) {
        return NextResponse.json({ error: "無効な言語が指定されました。" }, { status: 400 });
      }
      updateData.default_text_language = default_text_language;
    }

    if (default_photo_style !== undefined) {
      if (default_photo_style !== null && !VALID_PHOTO_STYLES.includes(default_photo_style)) {
        return NextResponse.json({ error: "無効な写真スタイルが指定されました。" }, { status: 400 });
      }
      updateData.default_photo_style = default_photo_style;
    }

    // プライバシー設定
    const booleanFields = { ai_data_usage, gallery_show_shop_name, analytics_data_sharing } as Record<string, unknown>;
    for (const [key, value] of Object.entries(booleanFields)) {
      if (value !== undefined) {
        if (typeof value !== "boolean") {
          return NextResponse.json({ error: "無効な値が指定されました。" }, { status: 400 });
        }
        updateData[key] = value;
      }
    }

    // 通知設定の更新
    if (notifications && typeof notifications === "object") {
      const notifUpdate: Record<string, unknown> = {};
      const notifBoolFields = ["new_features", "generation_complete", "gallery_reactions", "marketing"];
      for (const field of notifBoolFields) {
        if (notifications[field] !== undefined) {
          if (typeof notifications[field] !== "boolean") {
            return NextResponse.json({ error: "無効な通知設定の値です。" }, { status: 400 });
          }
          notifUpdate[field] = notifications[field];
        }
      }
      if (notifications.email_frequency !== undefined) {
        if (!VALID_FREQUENCIES.includes(notifications.email_frequency)) {
          return NextResponse.json({ error: "無効なメール頻度が指定されました。" }, { status: 400 });
        }
        notifUpdate.email_frequency = notifications.email_frequency;
      }

      if (Object.keys(notifUpdate).length > 0) {
        const supabase = createAdminClient();
        const { data: notifData, error: notifError } = await supabase
          .from("notification_preferences")
          .upsert(
            { user_id: session.user.id, ...notifUpdate },
            { onConflict: "user_id" }
          )
          .select(NOTIF_SELECT)
          .single();

        if (notifError) {
          console.error("Notification settings update error:", notifError);
          return NextResponse.json({ error: "通知設定の更新に失敗しました。" }, { status: 500 });
        }

        return NextResponse.json({ notifications: notifData, message: "通知設定を保存しました。" });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "更新する項目がありません。" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // upsert: 未作成の場合は作成、既存なら更新
    const { data, error } = await supabase
      .from("user_settings")
      .upsert(
        { user_id: session.user.id, ...updateData },
        { onConflict: "user_id" }
      )
      .select("default_sizes, default_style, default_text_language, default_photo_style, ai_data_usage, gallery_show_shop_name, analytics_data_sharing")
      .single();

    if (error) {
      console.error("Settings update error:", error);
      return NextResponse.json({ error: "設定の更新に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ settings: data, message: "設定を保存しました。" });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
