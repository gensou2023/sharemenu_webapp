import DOMPurify from "dompurify";
import { Message } from "@/lib/types";

// 後方互換のためエイリアスをエクスポート
export type MessageType = Message;

// DOMPurifyで安全にHTMLサニタイズ（許可タグ: br, strong, em のみ）
// SSR時はフォールバックとして正規表現ベースのサニタイズを使用
function sanitizeHTML(html: string): string {
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["br", "strong", "em"],
      ALLOWED_ATTR: [],
    });
  }
  // SSRフォールバック: 許可タグ以外をエスケープ
  return html.replace(/<[^>]*>/g, (match) => {
    if (/^<br\s*\/?>$/i.test(match)) return match;
    if (/^<\/?(strong|em)>$/i.test(match)) return match;
    return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  });
}

// Proposal型はprops内のMessageType経由で利用

function AIAvatar() {
  return (
    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-base bg-gradient-to-br from-avatar-ai-from to-avatar-ai-to border border-avatar-ai-border">
      🍽
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold bg-bg-dark text-white">
      田
    </div>
  );
}

export default function ChatMessage({
  msg,
  onQuickReply,
  onApproveProposal,
  onReviseProposal,
  onRetry,
  disabled = false,
}: {
  msg: MessageType;
  onQuickReply?: (reply: string) => void;
  onApproveProposal?: () => void;
  onReviseProposal?: () => void;
  onRetry?: (retryPayload: string) => void;
  disabled?: boolean;
}) {
  const isAI = msg.role === "ai";
  const isError = msg.isError;

  return (
    <div
      className={`flex gap-3 max-w-[720px] animate-[msgIn_0.4s_ease-out] ${
        isAI ? "self-start" : "self-end flex-row-reverse"
      }`}
    >
      {isAI ? <AIAvatar /> : <UserAvatar />}
      <div>
        {/* バブル */}
        <div
          className={`px-5 py-4 rounded-[20px] text-sm leading-relaxed ${
            isError
              ? "bg-red-50 border border-red-200 rounded-tl-[4px] text-red-800"
              : isAI
              ? "bg-bg-secondary border border-border-light rounded-tl-[4px]"
              : "bg-bg-dark-warm text-text-inverse rounded-tr-[4px]"
          }`}
          dangerouslySetInnerHTML={{ __html: isAI ? sanitizeHTML(msg.content) : msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;") }}
        />

        {/* リトライボタン（エラー時のみ） */}
        {isError && msg.retryPayload && onRetry && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onRetry(msg.retryPayload!)}
              disabled={disabled}
              className="px-4 py-2 rounded-[28px] text-[12px] font-semibold bg-accent-warm text-white border-none cursor-pointer flex items-center gap-1.5 transition-all duration-300 hover:bg-accent-warm-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 8a6 6 0 0110.89-3.48M14 8a6 6 0 01-10.89 3.48M2 4.5V2m0 2.5H4.5M14 11.5V14m0-2.5H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              もう一度送信
            </button>
            {msg.retryAfterMs && (
              <span className="text-[11px] text-red-500">
                {Math.ceil(msg.retryAfterMs / 1000)}秒後に再試行できます
              </span>
            )}
          </div>
        )}

        {/* 画像アップロード */}
        {msg.image && (
          <div className="mt-2.5 rounded-[12px] overflow-hidden border border-border-light max-w-[240px]">
            <div
              className="h-[140px] flex items-center justify-center text-6xl"
              style={{ background: msg.image.bgColor }}
            >
              {msg.image.emoji}
            </div>
            <div className="px-3 py-2 bg-bg-primary text-[11px] text-text-muted flex justify-between">
              <span>{msg.image.fileName}</span>
              <span>{msg.image.fileSize}</span>
            </div>
          </div>
        )}

        {/* クイック返信 */}
        {msg.quickReplies && msg.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {msg.quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => onQuickReply?.(reply)}
                className="px-4 py-2 rounded-[28px] border border-border-medium bg-bg-primary text-[13px] cursor-pointer transition-all duration-300 hover:bg-accent-warm hover:text-white hover:border-accent-warm"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* 構成案カード */}
        {msg.proposal && (
          <div className="mt-3 bg-bg-primary rounded-[12px] border border-border-light overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-bg-dark-warm to-bg-dark-warm-light text-text-inverse text-[13px] font-semibold flex items-center gap-2">
              📋 構成案 - {msg.proposal.shopName}
            </div>
            <div className="p-4 text-[13px] leading-relaxed">
              <div className="mb-3">
                <div className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-1">
                  キャッチコピー案
                </div>
                {msg.proposal.catchCopies.map((copy, i) => (
                  <div key={i}>
                    {String.fromCharCode(65 + i)}. 「{copy}」
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <div className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-1">
                  デザイン方向性
                </div>
                <div>{msg.proposal.designDirection}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-1">
                  ハッシュタグ
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {msg.proposal.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-xs bg-bg-tag text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-border-light flex gap-2">
              <button
                onClick={onApproveProposal}
                disabled={disabled}
                className="px-5 py-2 rounded-[28px] border-none text-[13px] font-semibold bg-accent-warm text-white cursor-pointer transition-all duration-300 hover:bg-accent-warm-hover disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✅ この内容で生成する
              </button>
              <button
                onClick={onReviseProposal}
                disabled={disabled}
                className="px-5 py-2 rounded-[28px] text-[13px] font-semibold bg-transparent text-text-secondary border border-border-medium cursor-pointer transition-all duration-300 hover:border-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                修正する
              </button>
            </div>
          </div>
        )}

        {/* 時刻 */}
        <div
          className={`text-[11px] text-text-muted mt-1.5 ${
            !isAI ? "text-right" : ""
          }`}
        >
          {msg.time}
        </div>
      </div>
    </div>
  );
}
