import { NextRequest, NextResponse } from "next/server";
import { withAdmin, type RouteContext } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase";
import { Session } from "next-auth";

export const POST = withAdmin(async (req: NextRequest, _session: Session, context: RouteContext) => {
  const { id } = await context.params;

  const { action } = await req.json();
  if (!["remove", "dismiss"].includes(action)) {
    return NextResponse.json({ error: "無効なアクションです" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 通報レコードを確認
  const { data: report, error: fetchError } = await supabase
    .from("image_reports")
    .select("id, shared_image_id")
    .eq("id", id)
    .single();

  if (fetchError || !report) {
    return NextResponse.json({ error: "通報が見つかりません" }, { status: 404 });
  }

  if (action === "remove") {
    // shared_imagesから削除（CASCADE でlikes/saves/reportsも削除される）
    const { error } = await supabase
      .from("shared_images")
      .delete()
      .eq("id", report.shared_image_id);

    if (error) {
      console.error("Moderation remove error:", error);
      return NextResponse.json({ error: "画像の非公開に失敗しました" }, { status: 500 });
    }
  } else {
    // dismiss: 該当通報のみ削除
    const { error } = await supabase
      .from("image_reports")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Moderation dismiss error:", error);
      return NextResponse.json({ error: "通報の却下に失敗しました" }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "対応しました。" });
});
