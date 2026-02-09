"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Header from "@/components/landing/Header";
import ChatMessage, { MessageType } from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import PreviewPanel from "@/components/chat/PreviewPanel";
import Link from "next/link";

const INITIAL_MESSAGE: MessageType = {
  id: "welcome",
  role: "ai",
  content:
    'はじめまして！<strong>MenuCraft AI</strong> です 🍽<br>あなたのお店にぴったりのメニューデザインを一緒に作りましょう！<br><br>まず、<strong>お店の名前</strong>を教えていただけますか？',
  time: new Date().toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageType[]>([INITIAL_MESSAGE]);
  const [previewOpen, setPreviewOpen] = useState(false);

  // 画面幅に応じてプレビューのデフォルト状態を設定
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setPreviewOpen(true);
    }
  }, []);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const getTimeStr = () =>
    new Date().toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const callGeminiAPI = async (allMessages: MessageType[]) => {
    try {
      const apiMessages = allMessages.map((m) => ({
        role: m.role,
        content: m.content.replace(/<[^>]*>/g, ""), // HTMLタグを除去
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

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
            // JSON部分を除去してテキスト部分だけ残す
            reply = reply.replace(/```json[\s\S]*?```/, "").trim();
            if (!reply) {
              reply = "構成案をまとめました。こちらでよろしければ、画像生成に進みます 👇";
            }
          }
        } catch {
          // JSON解析失敗は無視
        }
      }

      // 改行をbrに変換
      reply = reply.replace(/\n/g, "<br>");

      return { reply, proposal };
    } catch {
      return {
        reply: "通信エラーが発生しました。もう一度お試しください。",
        proposal: undefined,
      };
    }
  };

  const handleSend = async (text: string) => {
    const userMsg: MessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      time: getTimeStr(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    const { reply, proposal } = await callGeminiAPI(updatedMessages);

    const aiMsg: MessageType = {
      id: `ai-${Date.now()}`,
      role: "ai",
      content: reply,
      time: getTimeStr(),
      proposal,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  const handleApproveProposal = () => {
    handleSend("キャッチコピーはAでお願いします！画像を生成してください。");
  };

  const handleReviseProposal = () => {
    handleSend("構成案を修正したいです。別のキャッチコピーやデザインの方向性を提案してもらえますか？");
  };

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
              />
            ))}

            {/* タイピングインジケーター */}
            {isTyping && (
              <div className="flex gap-3 max-w-[720px] self-start animate-[msgIn_0.4s_ease-out]">
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-base bg-gradient-to-br from-[#FFF0D6] to-[#FDDCAB] border border-[#EDD5B3]">
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
          <ChatInput onSend={handleSend} />
        </div>

        {/* プレビューパネル */}
        <PreviewPanel
          isOpen={previewOpen}
          onToggle={() => setPreviewOpen(false)}
        />
      </div>
    </>
  );
}
