"use client";

import { useState, useEffect, useCallback } from "react";
import type { MessageType, FlowStep } from "./chat/types";
import { genId, getTimeStr, INITIAL_MESSAGE } from "./chat/chatUtils";
import { useSessionRestore } from "./chat/useSessionRestore";
import { useSessionPersistence } from "./chat/useSessionPersistence";
import { useImageGeneration } from "./chat/useImageGeneration";
import { useChatFlow } from "./chat/useChatFlow";

// 後方互換のため再エクスポート
export type { UseChatSessionOptions, UseChatSessionReturn } from "./chat/types";

export function useChatSession(
  options: { restoreSessionId?: string | null } = {}
) {
  const { restoreSessionId } = options;

  // --- 状態 ---
  const [messages, setMessages] = useState<MessageType[]>([INITIAL_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<
    MessageType["proposal"] | null
  >(null);
  const [currentStep, setCurrentStep] = useState<FlowStep>(1);

  // --- セッション復元 ---
  const {
    isRestoring,
    restoredShopName,
    restoredMessages,
    restoredProposal,
    restoredStep,
    savedMsgCount,
  } = useSessionRestore({ restoreSessionId });

  // 復元データの適用
  useEffect(() => {
    if (restoredMessages) {
      setMessages(restoredMessages);
    }
  }, [restoredMessages]);

  useEffect(() => {
    if (restoredProposal) {
      setCurrentProposal(restoredProposal);
    }
  }, [restoredProposal]);

  useEffect(() => {
    if (restoredStep) {
      setCurrentStep(restoredStep);
    }
  }, [restoredStep]);

  // --- DB永続化 ---
  const { sessionId, ensureSession, saveMessages, saveImage } =
    useSessionPersistence({
      initialSessionId: restoreSessionId || null,
      initialSavedMsgCount: restoreSessionId ? savedMsgCount : 1,
    });

  // --- 画像生成 ---
  const onMessagesAdd = useCallback(
    (msg: MessageType) => setMessages((prev) => [...prev, msg]),
    []
  );

  const onStepChange = useCallback((step: FlowStep) => setCurrentStep(step), []);

  const { isGeneratingImage, generatedImage, generateImage } =
    useImageGeneration({
      sessionId,
      onMessagesAdd,
      onStepChange,
      saveImage,
    });

  // --- チャットフロー ---
  const { sendMessage } = useChatFlow({
    sessionId,
    currentStep,
    setCurrentStep,
    saveMessages,
  });

  // --- ハンドラー ---

  const handleSend = async (text: string) => {
    const sid = await ensureSession();
    await sendMessage(text, messages, sid, {
      setMessages,
      setIsTyping,
      setCurrentProposal,
    });
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

  const handleRetry = (retryPayload: string) => {
    if (isTyping || isGeneratingImage) return;
    setMessages((prev) =>
      prev.filter((m) => !(m.isError && m.retryPayload === retryPayload))
    );
    handleSend(retryPayload);
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
    handleRetry,
  };
}
