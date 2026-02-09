"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/landing/Header";
import ChatMessage, { MessageType } from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import PreviewPanel from "@/components/chat/PreviewPanel";
import { sampleMessages } from "@/components/chat/chatData";
import Link from "next/link";

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageType[]>(sampleMessages);
  const [previewOpen, setPreviewOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text: string) => {
    const userMsg: MessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);

    // AIの仮応答（デモ用）
    setTimeout(() => {
      const aiMsg: MessageType = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content:
          "承知しました！内容を反映しますね。他に変更したい点はありますか？",
        time: new Date().toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  const handleApproveProposal = () => {
    const userMsg: MessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content:
        "キャッチコピーはAでお願いします！生成してください。",
      time: new Date().toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const aiMsg: MessageType = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content:
          '✨ <strong>3サイズの画像が完成しました！</strong><br><br>右側のプレビューパネルで各サイズを確認できます。タブを切り替えてご確認ください。<br><br>⚠️ 画像内のテキストはコンセプト案です。実際の使用時はCanva等で正確なテキストに差し替えることを推奨します。<br><br>修正のご希望があれば、お気軽にお伝えください（残り3回）。',
        time: new Date().toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setPreviewOpen(true);
    }, 2000);
  };

  return (
    <>
      <Header activeTab="chat" />
      <div className="flex h-[calc(100vh-52px)] mt-[52px]">
        {/* チャットメイン */}
        <div className="flex-1 flex flex-col min-w-0 bg-bg-primary">
          {/* チャットヘッダー */}
          <div className="px-7 py-4 border-b border-border-light flex items-center justify-between bg-bg-secondary flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-olive animate-pulse" />
              <div>
                <div className="font-semibold text-[15px]">
                  メニューデザイン - 新規作成
                </div>
                <div className="text-xs text-text-muted">
                  Step 2: 構成案の確認
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {/* プレビュー切替 */}
              <button
                onClick={() => setPreviewOpen(!previewOpen)}
                title="プレビュー切替"
                className="w-9 h-9 rounded-[8px] border border-border-light bg-bg-secondary cursor-pointer flex items-center justify-center transition-all duration-300 text-text-secondary hover:bg-bg-primary hover:border-border-medium"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="7"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="10"
                    y="1"
                    width="7"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              {/* ダッシュボードリンク */}
              <Link
                href="/dashboard"
                title="ダッシュボード"
                className="w-9 h-9 rounded-[8px] border border-border-light bg-bg-secondary cursor-pointer flex items-center justify-center transition-all duration-300 text-text-secondary hover:bg-bg-primary hover:border-border-medium no-underline"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3 9l6-6 6 6M5 7.5V15h3v-4h2v4h3V7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* メッセージ一覧 */}
          <div className="flex-1 overflow-y-auto px-7 py-7 flex flex-col gap-5">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                msg={msg}
                onQuickReply={handleQuickReply}
                onApproveProposal={handleApproveProposal}
              />
            ))}
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
