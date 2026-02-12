"use client";

import type { MessageType, FlowStep, ApiResult } from "./types";
import { genId, getTimeStr, DESIGN_DIRECTION_OPTIONS, isProposalPreview } from "./chatUtils";

export function useChatFlow({
  sessionId,
  currentStep,
  setCurrentStep,
  saveMessages,
}: {
  sessionId: string | null;
  currentStep: FlowStep;
  setCurrentStep: (step: FlowStep) => void;
  saveMessages: (
    sid: string | null,
    allMessages: MessageType[],
    shopName?: string,
    category?: string
  ) => Promise<void>;
}) {
  const callGeminiAPI = async (allMessages: MessageType[], imageBase64?: string, imageMimeType?: string): Promise<ApiResult> => {
    // オフラインチェック
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return {
        reply: "⚠️ インターネットに接続されていません。接続を確認してからもう一度お試しください。",
        isError: true,
      };
    }

    try {
      const apiMessages = allMessages.map((m) => ({
        role: m.role,
        content: m.content.replace(/<[^>]*>/g, ""),
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          sessionId,
          ...(imageBase64 && imageMimeType ? { imageBase64, imageMimeType } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "" }));

        if (res.status === 429) {
          const retryAfter = res.headers.get("Retry-After");
          const retryMs = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
          return {
            reply: `⚠️ リクエストが多すぎます。${Math.ceil(retryMs / 1000)}秒後に再度お試しください。`,
            isError: true,
            retryAfterMs: retryMs,
          };
        }

        if (res.status === 401) {
          return {
            reply: "⚠️ ログインセッションが切れました。ページを再読み込みして再度ログインしてください。",
            isError: true,
          };
        }

        return {
          reply: `⚠️ ${data.error || "サーバーエラーが発生しました。しばらくしてからもう一度お試しください。"}`,
          isError: true,
        };
      }

      const data = await res.json();
      let reply = data.reply || "申し訳ございません、応答を取得できませんでした。";

      // 構成案JSONが含まれているかチェック
      const jsonMatch = reply.match(/```json\s*([\s\S]*?)\s*```/);
      let proposal: MessageType["proposal"] | undefined;

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.type === "proposal") {
            proposal = {
              shopName: parsed.shopName,
              catchCopies: parsed.catchCopies,
              designDirection: parsed.designDirection,
              hashtags: parsed.hashtags,
            };
            reply = reply.replace(/```json[\s\S]*?```/, "").trim();
            if (!reply) {
              reply = "構成案をまとめました。こちらでよろしければ、画像生成に進みます 👇";
            }
          }
        } catch {
          // JSON解析失敗は無視
        }
      }

      reply = reply.replace(/\n/g, "<br>");
      return { reply, proposal };
    } catch (err) {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      if (isOffline) {
        return {
          reply: "⚠️ インターネットに接続されていません。接続を確認してからもう一度お試しください。",
          isError: true,
        };
      }
      console.error("Chat API error:", err);
      return {
        reply: "⚠️ 通信エラーが発生しました。もう一度お試しください。",
        isError: true,
      };
    }
  };

  const sendMessage = async (
    text: string,
    messages: MessageType[],
    sid: string | null,
    callbacks: {
      setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
      setIsTyping: (v: boolean) => void;
      setCurrentProposal: (p: MessageType["proposal"] | null) => void;
    },
    image?: { base64: string; mimeType: string; fileName: string; imageType?: "shop_photo" | "reference" }
  ) => {
    const { setMessages, setIsTyping, setCurrentProposal } = callbacks;

    // 画像アップロード処理
    let imageData: MessageType["image"] | undefined;
    let imageBase64ForApi: string | undefined;
    let imageMimeTypeForApi: string | undefined;

    if (image) {
      try {
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: image.base64,
            mimeType: image.mimeType,
            sessionId: sid,
          }),
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const publicUrl = uploadData.signedUrl
            || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${uploadData.storagePath}`;

          const fileSizeKB = Math.round((uploadData.compressedSize || image.base64.length * 0.75) / 1024);
          const isReference = image.imageType === "reference";
          imageData = {
            emoji: isReference ? "🎨" : "📷",
            fileName: image.fileName,
            fileSize: `${fileSizeKB}KB`,
            bgColor: isReference ? "#FFF8E7" : "#F5F3F0",
            storagePath: uploadData.storagePath,
            publicUrl,
            mimeType: uploadData.mimeType || image.mimeType,
            imageType: image.imageType,
          };
          imageBase64ForApi = image.base64;
          imageMimeTypeForApi = image.mimeType;
        }
      } catch {
        // アップロード失敗時はテキストのみで続行
      }
    }

    const userMsg: MessageType = {
      id: genId("user"),
      role: "user",
      content: text,
      time: getTimeStr(),
      image: imageData,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    const { reply, proposal, isError, retryAfterMs } = await callGeminiAPI(updatedMessages, imageBase64ForApi, imageMimeTypeForApi);

    if (proposal) {
      setCurrentProposal(proposal);
      setCurrentStep(4);
    }

    // ステップ2（方向性を聞いている）の判定 → quickReplies 付与
    let quickReplies: string[] | undefined;
    if (!isError && !proposal) {
      const plain = reply.replace(/<[^>]*>/g, "");
      if (currentStep === 1 && /デザイン|方向性|テイスト|雰囲気/.test(plain)) {
        quickReplies = DESIGN_DIRECTION_OPTIONS;
      }
    }

    const aiMsg: MessageType = {
      id: genId("ai"),
      role: "ai",
      content: reply,
      time: getTimeStr(),
      proposal,
      quickReplies,
      isError,
      retryPayload: isError ? text : undefined,
      retryAfterMs,
    };

    const msgsWithAi = [...updatedMessages, aiMsg];
    setMessages(msgsWithAi);

    // エラーでない場合のみDB保存
    if (!isError) {
      saveMessages(sid, msgsWithAi, proposal?.shopName);

      // セッションタイトルを店名で更新
      if (proposal?.shopName && sid) {
        fetch(`/api/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: proposal.shopName }),
        }).catch(() => {});
      }

      // ステップ自動進行
      if (!proposal) {
        const plain = reply.replace(/<[^>]*>/g, "");
        if (currentStep === 1 && /デザイン|方向性|テイスト|雰囲気/.test(plain)) {
          setCurrentStep(2);
        } else if (currentStep === 2 && /メニュー|料理|価格|写真/.test(plain)) {
          setCurrentStep(3);
        }
      }

      // 構成案の予告だけで終わった場合、自動フォローアップ
      if (!proposal && isProposalPreview(reply)) {
        const followUp: MessageType[] = [...updatedMessages, aiMsg];
        const followUpUser: MessageType = {
          id: genId("auto"),
          role: "user",
          content: "はい、お願いします！構成案をJSON形式で見せてください。",
          time: getTimeStr(),
        };
        const allMsgs = [...followUp, followUpUser];
        const { reply: reply2, proposal: proposal2, isError: isError2 } =
          await callGeminiAPI(allMsgs);

        if (proposal2) {
          setCurrentProposal(proposal2);
          setCurrentStep(4);
        }

        const aiMsg2: MessageType = {
          id: genId("ai"),
          role: "ai",
          content: reply2,
          time: getTimeStr(),
          proposal: proposal2,
          isError: isError2,
        };
        setMessages((prev) => {
          const updated = [...prev, aiMsg2];
          if (!isError2) {
            saveMessages(sid, updated, proposal2?.shopName);
          }
          return updated;
        });
      }
    }

    setIsTyping(false);
  };

  return { sendMessage, callGeminiAPI };
}
