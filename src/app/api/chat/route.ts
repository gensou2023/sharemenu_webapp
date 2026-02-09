import { GoogleGenerativeAI } from "@google/generative-ai";
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

    const { messages } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // チャット履歴を構築
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history,
      systemInstruction: SYSTEM_PROMPT,
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini API error:", errorMessage);
    return NextResponse.json(
      { reply: `申し訳ございません。エラーが発生しました。(${errorMessage})` },
      { status: 200 }
    );
  }
}
