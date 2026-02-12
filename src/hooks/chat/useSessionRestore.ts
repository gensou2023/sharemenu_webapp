"use client";

import { useState, useEffect, useRef } from "react";
import type { MessageType, FlowStep } from "./types";

export function useSessionRestore({ restoreSessionId }: { restoreSessionId?: string | null }) {
  const [isRestoring, setIsRestoring] = useState(!!restoreSessionId);
  const [restoredShopName, setRestoredShopName] = useState<string | null>(null);
  const [restoredMessages, setRestoredMessages] = useState<MessageType[] | null>(null);
  const [restoredProposal, setRestoredProposal] = useState<MessageType["proposal"] | null>(null);
  const [restoredStep, setRestoredStep] = useState<FlowStep | null>(null);
  const savedMsgCountRef = useRef(0);

  useEffect(() => {
    if (!restoreSessionId) return;

    async function restoreSession() {
      try {
        const res = await fetch(`/api/sessions/${restoreSessionId}/messages`);
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
          setRestoredProposal(lastProposal);
          setRestoredShopName(lastProposal.shopName);
          setRestoredStep(4);
        }

        // 会話の流れからステップを推定
        if (!lastProposal) {
          const allText = restored.map((m) => m.content).join(" ");
          if (/メニュー|料理|価格|写真/.test(allText)) {
            setRestoredStep(3);
          } else if (/デザイン|方向性|テイスト|雰囲気/.test(allText)) {
            setRestoredStep(2);
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

        setRestoredMessages(restored);
        savedMsgCountRef.current = restored.length;
      } catch {
        // 復元失敗時はデフォルトの新規チャット状態を維持
      } finally {
        setIsRestoring(false);
      }
    }

    restoreSession();
  }, [restoreSessionId]);

  return {
    isRestoring,
    restoredShopName,
    restoredMessages,
    restoredProposal,
    restoredStep,
    savedMsgCount: savedMsgCountRef.current,
  };
}
