"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/landing/Header";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import PreviewPanel from "@/components/chat/PreviewPanel";
import PromptMode from "@/components/chat/PromptMode";
import SavePromptModal from "@/components/chat/SavePromptModal";
import Link from "next/link";
import AdPlaceholder from "@/components/AdPlaceholder";
import { useChatSession } from "@/hooks/useChatSession";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import type { GeneratedImage } from "@/lib/types";

// useSearchParamsを使うコンポーネントをSuspenseでラップ
export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-center">
          <div className="text-4xl mb-3">🍽</div>
          <div className="text-sm text-text-muted">読み込み中...</div>
        </div>
      </div>
    }>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const restoreSessionId = searchParams.get("session");

  const {
    messages,
    isTyping,
    isGeneratingImage,
    generatedImage,
    currentProposal,
    currentStep,
    sessionId,
    isRestoring,
    restoredShopName,
    lastUsedPrompt,
    handleSend,
    handleQuickReply,
    handleApproveProposal,
    handleReviseProposal,
    handleRegenerate,
    handleRetry,
  } = useChatSession({ restoreSessionId });

  const { data: authSession } = useSession();
  const isAdmin = authSession?.user?.role === "admin";
  const isOnline = useOnlineStatus();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [promptMode, setPromptMode] = useState(false);
  const [promptGeneratedImage, setPromptGeneratedImage] = useState<GeneratedImage | null>(null);
  const [promptIsGenerating, setPromptIsGenerating] = useState(false);
  const [promptLastUsedPrompt, setPromptLastUsedPrompt] = useState<string | null>(null);
  const [showSavePromptModal, setShowSavePromptModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 画面幅に応じてプレビューのデフォルト状態を設定
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setPreviewOpen(true);
    }
  }, []);

  // 画像生成開始時にプレビューを自動で開く
  useEffect(() => {
    if (isGeneratingImage || promptIsGenerating) {
      setPreviewOpen(true);
    }
  }, [isGeneratingImage, promptIsGenerating]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // プロンプトモードからの画像生成
  const handlePromptGenerate = async (prompt: string, aspectRatio: string) => {
    setPromptIsGenerating(true);
    setPromptGeneratedImage(null);
    setPromptLastUsedPrompt(prompt);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          sessionId: sessionId || undefined,
        }),
      });

      const data = await res.json().catch(() => ({ error: "" }));

      if (!res.ok || data.error) {
        setPromptGeneratedImage(null);
      } else if (data.image) {
        setPromptGeneratedImage({ data: data.image, mimeType: data.mimeType });
      }
    } catch {
      setPromptGeneratedImage(null);
    } finally {
      setPromptIsGenerating(false);
    }
  };

  // 表示する画像・生成状態をモードで切替
  const displayImage = promptMode ? promptGeneratedImage : generatedImage;
  const displayIsGenerating = promptMode ? promptIsGenerating : isGeneratingImage;
  const displayLastUsedPrompt = promptMode ? promptLastUsedPrompt : lastUsedPrompt;

  // プロンプト保存モーダルの表示
  const handleOpenSavePrompt = () => {
    setShowSavePromptModal(true);
  };

  return (
    <>
      <Header activeTab="chat" />
      <div className="flex h-[calc(100vh-56px)] mt-[56px]">
        {/* チャットメイン */}
        <div className="flex-1 flex flex-col min-w-0 bg-bg-primary relative overflow-hidden">
          {/* 背景装飾ブラー（ツール画面のため控えめ） */}
          <div className="absolute top-[10%] left-[5%] w-56 h-56 bg-accent-warm/[.03] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[20%] right-[5%] w-48 h-48 bg-accent-gold/[.03] rounded-full blur-3xl pointer-events-none" />

          {/* チャットヘッダー */}
          <div className="relative z-10 px-4 md:px-7 py-3 md:py-4 border-b border-border-light flex items-center justify-between bg-bg-secondary flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-olive animate-pulse" />
              <div>
                <span className="text-[10px] font-semibold text-accent-warm uppercase tracking-[1.5px]">
                  Menu Design
                </span>
                <div className="font-semibold text-sm md:text-[15px]">
                  {restoredShopName
                    ? `メニューデザイン - ${restoredShopName}`
                    : "メニューデザイン - 新規作成"}
                </div>
                <div className="text-xs text-text-muted hidden sm:block">
                  {promptMode ? "プロンプトモード" : "AIアシスタントとチャット"}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {/* プロンプトモード切替（admin限定） */}
              {isAdmin && (
                <button
                  onClick={() => setPromptMode(!promptMode)}
                  title="プロンプトモード切替"
                  className={`h-9 px-3 rounded-full border text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-300 ${
                    promptMode
                      ? "bg-accent-warm text-white border-accent-warm shadow-[0_2px_8px_rgba(232,113,58,.2)]"
                      : "bg-bg-secondary text-text-secondary border-border-light hover:bg-accent-warm/10 hover:text-accent-warm hover:border-accent-warm/30"
                  }`}
                >
                  ⚡ プロンプト
                </button>
              )}
              <button
                onClick={() => setPreviewOpen(!previewOpen)}
                title="プレビュー切替"
                className="w-9 h-9 rounded-full border border-border-light bg-bg-secondary cursor-pointer flex items-center justify-center transition-all duration-300 text-text-secondary hover:bg-accent-warm/10 hover:text-accent-warm hover:border-accent-warm/30"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="1" width="7" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="10" y="1" width="7" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <Link
                href="/dashboard"
                title="ダッシュボード"
                className="w-9 h-9 rounded-full border border-border-light bg-bg-secondary cursor-pointer flex items-center justify-center transition-all duration-300 text-text-secondary hover:bg-accent-warm/10 hover:text-accent-warm hover:border-accent-warm/30 no-underline"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9l6-6 6 6M5 7.5V15h3v-4h2v4h3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* オフラインバナー */}
          {!isOnline && (
            <div className="relative z-10 px-4 md:px-7 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-amber-600 flex-shrink-0">
                <path d="M8 1L1 14h14L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 6v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-xs text-amber-800">オフラインです。インターネット接続を確認してください。</span>
            </div>
          )}

          {promptMode ? (
            /* プロンプトモード */
            <PromptMode
              onGenerate={handlePromptGenerate}
              isGenerating={promptIsGenerating}
            />
          ) : (
            <>
              {/* メッセージ一覧 */}
              <div className="relative z-10 flex-1 overflow-y-auto px-4 md:px-7 py-5 md:py-7 flex flex-col gap-4 md:gap-5">
                {isRestoring ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-3 animate-bounce">🍽</div>
                      <div className="text-sm text-text-muted">会話履歴を復元中...</div>
                    </div>
                  </div>
                ) : null}
                {!isRestoring && messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    msg={msg}
                    onQuickReply={handleQuickReply}
                    onApproveProposal={handleApproveProposal}
                    onReviseProposal={handleReviseProposal}
                    onRetry={handleRetry}
                    disabled={isTyping || isGeneratingImage}
                  />
                ))}

                {/* タイピングインジケーター（復元中は非表示） */}
                {isTyping && (
                  <div className="flex gap-3 max-w-[720px] self-start animate-[msgIn_0.4s_ease-out]">
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-base bg-gradient-to-br from-avatar-ai-from to-avatar-ai-to border border-avatar-ai-border">
                      🍽
                    </div>
                    <div className="px-5 py-4 rounded-[20px] rounded-tl-[4px] bg-bg-secondary border border-border-light">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "200ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "400ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 広告プレースホルダー */}
              <div className="relative z-10 px-4 md:px-7 flex-shrink-0">
                <AdPlaceholder variant="inline" />
              </div>

              {/* 入力エリア */}
              <ChatInput onSend={handleSend} disabled={isTyping || isGeneratingImage || isRestoring || !isOnline} />
            </>
          )}
        </div>

        {/* プレビューパネル */}
        <PreviewPanel
          isOpen={previewOpen}
          onToggle={() => setPreviewOpen(false)}
          generatedImage={displayImage}
          isGenerating={displayIsGenerating}
          onRegenerate={promptMode ? undefined : handleRegenerate}
          proposal={promptMode ? undefined : currentProposal}
          currentStep={promptMode ? undefined : currentStep}
          lastUsedPrompt={displayLastUsedPrompt}
          onSavePrompt={displayLastUsedPrompt ? handleOpenSavePrompt : undefined}
          shopName={restoredShopName || undefined}
        />
      </div>

      {/* プロンプト保存モーダル */}
      {showSavePromptModal && displayLastUsedPrompt && (
        <SavePromptModal
          promptText={displayLastUsedPrompt}
          shopName={restoredShopName || undefined}
          onClose={() => setShowSavePromptModal(false)}
          onSaved={() => setShowSavePromptModal(false)}
        />
      )}
    </>
  );
}
