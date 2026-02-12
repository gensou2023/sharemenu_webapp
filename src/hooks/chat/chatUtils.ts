import type { MessageType } from "./types";

let msgCounter = 0;

export const genId = (prefix: string) =>
  `${prefix}-${++msgCounter}-${Math.random().toString(36).slice(2, 8)}`;

export const getTimeStr = () =>
  new Date().toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const DESIGN_DIRECTION_OPTIONS = [
  "ナチュラル・温かみ",
  "和モダン・洗練",
  "ポップ・カラフル",
  "シンプル・ミニマル",
  "レトロ・ヴィンテージ",
  "高級感・エレガント",
];

export const inferCategory = (proposal: { shopName: string; designDirection: string }): string => {
  const text = `${proposal.shopName} ${proposal.designDirection}`.toLowerCase();
  if (/和食|和モダン|寿司|天ぷら|うどん|そば|懐石|割烹|日本料理/.test(text)) return "japanese";
  if (/洋食|フレンチ|イタリアン|パスタ|ビストロ|ダイニング/.test(text)) return "western";
  if (/中華|中国|餃子|麻婆|点心|ラーメン/.test(text)) return "chinese";
  if (/カフェ|cafe|コーヒー|スイーツ|パンケーキ|ベーカリー/.test(text)) return "cafe";
  if (/居酒屋|バル|bar|酒場|焼鳥|串/.test(text)) return "izakaya";
  return "general";
};

export const INITIAL_MESSAGE: MessageType = {
  id: "welcome",
  role: "ai",
  content:
    'はじめまして！<strong>MenuCraft AI</strong> です 🍽<br>あなたのお店にぴったりのメニューデザインを一緒に作りましょう！<br><br>まず、<strong>お店の名前</strong>を教えていただけますか？',
  time: getTimeStr(),
};

export const isProposalPreview = (text: string): boolean => {
  const plain = text.replace(/<[^>]*>/g, "");
  const hasKeyword = /構成案|まとめ|キャッチコピー.*考え/.test(plain);
  const hasPromise = /お見せ|ご連絡|お待ち|準備/.test(plain);
  return hasKeyword && hasPromise;
};
