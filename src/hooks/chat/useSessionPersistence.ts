"use client";

import { useState, useCallback, useRef } from "react";
import type { MessageType } from "./types";

export function useSessionPersistence({
  initialSessionId,
  initialSavedMsgCount,
}: {
  initialSessionId: string | null;
  initialSavedMsgCount: number;
}) {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const savedMsgCountRef = useRef(initialSavedMsgCount);

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
          content: m.content.replace(/<[^>]*>/g, ""),
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

  return {
    sessionId,
    ensureSession,
    saveMessages,
    saveImage,
  };
}
