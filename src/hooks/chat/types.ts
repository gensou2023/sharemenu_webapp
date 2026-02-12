import { MessageType } from "@/components/chat/ChatMessage";
import { GeneratedImage, FlowStep } from "@/components/chat/PreviewPanel";

export type { MessageType, GeneratedImage, FlowStep };

export interface UseChatSessionOptions {
  restoreSessionId?: string | null;
}

export interface UseChatSessionReturn {
  // 状態
  messages: MessageType[];
  isTyping: boolean;
  isGeneratingImage: boolean;
  generatedImage: GeneratedImage | null | undefined;
  currentProposal: MessageType["proposal"] | null;
  currentStep: FlowStep;
  sessionId: string | null;
  isRestoring: boolean;
  restoredShopName: string | null;

  // ハンドラー
  handleSend: (text: string) => Promise<void>;
  handleQuickReply: (reply: string) => void;
  handleApproveProposal: () => void;
  handleReviseProposal: () => void;
  handleRegenerate: (aspectRatio: string) => void;
  handleRetry: (retryPayload: string) => void;
}

export interface ApiResult {
  reply: string;
  proposal?: MessageType["proposal"];
  isError?: boolean;
  retryAfterMs?: number;
}
