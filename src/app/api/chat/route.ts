import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `あなたは「MenuCraft AI」というAIメニューデザインアシスタントです。
飲食店オーナーのメニュー画像作成を手伝います。

## あなたの役割
1. お店の名前、料理の情報、デザインの方向性をヒアリングする
2. メニューのキャッチコピーとハッシュタグを提案する
3. 構成案をまとめて提示する

## ヒアリングの流れ
1. まずお店の名前を聞く
2. デザインの方向性（和モダン/ナチュラル/シック/ポップ）を聞く
3. 料理写真のアップロードを促す（テキストのみの場合はスキップ）
4. メニュー名と価格を聞く
5. 構成案をJSON形式で提示する

## 構成案の出力形式
ヒアリングが完了したら、以下のJSON形式で構成案を出力してください（必ず \`\`\`json\`\`\` で囲む）：

\`\`\`json
{
  "type": "proposal",
  "shopName": "店舗名",
  "catchCopies": ["キャッチコピーA", "キャッチコピーB"],
  "designDirection": "デザイン方向性の説明",
  "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
}
\`\`\`

## 注意事項
- 親しみやすく丁寧な日本語で会話する
- 絵文字を適度に使う
- 1回のメッセージは短めにする（長文を避ける）
- 飲食店オーナーが相手なので、専門用語は避ける
`;

export async function POST(req: NextRequest) {
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
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { reply: "メッセージが指定されていません。" },
        { status: 400 }
      );
    }

    // メッセージの長さ制限（直近20件のみ使用）
    const recentMessages = messages.slice(-20);

    const ai = new GoogleGenAI({ apiKey });

    // チャット履歴を構築（最初のAIメッセージを除外し、userから始まるようにする）
    const filteredMessages = recentMessages.slice(0, -1);
    const startIndex = filteredMessages.length > 0 && filteredMessages[0].role === "ai" ? 1 : 0;
    const history = filteredMessages.slice(startIndex).map((msg: { role: string; content: string }) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    const lastMessage = recentMessages[recentMessages.length - 1];
    // メッセージを最大1000文字に制限
    const userContent = typeof lastMessage.content === "string"
      ? lastMessage.content.slice(0, 1000)
      : "";
    const response = await chat.sendMessage({ message: userContent });
    const reply = response.text ?? "";

    return NextResponse.json({ reply });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini API error:", errorMessage);
    return NextResponse.json(
      { reply: "申し訳ございません。エラーが発生しました。もう一度お試しください。" },
      { status: 200 }
    );
  }
}
