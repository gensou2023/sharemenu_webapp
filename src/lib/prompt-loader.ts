import { createAdminClient } from "@/lib/supabase";

type PromptName = "chat_system" | "image_gen";

interface CacheEntry {
  content: string;
  fetchedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5分
const promptCache = new Map<PromptName, CacheEntry>();

/**
 * フォールバック用のデフォルトプロンプト。
 * DB取得失敗時に使用される。
 */
const FALLBACK_PROMPTS: Record<PromptName, string> = {
  chat_system: `あなたは「MenuCraft AI」というAIメニューデザインアシスタントです。
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
- 飲食店オーナーが相手なので、専門用語は避ける`,

  image_gen: `A professional food photography for a restaurant menu.
Restaurant: {shopName}
Design style: {designDirection}
Mood: appetizing, warm lighting, high-quality food photo
IMPORTANT: Do NOT include any text, letters, words, numbers, watermarks, or captions in the image. Generate ONLY the food photograph with no text overlay whatsoever.`,
};

/**
 * DBからアクティブなプロンプトテンプレートを取得する。
 * インメモリキャッシュ（5分TTL）を使用し、DB取得失敗時はフォールバック定数を返す。
 */
export async function getActivePrompt(name: PromptName): Promise<string> {
  // キャッシュチェック
  const cached = promptCache.get(name);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.content;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("prompt_templates")
      .select("content")
      .eq("name", name)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (error || !data?.content) {
      console.warn(`Failed to load prompt "${name}" from DB, using fallback`);
      return FALLBACK_PROMPTS[name];
    }

    // キャッシュ更新
    promptCache.set(name, {
      content: data.content,
      fetchedAt: Date.now(),
    });

    return data.content;
  } catch (err) {
    console.warn(`Error loading prompt "${name}":`, err);
    return FALLBACK_PROMPTS[name];
  }
}

/**
 * プロンプトキャッシュをクリアする。
 * 管理画面でプロンプト更新時に呼び出す。
 */
export function clearPromptCache(): void {
  promptCache.clear();
}
