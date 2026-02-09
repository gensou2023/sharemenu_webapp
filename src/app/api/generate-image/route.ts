import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      return NextResponse.json(
        { error: "Gemini APIキーが設定されていません。" },
        { status: 500 }
      );
    }

    const { prompt, aspectRatio = "1:1" } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "プロンプトが指定されていません。" },
        { status: 400 }
      );
    }

    // プロンプト長制限
    const sanitizedPrompt = prompt.slice(0, 2000);

    // アスペクト比のバリデーション
    const validRatios = ["1:1", "9:16", "16:9", "3:4", "4:3"];
    const safeRatio = validRatios.includes(aspectRatio) ? aspectRatio : "1:1";

    const ai = new GoogleGenAI({ apiKey });

    // Gemini Native画像生成を使用（テキスト+画像同時生成が可能）
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: safeRatio !== "1:1"
        ? `${sanitizedPrompt}\n\nアスペクト比: ${safeRatio} で生成してください。`
        : sanitizedPrompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    // レスポンスから画像データを抽出
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
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
      return NextResponse.json(
        {
          error: "画像を生成できませんでした。プロンプトを変更してもう一度お試しください。",
          text: textResponse || undefined,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      image: imageData,
      mimeType,
      text: textResponse || undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Image generation error:", errorMessage);

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
