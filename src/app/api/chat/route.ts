import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import { logApiUsage } from "@/lib/api-logger";
import { getActivePrompt } from "@/lib/prompt-loader";
import { checkRateLimit } from "@/lib/rate-limiter";
import { checkAchievements } from "@/lib/achievement-checker";

const CHAT_MODEL = "gemini-2.0-flash";

export async function POST(req: NextRequest) {
  // --- 認証チェック ---
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { reply: "認証が必要です。ログインしてください。" },
      { status: 401 }
    );
  }
  const userId = session.user.id;

  // --- レート制限チェック ---
  const rateLimit = checkRateLimit(userId, "chat");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらくお待ちください。" },
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
        {
          reply:
            "Gemini APIキーが設定されていません。`.env.local` の `GEMINI_API_KEY` を設定してください。",
        },
        { status: 200 }
      );
    }

    const body = await req.json();
    const { messages, sessionId, imageBase64, imageMimeType } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { reply: "メッセージが指定されていません。" },
        { status: 400 }
      );
    }

    // メッセージの長さ制限（直近20件のみ使用）
    const recentMessages = messages.slice(-20);

    const ai = new GoogleGenAI({ apiKey });

    // DBからシステムプロンプトを取得（キャッシュ＋フォールバック付き）
    let systemPrompt = await getActivePrompt("chat_system");

    // ユーザーの店舗プロフィールをシステムプロンプトに注入
    try {
      const supabase = createAdminClient();
      const { data: profile } = await supabase
        .from("users")
        .select("name, business_type, shop_concept, brand_color_primary")
        .eq("id", userId)
        .single();

      if (profile?.business_type) {
        systemPrompt += `\n\nユーザーの店舗情報:\n店名: ${profile.name || "未設定"}\n業態: ${profile.business_type}\nコンセプト: ${profile.shop_concept || "未設定"}\nブランドカラー: ${profile.brand_color_primary || "未設定"}\nこの情報を踏まえて、既に把握済みの項目は再度質問せず、未設定の項目のみヒアリングしてください。`;
      }
    } catch {
      // プロフィール取得失敗時は通常のプロンプトで続行
    }

    // チャット履歴を構築（最初のAIメッセージを除外し、userから始まるようにする）
    const filteredMessages = recentMessages.slice(0, -1);
    const startIndex = filteredMessages.length > 0 && filteredMessages[0].role === "ai" ? 1 : 0;
    const history = filteredMessages.slice(startIndex).map((msg: { role: string; content: string }) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: CHAT_MODEL,
      history,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const lastMessage = recentMessages[recentMessages.length - 1];
    // メッセージを最大1000文字に制限
    const userContent = typeof lastMessage.content === "string"
      ? lastMessage.content.slice(0, 1000)
      : "";

    // 画像付きメッセージの場合、inlineDataとして送信
    let response;
    if (imageBase64 && imageMimeType) {
      response = await chat.sendMessage({
        message: [
          { text: userContent },
          { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
        ],
      });
    } else {
      response = await chat.sendMessage({ message: userContent });
    }
    const durationMs = Date.now() - startTime;
    const reply = response.text ?? "";

    // トークン使用量を取得
    const tokensIn = response.usageMetadata?.promptTokenCount ?? null;
    const tokensOut = response.usageMetadata?.candidatesTokenCount ?? null;

    // 使用ログを記録
    await logApiUsage({
      userId,
      sessionId: sessionId ?? null,
      apiType: "chat",
      model: CHAT_MODEL,
      durationMs,
      status: "success",
      tokensIn,
      tokensOut,
    });

    // バッジ判定（非ブロッキング）
    checkAchievements(userId).catch(() => {});

    return NextResponse.json({ reply });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini API error:", errorMessage);

    // エラー時も使用ログを記録
    await logApiUsage({
      userId,
      apiType: "chat",
      model: CHAT_MODEL,
      durationMs,
      status: "error",
      errorMessage,
    });

    return NextResponse.json(
      { reply: "申し訳ございません。エラーが発生しました。もう一度お試しください。" },
      { status: 200 }
    );
  }
}
