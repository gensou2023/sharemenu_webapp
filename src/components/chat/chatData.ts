import { MessageType } from "./ChatMessage";

export const sampleMessages: MessageType[] = [
  {
    id: "1",
    role: "ai",
    content:
      'はじめまして！<strong>MenuCraft AI</strong> です。<br>あなたのお店にぴったりのメニューデザインを一緒に作りましょう！<br><br>まず、<strong>お店の名前</strong>を教えていただけますか？',
    time: "14:30",
  },
  {
    id: "2",
    role: "user",
    content:
      "「さくらカフェ」です。渋谷にある小さなカフェで、和テイストのスイーツが売りです。",
    time: "14:31",
  },
  {
    id: "3",
    role: "ai",
    content:
      '<strong>さくらカフェ</strong>さん、素敵ですね！渋谷で和テイストのスイーツカフェ 🌸<br><br>デザインの方向性を決めるために、お好みのテイストを教えてください。',
    time: "14:31",
    quickReplies: ["🎋 和モダン", "🌿 ナチュラル", "✨ シック", "🎨 ポップ"],
  },
  {
    id: "4",
    role: "user",
    content: "和モダンでお願いします！あと、写真もアップしますね。",
    time: "14:32",
  },
  {
    id: "5",
    role: "user",
    content: "看板メニューの抹茶パフェです。",
    time: "14:33",
    image: {
      emoji: "🍨",
      fileName: "matcha_parfait.jpg",
      fileSize: "4.2 MB ✓",
      bgColor: "linear-gradient(135deg, #5C7A4A, #8DAF6F)",
    },
  },
  {
    id: "6",
    role: "ai",
    content:
      "写真を分析しました！鮮やかな抹茶グリーンと、グラスの透明感が印象的ですね。この色味を活かしたデザインにします。<br><br>メニューと価格も教えていただけますか？",
    time: "14:33",
  },
  {
    id: "7",
    role: "user",
    content:
      "・抹茶パフェ（看板メニュー）¥1,280<br>・桜餅ラテ ¥780<br>・わらび餅セット ¥980<br>・ほうじ茶チーズケーキ ¥880",
    time: "14:35",
  },
  {
    id: "8",
    role: "ai",
    content:
      "ありがとうございます！構成案をまとめました。こちらでよろしければ、画像生成に進みます 👇",
    time: "14:36",
    proposal: {
      shopName: "さくらカフェ",
      catchCopies: [
        "渋谷で見つけた、和のごほうび",
        "一服の贅沢、抹茶が香る午後",
      ],
      designDirection:
        "和モダン / 抹茶グリーン × 桜ピンク × 墨色のカラーパレット / 和紙テクスチャ背景",
      hashtags: [
        "#さくらカフェ",
        "#渋谷カフェ",
        "#抹茶パフェ",
        "#和スイーツ",
        "#カフェ巡り",
        "#和モダン",
      ],
    },
  },
];
