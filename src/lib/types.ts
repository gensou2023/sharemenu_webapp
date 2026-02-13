// ========================================
// MenuCraft AI - 共通型定義
// ========================================

// --- 画像タイプ ---
export type ImageType = "shop_photo" | "reference";

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
  storagePath?: string;
  publicUrl?: string;
  mimeType?: string;
  imageType?: ImageType;
}

export interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  time: string;
  image?: MessageImage;
  quickReplies?: string[];
  proposal?: Proposal;
  // エラーハンドリング用
  isError?: boolean;
  retryPayload?: string; // リトライ時に再送する元テキスト
  retryAfterMs?: number; // 429時の待機時間(ms)
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

export type BusinessType =
  | "izakaya" | "cafe" | "french" | "italian"
  | "japanese" | "chinese" | "ramen" | "yakiniku" | "other";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  business_type: BusinessType | null;
  shop_concept: string | null;
  brand_color_primary: string | null;
  brand_color_secondary: string | null;
  prefecture: string | null;
  website_url: string | null;
  sns_instagram: string | null;
  sns_x: string | null;
  created_at: string;
}

export type AdminUserSummary = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  deleted_at: string | null;
  sessionCount: number;
  imageCount: number;
};

export type AdminUserDetail = AdminUserSummary & {
  updated_at: string;
  stats: {
    totalSessions: number;
    totalImages: number;
    completionRate: number;
    totalApiCalls: number;
    lastActiveAt: string | null;
  };
  recentSessions: Array<{
    id: string;
    title: string;
    shop_name: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    imageCount: number;
    messageCount: number;
  }>;
  recentImages: Array<{
    id: string;
    storage_path: string;
    prompt: string;
    created_at: string;
  }>;
};

// --- ギャラリー ---
export type GalleryItem = {
  id: string;
  image_url: string;
  prompt: string;
  category: string;
  shop_name: string | null;
  show_shop_name: boolean;
  user_name: string;
  created_at: string;
  like_count: number;
  save_count: number;
  is_liked: boolean;
  is_saved: boolean;
};

// --- アチーブメント ---
export type Achievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  is_hidden: boolean;
  unlocked_at: string | null;
  notified: boolean;
};

// --- ユーザープロンプト ---
export type UserPrompt = {
  id: string;
  name: string;
  prompt_text: string;
  category: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
};
