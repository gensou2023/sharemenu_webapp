import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import sharp from "sharp";

const MAX_DIMENSION = 1200; // 長辺の最大px
const JPEG_QUALITY = 80;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = await req.json();
  const { imageBase64, mimeType, sessionId } = body;

  if (!imageBase64) {
    return NextResponse.json({ error: "画像データが必要です" }, { status: 400 });
  }

  // Base64をBufferに変換
  const inputBuffer = Buffer.from(imageBase64, "base64");

  // sharpでリサイズ + JPEG変換
  const resized = await sharp(inputBuffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",        // アスペクト比を維持して長辺をMAX_DIMENSIONに
      withoutEnlargement: true, // 小さい画像は拡大しない
    })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  const fileName = `${session.user.id}/${crypto.randomUUID()}.jpg`;

  // Supabase Storageにアップロード
  const { error: uploadError } = await supabase.storage
    .from("uploads")
    .upload(fileName, resized, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // 元サイズと圧縮後サイズをログ
  const originalSize = inputBuffer.length;
  const compressedSize = resized.length;
  const ratio = Math.round((1 - compressedSize / originalSize) * 100);

  return NextResponse.json({
    storagePath: fileName,
    originalSize,
    compressedSize,
    compressionRatio: `${ratio}%`,
    mimeType: "image/jpeg",
    sessionId: sessionId || null,
  });
}
