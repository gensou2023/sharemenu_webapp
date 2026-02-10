"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Header from "@/components/landing/Header";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import PreviewPanel from "@/components/chat/PreviewPanel";
import Link from "next/link";
import { useChatSession } from "@/hooks/useChatSession";

export default function ChatPage() {
  const {
    messages,
    isTyping,
    isGeneratingImage,
    generatedImage,
    currentProposal,
    currentStep,
    handleSend,
    handleQuickReply,
    handleApproveProposal,
    handleReviseProposal,
    handleRegenerate,
  } = useChatSession();

  const [previewOpen, setPreviewOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 画面幅に応じてプレビューのデフォルト状態を設定
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setPreviewOpen(true);
    }
  }, []);

  // 画像生成開始時にプレビューを自動で開く
  useEffect(() => {
    if (isGeneratingImage) {
      setPreviewOpen(true);
    }
  }, [isGeneratingImage]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  return (
    <>
      <Header activeTab="chat" />
      <div className="flex h-[calc(100vh-52px)] mt-[52px]">
        {/* チャットメイン */}
        <div className="flex-1 flex flex-col min-w-0 bg-bg-primary">
          {/* チャットヘッダー */}
          <div className="px-4 md:px-7 py-3 md:py-4 border-b border-border-light flex items-center justify-between bg-bg-secondary flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-olive animate-pulse" />
              <div>
                <div className="font-semibold text-sm md:text-[15px]">
                  メニューデザイン - 新規作成
                </div>
                <div className="text-xs text-text-muted hidden sm:block">
                  AIアシスタントとチャット
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewOpen(!previewOpen)}
                title="プレビュー切替"
                className="w-9 h-9 rounded-[8px] border border-border-light bg-bg-secondary cursor-pointer flex items-center justify-center transition-all duration-300 text-text-secondary hover:bg-bg-primary hover:border-border-medium"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="1" width="7" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="10" y="1" width="7" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <Link
                href="/dashboard"
                title="ダッシュボード"
                className="w-9 h-9 rounded-[8px] border border-border-light bg-bg-secondary cursor-pointer flex items-center justify-center transition-all duration-300 text-text-secondary hover:bg-bg-primary hover:border-border-medium no-underline"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9l6-6 6 6M5 7.5V15h3v-4h2v4h3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* メッセージ一覧 */}
          <div className="flex-1 overflow-y-auto px-4 md:px-7 py-5 md:py-7 flex flex-col gap-4 md:gap-5">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                msg={msg}
                onQuickReply={handleQuickReply}
                onApproveProposal={handleApproveProposal}
                onReviseProposal={handleReviseProposal}
                disabled={isTyping || isGeneratingImage}
              />
            ))}

            {/* タイピングインジケーター */}
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

          {/* 入力エリア */}
          <ChatInput onSend={handleSend} disabled={isTyping || isGeneratingImage} />
        </div>

        {/* プレビューパネル */}
        <PreviewPanel
          isOpen={previewOpen}
          onToggle={() => setPreviewOpen(false)}
          generatedImage={generatedImage}
          isGenerating={isGeneratingImage}
          onRegenerate={handleRegenerate}
          proposal={currentProposal}
          currentStep={currentStep}
        />
      </div>
    </>
  );
}
