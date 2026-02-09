import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// 生成画像をSupabase Storageに保存
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = await req.json();
  const { sessionId, imageBase64, mimeType, prompt, aspectRatio, proposalJson } = body;

  if (!imageBase64 || !sessionId) {
    return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
  }

  // Base64をBufferに変換
  const buffer = Buffer.from(imageBase64, "base64");
  const ext = mimeType?.includes("png") ? "png" : "jpg";
  const fileName = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

  // Supabase Storageにアップロード
  const { error: uploadError } = await supabase.storage
    .from("generated")
    .upload(fileName, buffer, {
      contentType: mimeType || "image/png",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // DBにメタデータを保存
  const { data, error: dbError } = await supabase
    .from("generated_images")
    .insert({
      session_id: sessionId,
      user_id: session.user.id,
      storage_path: fileName,
      prompt: prompt || "",
      aspect_ratio: aspectRatio || "1:1",
      proposal_json: proposalJson || null,
    })
    .select("id, storage_path, created_at")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // 公開URLを生成
  const { data: urlData } = supabase.storage
    .from("generated")
    .getPublicUrl(fileName);

  return NextResponse.json({
    image: data,
    publicUrl: urlData.publicUrl,
  });
}
