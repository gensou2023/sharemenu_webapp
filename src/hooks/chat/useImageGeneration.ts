"use client";

import { useState } from "react";
import type { MessageType, GeneratedImage, FlowStep } from "./types";
import { genId, getTimeStr, inferCategory } from "./chatUtils";

export function useImageGeneration({
  sessionId,
  onMessagesAdd,
  onStepChange,
  saveImage,
  referenceImages,
}: {
  sessionId: string | null;
  onMessagesAdd: (msg: MessageType) => void;
  onStepChange: (step: FlowStep) => void;
  saveImage: (
    sid: string | null,
    imageBase64: string,
    mimeType: string,
    prompt: string,
    aspectRatio: string,
    proposalJson: unknown
  ) => Promise<void>;
  referenceImages?: Array<{ base64: string; mimeType: string; fileName: string }>;
}) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<
    GeneratedImage | null | undefined
  >(undefined);
  const [lastUsedPrompt, setLastUsedPrompt] = useState<string | null>(null);

  const generateImage = async (
    proposal: MessageType["proposal"],
    aspectRatio: string = "1:1"
  ) => {
    if (!proposal) return;

    setIsGeneratingImage(true);
    setGeneratedImage(undefined);
    onStepChange(5);

    // オフラインチェック
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const offlineMsg: MessageType = {
        id: genId("ai-err"),
        role: "ai",
        content: "⚠️ インターネットに接続されていません。接続を確認してから再生成してください。",
        time: getTimeStr(),
        isError: true,
      };
      onMessagesAdd(offlineMsg);
      setGeneratedImage(null);
      setIsGeneratingImage(false);
      return;
    }

    try {
      const prompt = `A professional food photography for a restaurant menu.
Restaurant: ${proposal.shopName}
Design style: ${proposal.designDirection || "natural, warm"}
Mood: appetizing, warm lighting, high-quality food photo
IMPORTANT: Do NOT include any text, letters, words, numbers, watermarks, or captions in the image. Generate ONLY the food photograph with no text overlay whatsoever.`;

      setLastUsedPrompt(prompt);

      const category = inferCategory(proposal);

      // 最新3枚の参考画像を送信（ペイロードサイズ対策）
      const userReferenceImages = (referenceImages || []).slice(-3).map((img) => ({
        base64: img.base64,
        mimeType: img.mimeType,
      }));

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          sessionId,
          category,
          ...(userReferenceImages.length > 0 ? { userReferenceImages } : {}),
        }),
      });

      const data = await res.json().catch(() => ({ error: "" }));

      if (!res.ok || data.error) {
        let errorContent: string;
        let retryAfterMs: number | undefined;

        if (res.status === 429) {
          const retryAfter = res.headers.get("Retry-After");
          retryAfterMs = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
          errorContent = `⚠️ 画像生成のリクエストが多すぎます。${Math.ceil(retryAfterMs / 1000)}秒後に再度お試しください。`;
        } else if (res.status === 401) {
          errorContent = "⚠️ ログインセッションが切れました。ページを再読み込みしてください。";
        } else if (res.status === 503) {
          errorContent = "⚠️ 画像生成サービスが一時的に利用できません。しばらくしてから「再生成」ボタンをお試しください。";
        } else {
          errorContent = `⚠️ ${data.error || "画像の生成に失敗しました。プレビューパネルの「再生成」ボタンからもう一度お試しください。"}`;
        }

        const errorMsg: MessageType = {
          id: genId("ai-err"),
          role: "ai",
          content: errorContent,
          time: getTimeStr(),
          isError: true,
          retryAfterMs,
        };
        onMessagesAdd(errorMsg);
        setGeneratedImage(null);
      } else if (data.image) {
        setGeneratedImage({ data: data.image, mimeType: data.mimeType });
        const successMsg: MessageType = {
          id: genId("ai-img"),
          role: "ai",
          content:
            "画像が生成されました！ 🎉<br>プレビューパネルで確認し、ダウンロードできます。<br>別のデザインをご希望の場合は「再生成」ボタンをお使いください。",
          time: getTimeStr(),
        };
        onMessagesAdd(successMsg);

        // 画像をDBに保存
        saveImage(sessionId, data.image, data.mimeType, prompt, aspectRatio, proposal);

        // セッションステータスを「completed」に更新
        if (sessionId) {
          fetch(`/api/sessions/${sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "completed" }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      const errorMsg: MessageType = {
        id: genId("ai-err"),
        role: "ai",
        content: isOffline
          ? "⚠️ インターネットに接続されていません。接続を確認してから再生成してください。"
          : "⚠️ 画像生成中に通信エラーが発生しました。プレビューパネルの「再生成」ボタンからもう一度お試しください。",
        time: getTimeStr(),
        isError: true,
      };
      console.error("Image generation error:", err);
      onMessagesAdd(errorMsg);
      setGeneratedImage(null);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return { isGeneratingImage, generatedImage, generateImage, lastUsedPrompt };
}
