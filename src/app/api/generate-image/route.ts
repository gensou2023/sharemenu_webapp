import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { logApiUsage } from "@/lib/api-logger";
import { getActivePrompt } from "@/lib/prompt-loader";
import { checkRateLimit } from "@/lib/rate-limiter";
import { createAdminClient } from "@/lib/supabase";

const IMAGE_MODEL = "gemini-2.0-flash-exp-image-generation";

export async function POST(req: NextRequest) {
  // --- 認証チェック ---
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "認証が必要です。ログインしてください。" },
      { status: 401 }
    );
  }
  const userId = session.user.id;

  // --- レート制限チェック ---
  const rateLimit = checkRateLimit(userId, "image_gen");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "画像生成のリクエストが多すぎます。しばらくお待ちください。" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.retryAfterMs ?? 1000) / 1000)),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  }

  const startTime = Date.now();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      return NextResponse.json(
        { error: "Gemini APIキーが設定されていません。" },
        { status: 500 }
      );
    }

    const { prompt, aspectRatio = "1:1", sessionId, shopName, designDirection, category, userReferenceImages } = await req.json();

    // DBテンプレートを使った動的プロンプト生成 or クライアント直送プロンプト
    let finalPrompt: string;
    if (shopName && designDirection) {
      const baseTemplate = await getActivePrompt("image_gen");
      finalPrompt = baseTemplate
        .replace("{shopName}", shopName)
        .replace("{designDirection}", designDirection);
    } else if (prompt && typeof prompt === "string") {
      finalPrompt = prompt;
    } else {
      return NextResponse.json(
        { error: "プロンプトが指定されていません。" },
        { status: 400 }
      );
    }

    // プロンプト長制限
    const sanitizedPrompt = finalPrompt.slice(0, 2000);

    // アスペクト比のバリデーション
    const validRatios = ["1:1", "9:16", "16:9", "3:4", "4:3"];
    const safeRatio = validRatios.includes(aspectRatio) ? aspectRatio : "1:1";

    // --- 参考画像の取得 ---
    type ContentPart = { text: string } | { inlineData: { data: string; mimeType: string } };
    const contentParts: ContentPart[] = [];

    try {
      const supabase = createAdminClient();
      const effectiveCategory = category || "general";

      // カテゴリに一致する参考画像を最大2枚取得
      const { data: refImages } = await supabase
        .from("reference_images")
        .select("storage_path, label")
        .eq("category", effectiveCategory)
        .order("created_at", { ascending: false })
        .limit(2);

      if (refImages && refImages.length > 0) {
        // 参考画像をダウンロードしてBase64として取得
        for (const refImg of refImages) {
          try {
            const { data: fileData } = await supabase.storage
              .from("references")
              .download(refImg.storage_path);

            if (fileData) {
              const buffer = Buffer.from(await fileData.arrayBuffer());
              const base64 = buffer.toString("base64");
              contentParts.push({
                inlineData: {
                  data: base64,
                  mimeType: "image/jpeg",
                },
              });
            }
          } catch {
            // 個別画像のダウンロード失敗は無視
          }
        }

        // 参考画像がある場合、プロンプトにスタイル参考の指示を追加
        if (contentParts.length > 0) {
          const labels = refImages
            .slice(0, contentParts.length)
            .map((r) => r.label)
            .join(", ");
          contentParts.push({
            text: `${sanitizedPrompt}\n\nUse the above reference image(s) (${labels}) as style/mood reference for the food photography. Match similar lighting, color palette, and composition style.${safeRatio !== "1:1" ? `\n\nアスペクト比: ${safeRatio} で生成してください。` : ""}`,
          });
        }
      }
    } catch {
      // 参考画像取得失敗は無視（テキストプロンプトのみで続行）
    }

    // --- ユーザー参考画像のマージ ---
    if (Array.isArray(userReferenceImages) && userReferenceImages.length > 0) {
      const userRefs = userReferenceImages.slice(0, 3);
      // テキストパートがすでに追加されている場合、その前にユーザー参考画像を挿入
      const textPartIndex = contentParts.findIndex((p) => "text" in p);
      for (const ref of userRefs) {
        if (ref.base64 && ref.mimeType) {
          const part: ContentPart = {
            inlineData: {
              data: ref.base64,
              mimeType: ref.mimeType,
            },
          };
          if (textPartIndex >= 0) {
            // テキストプロンプトの直前に挿入
            contentParts.splice(contentParts.length - 1, 0, part);
          } else {
            contentParts.push(part);
          }
        }
      }

      // テキストパートがまだない場合（管理者参考画像がなかった場合）、テキストプロンプトを追加
      if (!contentParts.some((p) => "text" in p) && contentParts.length > 0) {
        contentParts.push({
          text: `${sanitizedPrompt}\n\nUse the above reference image(s) as style/mood reference for the food photography. Match similar lighting, color palette, and composition style.${safeRatio !== "1:1" ? `\n\nアスペクト比: ${safeRatio} で生成してください。` : ""}`,
        });
      }
    }

    const ai = new GoogleGenAI({ apiKey });

    // Gemini Native画像生成を使用（テキスト+画像同時生成が可能）
    // 参考画像がある場合はマルチモーダル入力、なければテキストのみ
    const geminiContents = contentParts.length > 0
      ? contentParts
      : safeRatio !== "1:1"
        ? `${sanitizedPrompt}\n\nアスペクト比: ${safeRatio} で生成してください。`
        : sanitizedPrompt;

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: geminiContents,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const durationMs = Date.now() - startTime;

    // トークン使用量を取得
    const tokensIn = response.usageMetadata?.promptTokenCount ?? null;
    const tokensOut = response.usageMetadata?.candidatesTokenCount ?? null;

    // レスポンスから画像データを抽出
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      await logApiUsage({
        userId,
        sessionId: sessionId ?? null,
        apiType: "image_gen",
        model: IMAGE_MODEL,
        durationMs,
        status: "error",
        errorMessage: "No parts in response",
        tokensIn,
        tokensOut,
      });
      return NextResponse.json(
        { error: "画像の生成に失敗しました。もう一度お試しください。" },
        { status: 502 }
      );
    }

    let imageData: string | null = null;
    let mimeType: string = "image/png";
    let textResponse: string = "";

    for (const part of parts) {
      if (part.text) {
        textResponse += part.text;
      } else if (part.inlineData) {
        imageData = part.inlineData.data ?? null;
        mimeType = part.inlineData.mimeType ?? "image/png";
      }
    }

    if (!imageData) {
      await logApiUsage({
        userId,
        sessionId: sessionId ?? null,
        apiType: "image_gen",
        model: IMAGE_MODEL,
        durationMs,
        status: "error",
        errorMessage: "No image data in response",
        tokensIn,
        tokensOut,
      });
      return NextResponse.json(
        {
          error: "画像を生成できませんでした。プロンプトを変更してもう一度お試しください。",
          text: textResponse || undefined,
        },
        { status: 422 }
      );
    }

    // 成功ログを記録
    await logApiUsage({
      userId,
      sessionId: sessionId ?? null,
      apiType: "image_gen",
      model: IMAGE_MODEL,
      durationMs,
      status: "success",
      tokensIn,
      tokensOut,
    });

    return NextResponse.json({
      image: imageData,
      mimeType,
      text: textResponse || undefined,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Image generation error:", errorMessage);

    // エラー時も使用ログを記録
    await logApiUsage({
      userId,
      apiType: "image_gen",
      model: IMAGE_MODEL,
      durationMs,
      status: "error",
      errorMessage,
    });

    // 無料枠エラーの判定
    if (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        { error: "画像生成のAPI利用上限に達しました。しばらく時間をおいてお試しください。" },
        { status: 429 }
      );
    }

    // モデルが利用不可の場合のフォールバック
    if (errorMessage.includes("not found") || errorMessage.includes("not supported")) {
      return NextResponse.json(
        { error: "画像生成モデルが現在利用できません。管理者にお問い合わせください。" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "画像生成中にエラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
