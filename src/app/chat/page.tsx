"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Header from "@/components/landing/Header";
import ChatMessage, { MessageType } from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import PreviewPanel, { GeneratedImage, FlowStep } from "@/components/chat/PreviewPanel";
import Link from "next/link";

let msgCounter = 0;
const genId = (prefix: string) => `${prefix}-${++msgCounter}-${Math.random().toString(36).slice(2, 8)}`;

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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null | undefined>(undefined);
  const [currentProposal, setCurrentProposal] = useState<MessageType["proposal"] | null>(null);
  const [currentStep, setCurrentStep] = useState<FlowStep>(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 保存済みメッセージ数を追跡（差分保存用）
  const savedMsgCountRef = useRef(1); // 初期メッセージ(welcome)分

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // セッション作成（初回メッセージ送信時）
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

  // メッセージをDBに保存（差分のみ）
  const saveMessages = useCallback(async (
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
  }, []);

  // 生成画像をDBに保存
  const saveImage = useCallback(async (
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
  }, []);

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

  const generateImage = async (proposal: MessageType["proposal"], aspectRatio: string = "1:1") => {
    if (!proposal) return;

    setIsGeneratingImage(true);
    setGeneratedImage(undefined);
    setPreviewOpen(true);
    setCurrentStep(5);

    try {
      // 構成案からプロンプトを生成（英語プロンプト＋テキスト描画禁止）
      const prompt = `A professional food photography for a restaurant menu.
Restaurant: ${proposal.shopName}
Design style: ${proposal.designDirection || "natural, warm"}
Mood: appetizing, warm lighting, high-quality food photo
IMPORTANT: Do NOT include any text, letters, words, numbers, watermarks, or captions in the image. Generate ONLY the food photograph with no text overlay whatsoever.`;

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        // エラーメッセージをチャットに表示
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
        // 成功メッセージをチャットに表示
        const successMsg: MessageType = {
          id: genId("ai-img"),
          role: "ai",
          content: "画像が生成されました！ 🎉<br>プレビューパネルで確認し、ダウンロードできます。<br>別のデザインをご希望の場合は「再生成」ボタンをお使いください。",
          time: getTimeStr(),
        };
        setMessages((prev) => [...prev, successMsg]);

        // 画像をDBに保存
        saveImage(sessionId, data.image, data.mimeType, prompt, aspectRatio, proposal);
      }
    } catch {
      const errorMsg: MessageType = {
        id: genId("ai-err"),
        role: "ai",
        content: "⚠️ 画像生成中に通信エラーが発生しました。もう一度お試しください。",
        time: getTimeStr(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setGeneratedImage(null);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 構成案の予告だけで終わったか判定（JSON未出力の場合）
  const isProposalPreview = (text: string): boolean => {
    const plain = text.replace(/<[^>]*>/g, "");
    const hasKeyword = /構成案|まとめ|キャッチコピー.*考え/.test(plain);
    const hasPromise = /お見せ|ご連絡|お待ち|準備/.test(plain);
    return hasKeyword && hasPromise;
  };

  const handleSend = async (text: string) => {
    // 初回メッセージ時にセッション作成
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

    // 構成案が返ってきたらプレビュー用に保持
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

    // メッセージをDBに保存
    saveMessages(sid, msgsWithAi, proposal?.shopName);

    // セッションタイトルを店名で更新
    if (proposal?.shopName && sid) {
      fetch(`/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: proposal.shopName }),
      }).catch(() => {});
    }

    // ステップ自動進行（構成案が無い場合のキーワード判定）
    if (!proposal) {
      const plain = reply.replace(/<[^>]*>/g, "");
      if (currentStep === 1 && /デザイン|方向性|テイスト|雰囲気/.test(plain)) {
        setCurrentStep(2);
      } else if (currentStep === 2 && /メニュー|料理|価格|写真/.test(plain)) {
        setCurrentStep(3);
      }
    }

    // 構成案の予告だけで終わった場合、自動でフォローアップして構成案を引き出す
    if (!proposal && isProposalPreview(reply)) {
      const followUp: MessageType[] = [...updatedMessages, aiMsg];
      const followUpUser: MessageType = {
        id: genId("auto"),
        role: "user",
        content: "はい、お願いします！構成案をJSON形式で見せてください。",
        time: getTimeStr(),
      };
      const allMsgs = [...followUp, followUpUser];
      // ユーザーメッセージは表示せず、ローディングを継続
      const { reply: reply2, proposal: proposal2 } = await callGeminiAPI(allMsgs);

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
        // フォローアップ分もDB保存
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
    // 生成中・タイピング中は連打を防止
    if (isGeneratingImage || isTyping) return;

    const latestProposal = currentProposal || messages.findLast((m) => m.proposal)?.proposal;
    if (latestProposal) {
      const copyLabel = latestProposal.catchCopies?.[0]
        ? `「${latestProposal.catchCopies[0]}」`
        : "この内容";
      // チャットにユーザーメッセージだけ表示（APIは呼ばない）
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
    handleSend("構成案を修正したいです。別のキャッチコピーやデザインの方向性を提案してもらえますか？");
  };

  const handleRegenerate = (aspectRatio: string) => {
    const latestProposal = currentProposal || messages.findLast((m) => m.proposal)?.proposal;
    if (latestProposal) {
      generateImage(latestProposal, aspectRatio);
    }
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
                disabled={isTyping || isGeneratingImage}
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
