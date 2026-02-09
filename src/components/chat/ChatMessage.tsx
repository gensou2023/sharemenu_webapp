// 許可するHTMLタグのみ残し、それ以外を除去するサニタイズ関数
function sanitizeHTML(html: string): string {
  // まず全てのHTMLタグを除去
  const stripped = html.replace(/<[^>]*>/g, (match) => {
    // 許可するタグ: <br>, <br/>, <strong>, </strong>, <em>, </em>
    if (/^<br\s*\/?>$/i.test(match)) return match;
    if (/^<\/?(strong|em)>$/i.test(match)) return match;
    // それ以外のタグはエスケープ
    return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  });
  return stripped;
}

export type MessageType = {
  id: string;
  role: "ai" | "user";
  content: string;
  time: string;
  image?: {
    emoji: string;
    fileName: string;
    fileSize: string;
    bgColor: string;
  };
  quickReplies?: string[];
  proposal?: {
    shopName: string;
    catchCopies: string[];
    designDirection: string;
    hashtags: string[];
  };
};

function AIAvatar() {
  return (
    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-base bg-gradient-to-br from-[#FFF0D6] to-[#FDDCAB] border border-[#EDD5B3]">
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
  disabled = false,
}: {
  msg: MessageType;
  onQuickReply?: (reply: string) => void;
  onApproveProposal?: () => void;
  onReviseProposal?: () => void;
  disabled?: boolean;
}) {
  const isAI = msg.role === "ai";

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
            isAI
              ? "bg-bg-secondary border border-border-light rounded-tl-[4px]"
              : "bg-[#2C2520] text-text-inverse rounded-tr-[4px]"
          }`}
          dangerouslySetInnerHTML={{ __html: isAI ? sanitizeHTML(msg.content) : msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;") }}
        />

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
            <div className="px-4 py-3 bg-gradient-to-r from-[#2C2520] to-[#3D3530] text-text-inverse text-[13px] font-semibold flex items-center gap-2">
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
                      className="px-2.5 py-0.5 rounded-full text-xs bg-[#EDE8E0] text-text-secondary"
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
