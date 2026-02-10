"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MessageType } from "@/components/chat/ChatMessage";
import { GeneratedImage, FlowStep } from "@/components/chat/PreviewPanel";

// ========================================
// useChatSession - チャットのビジネスロジックを管理
// ========================================

let msgCounter = 0;
const genId = (prefix: string) =>
  `${prefix}-${++msgCounter}-${Math.random().toString(36).slice(2, 8)}`;

const getTimeStr = () =>
  new Date().toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

const INITIAL_MESSAGE: MessageType = {
  id: "welcome",
  role: "ai",
  content:
    'はじめまして！<strong>MenuCraft AI</strong> です 🍽<br>あなたのお店にぴったりのメニューデザインを一緒に作りましょう！<br><br>まず、<strong>お店の名前</strong>を教えていただけますか？',
  time: getTimeStr(),
};

export interface UseChatSessionOptions {
  restoreSessionId?: string | null;
}

export interface UseChatSessionReturn {
  // 状態
  messages: MessageType[];
  isTyping: boolean;
  isGeneratingImage: boolean;
  generatedImage: GeneratedImage | null | undefined;
  currentProposal: MessageType["proposal"] | null;
  currentStep: FlowStep;
  sessionId: string | null;
  isRestoring: boolean;
  restoredShopName: string | null;

  // ハンドラー
  handleSend: (text: string) => Promise<void>;
  handleQuickReply: (reply: string) => void;
  handleApproveProposal: () => void;
  handleReviseProposal: () => void;
  handleRegenerate: (aspectRatio: string) => void;
}

export function useChatSession(
  options: UseChatSessionOptions = {}
): UseChatSessionReturn {
  const { restoreSessionId } = options;

  const [messages, setMessages] = useState<MessageType[]>([INITIAL_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<
    GeneratedImage | null | undefined
  >(undefined);
  const [currentProposal, setCurrentProposal] = useState<
    MessageType["proposal"] | null
  >(null);
  const [currentStep, setCurrentStep] = useState<FlowStep>(1);
  const [sessionId, setSessionId] = useState<string | null>(
    restoreSessionId || null
  );
  const [isRestoring, setIsRestoring] = useState(!!restoreSessionId);
  const [restoredShopName, setRestoredShopName] = useState<string | null>(null);

  // 保存済みメッセージ数を追跡（差分保存用）
  const savedMsgCountRef = useRef(1); // 初期メッセージ(welcome)分

  // --- セッション復元 ---
  useEffect(() => {
    if (!restoreSessionId) return;

    async function restoreSession() {
      try {
        const res = await fetch(
          `/api/sessions/${restoreSessionId}/messages`
        );
        if (!res.ok) {
          setIsRestoring(false);
          return;
        }
        const data = await res.json();
        const dbMessages: Array<{
          id: string;
          role: "user" | "ai";
          content: string;
          proposal_json: MessageType["proposal"] | null;
          created_at: string;
        }> = data.messages || [];

        if (dbMessages.length === 0) {
          setIsRestoring(false);
          return;
        }

        // DBメッセージをMessageType形式に変換
        const restored: MessageType[] = dbMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content.replace(/\n/g, "<br>"),
          time: new Date(m.created_at).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          proposal: m.proposal_json || undefined,
        }));

        // 最後のProposalを復元
        const lastProposal = [...restored]
          .reverse()
          .find((m) => m.proposal)?.proposal;
        if (lastProposal) {
          setCurrentProposal(lastProposal);
          setRestoredShopName(lastProposal.shopName);
          setCurrentStep(4);
        }

        // 会話の流れからステップを推定
        if (!lastProposal) {
          const allText = restored.map((m) => m.content).join(" ");
          if (/メニュー|料理|価格|写真/.test(allText)) {
            setCurrentStep(3);
          } else if (/デザイン|方向性|テイスト|雰囲気/.test(allText)) {
            setCurrentStep(2);
          }
        }

        // セッション情報取得（店名取得用）
        if (!lastProposal) {
          try {
            const sessionRes = await fetch("/api/dashboard");
            if (sessionRes.ok) {
              const dashData = await sessionRes.json();
              const sessionInfo = (dashData.sessions || []).find(
                (s: { id: string; shop_name?: string }) =>
                  s.id === restoreSessionId
              );
              if (sessionInfo?.shop_name) {
                setRestoredShopName(sessionInfo.shop_name);
              }
            }
          } catch {
            // 店名取得失敗は無視
          }
        }

        setMessages(restored);
        savedMsgCountRef.current = restored.length;
      } catch {
        // 復元失敗時はデフォルトの新規チャット状態を維持
      } finally {
        setIsRestoring(false);
      }
    }

    restoreSession();
  }, [restoreSessionId]);

  // --- DB操作 ---

  const ensureSession = useCallback(async () => {
    if (sessionId) return sessionId;
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "新規セッション" }),
      });
      const data = await res.json();
      if (data.session?.id) {
        setSessionId(data.session.id);
        return data.session.id as string;
      }
    } catch {
      // DB未接続時は無視
    }
    return null;
  }, [sessionId]);

  const saveMessages = useCallback(
    async (
      sid: string | null,
      allMessages: MessageType[],
      shopName?: string,
      category?: string
    ) => {
      if (!sid) return;
      const unsaved = allMessages.slice(savedMsgCountRef.current);
      if (unsaved.length === 0) return;
      try {
        const rows = unsaved.map((m) => ({
          role: m.role,
          content: m.content.replace(/<[^>]*>/g, ""), // HTMLタグ除去
          proposal_json: m.proposal || null,
        }));
        await fetch(`/api/sessions/${sid}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: rows, shopName, category }),
        });
        savedMsgCountRef.current = allMessages.length;
      } catch {
        // 保存失敗は無視（チャット自体は継続）
      }
    },
    []
  );

  const saveImage = useCallback(
    async (
      sid: string | null,
      imageBase64: string,
      mimeType: string,
      prompt: string,
      aspectRatio: string,
      proposalJson: unknown
    ) => {
      if (!sid) return;
      try {
        await fetch("/api/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sid,
            imageBase64,
            mimeType,
            prompt,
            aspectRatio,
            proposalJson,
          }),
        });
      } catch {
        // 保存失敗は無視
      }
    },
    []
  );

  // --- API呼び出し ---

  const callGeminiAPI = async (allMessages: MessageType[]) => {
    try {
      const apiMessages = allMessages.map((m) => ({
        role: m.role,
        content: m.content.replace(/<[^>]*>/g, ""),
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, sessionId }),
      });

      const data = await res.json();
      let reply =
        data.reply || "申し訳ございません、応答を取得できませんでした。";

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
              reply =
                "構成案をまとめました。こちらでよろしければ、画像生成に進みます 👇";
            }
          }
        } catch {
          // JSON解析失敗は無視
        }
      }

      reply = reply.replace(/\n/g, "<br>");
      return { reply, proposal };
    } catch {
      return {
        reply: "通信エラーが発生しました。もう一度お試しください。",
        proposal: undefined,
      };
    }
  };

  // --- 画像生成 ---

  const generateImage = async (
    proposal: MessageType["proposal"],
    aspectRatio: string = "1:1"
  ) => {
    if (!proposal) return;

    setIsGeneratingImage(true);
    setGeneratedImage(undefined);
    setCurrentStep(5);

    try {
      const prompt = `A professional food photography for a restaurant menu.
Restaurant: ${proposal.shopName}
Design style: ${proposal.designDirection || "natural, warm"}
Mood: appetizing, warm lighting, high-quality food photo
IMPORTANT: Do NOT include any text, letters, words, numbers, watermarks, or captions in the image. Generate ONLY the food photograph with no text overlay whatsoever.`;

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio, sessionId }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const errorMsg: MessageType = {
          id: genId("ai-err"),
          role: "ai",
          content: `⚠️ ${data.error || "画像の生成に失敗しました。もう一度お試しください。"}`,
          time: getTimeStr(),
        };
        setMessages((prev) => [...prev, errorMsg]);
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
        setMessages((prev) => [...prev, successMsg]);

        // 画像をDBに保存
        saveImage(
          sessionId,
          data.image,
          data.mimeType,
          prompt,
          aspectRatio,
          proposal
        );

        // セッションステータスを「completed」に更新
        if (sessionId) {
          fetch(`/api/sessions/${sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "completed" }),
          }).catch(() => {});
        }
      }
    } catch {
      const errorMsg: MessageType = {
        id: genId("ai-err"),
        role: "ai",
        content:
          "⚠️ 画像生成中に通信エラーが発生しました。もう一度お試しください。",
        time: getTimeStr(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setGeneratedImage(null);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- 構成案予告判定 ---

  const isProposalPreview = (text: string): boolean => {
    const plain = text.replace(/<[^>]*>/g, "");
    const hasKeyword = /構成案|まとめ|キャッチコピー.*考え/.test(plain);
    const hasPromise = /お見せ|ご連絡|お待ち|準備/.test(plain);
    return hasKeyword && hasPromise;
  };

  // --- ハンドラー ---

  const handleSend = async (text: string) => {
    const sid = await ensureSession();

    const userMsg: MessageType = {
      id: genId("user"),
      role: "user",
      content: text,
      time: getTimeStr(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    const { reply, proposal } = await callGeminiAPI(updatedMessages);

    if (proposal) {
      setCurrentProposal(proposal);
      setCurrentStep(4);
    }

    const aiMsg: MessageType = {
      id: genId("ai"),
      role: "ai",
      content: reply,
      time: getTimeStr(),
      proposal,
    };

    const msgsWithAi = [...updatedMessages, aiMsg];
    setMessages(msgsWithAi);

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
      } else if (
        currentStep === 2 &&
        /メニュー|料理|価格|写真/.test(plain)
      ) {
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
      const { reply: reply2, proposal: proposal2 } =
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
      };
      setMessages((prev) => {
        const updated = [...prev, aiMsg2];
        saveMessages(sid, updated, proposal2?.shopName);
        return updated;
      });
    }

    setIsTyping(false);
  };

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  const handleApproveProposal = () => {
    if (isGeneratingImage || isTyping) return;

    const latestProposal =
      currentProposal || messages.findLast((m) => m.proposal)?.proposal;
    if (latestProposal) {
      const copyLabel = latestProposal.catchCopies?.[0]
        ? `「${latestProposal.catchCopies[0]}」`
        : "この内容";
      const userMsg: MessageType = {
        id: genId("user"),
        role: "user",
        content: `${copyLabel}でお願いします！画像を生成してください。`,
        time: getTimeStr(),
      };
      setMessages((prev) => [...prev, userMsg]);
      generateImage(latestProposal);
    }
  };

  const handleReviseProposal = () => {
    handleSend(
      "構成案を修正したいです。別のキャッチコピーやデザインの方向性を提案してもらえますか？"
    );
  };

  const handleRegenerate = (aspectRatio: string) => {
    const latestProposal =
      currentProposal || messages.findLast((m) => m.proposal)?.proposal;
    if (latestProposal) {
      generateImage(latestProposal, aspectRatio);
    }
  };

  return {
    // 状態
    messages,
    isTyping,
    isGeneratingImage,
    generatedImage,
    currentProposal,
    currentStep,
    sessionId,
    isRestoring,
    restoredShopName,

    // ハンドラー
    handleSend,
    handleQuickReply,
    handleApproveProposal,
    handleReviseProposal,
    handleRegenerate,
  };
}
