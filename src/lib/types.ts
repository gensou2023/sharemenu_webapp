// ========================================
// MenuCraft AI - 共通型定義
// ========================================

// --- Proposal（構成案）---
export interface Proposal {
  shopName: string;
  catchCopies: string[];
  designDirection: string;
  hashtags: string[];
}

// Gemini APIから返却されるJSON構造（type: "proposal" を含む）
export interface ProposalJSON extends Proposal {
  type: "proposal";
}

// --- メッセージ ---
export interface MessageImage {
  emoji: string;
  fileName: string;
  fileSize: string;
  bgColor: string;
}

export interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  time: string;
  image?: MessageImage;
  quickReplies?: string[];
  proposal?: Proposal;
}

// --- セッション ---
export type SessionStatus = "active" | "completed";

// --- 画像生成 ---
export interface GeneratedImage {
  data: string; // Base64
  mimeType: string;
}

// --- フロー管理 ---
export type FlowStep = 1 | 2 | 3 | 4 | 5;

// --- ユーザー ---
export type UserRole = "user" | "admin";
