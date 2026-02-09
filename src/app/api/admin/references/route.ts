import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import sharp from "sharp";

// 参考画像一覧取得
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reference_images")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 公開URLを付与
  const images = (data || []).map((img) => {
    const { data: urlData } = supabase.storage
      .from("references")
      .getPublicUrl(img.storage_path);
    return { ...img, publicUrl: urlData.publicUrl };
  });

  return NextResponse.json({ images });
}

// 参考画像アップロード
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const body = await req.json();
  const { imageBase64, mimeType, label, category } = body;

  if (!imageBase64 || !label) {
    return NextResponse.json({ error: "画像とラベルは必須です" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(imageBase64, "base64");

  // リサイズ + JPEG変換（長辺1200px、品質80%）
  const resized = await sharp(inputBuffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const fileName = `${category || "general"}/${crypto.randomUUID()}.jpg`;

  // アップロード
  const { error: uploadError } = await supabase.storage
    .from("references")
    .upload(fileName, resized, {
      contentType: "image/jpeg",
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // DB保存
  const { data, error } = await supabase
    .from("reference_images")
    .insert({
      storage_path: fileName,
      label,
      category: category || "general",
      uploaded_by: session!.user!.id!,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ image: data });
}
