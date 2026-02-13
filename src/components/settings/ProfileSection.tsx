"use client";

import SettingsCard from "@/components/settings/shared/SettingsCard";
import type { BusinessType } from "@/lib/types";

const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string; icon: string }[] = [
  { value: "cafe", label: "カフェ", icon: "☕" },
  { value: "izakaya", label: "居酒屋", icon: "🍶" },
  { value: "italian", label: "イタリアン", icon: "🍝" },
  { value: "french", label: "フレンチ", icon: "🥐" },
  { value: "japanese", label: "和食", icon: "🍣" },
  { value: "chinese", label: "中華", icon: "🥟" },
  { value: "ramen", label: "ラーメン", icon: "🍜" },
  { value: "yakiniku", label: "焼肉", icon: "🥩" },
  { value: "other", label: "その他", icon: "🍽" },
];

const PREFECTURE_OPTIONS = [
  "", "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

type ProfileData = {
  name: string;
  business_type: string | null;
  shop_concept: string | null;
  prefecture: string | null;
  website_url: string | null;
  sns_instagram: string | null;
  sns_x: string | null;
};

type Props = {
  data: ProfileData;
  onChange: (field: string, value: string | null) => void;
  email: string;
  createdAt: string | undefined;
  saving: boolean;
  dirty: boolean;
  onSave: () => void;
};

const inputClass = "w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-primary text-text-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)]";

export default function ProfileSection({ data, onChange, email, createdAt, saving, dirty, onSave }: Props) {
  return (
    <SettingsCard id="profile" title="プロフィール" accentColor="warm" animationDelay="0.1s">
      <div className="space-y-4">
        {/* 店舗名 */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            店舗名 / ユーザー名
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* 業態 */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            業態カテゴリ
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BUSINESS_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange("business_type", data.business_type === opt.value ? null : opt.value)}
                className={`px-3 py-2 rounded-full text-xs font-medium cursor-pointer border transition-all duration-200 ${
                  data.business_type === opt.value
                    ? "bg-accent-warm text-white border-accent-warm"
                    : "bg-transparent text-text-secondary border-border-light hover:border-accent-warm/30 hover:text-accent-warm"
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 店舗コンセプト */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            店舗コンセプト
          </label>
          <textarea
            value={data.shop_concept || ""}
            onChange={(e) => onChange("shop_concept", e.target.value)}
            placeholder="例: 季節の食材を活かした創作和食を提供する隠れ家風ダイニング"
            maxLength={200}
            rows={3}
            className={`${inputClass} resize-none`}
          />
          <p className="text-[11px] text-text-muted mt-1 text-right">
            {(data.shop_concept || "").length}/200
          </p>
        </div>

        {/* 都道府県 */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            都道府県
          </label>
          <select
            value={data.prefecture || ""}
            onChange={(e) => onChange("prefecture", e.target.value || null)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">選択してください</option>
            {PREFECTURE_OPTIONS.filter(Boolean).map((pref) => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
        </div>

        {/* メールアドレス */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-tag text-text-muted text-sm outline-none cursor-not-allowed"
          />
          <p className="text-[11px] text-text-muted mt-1">
            メールアドレスの変更はサポートまでお問い合わせください
          </p>
        </div>

        {/* SNSリンク */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Webサイト
            </label>
            <input
              type="url"
              value={data.website_url || ""}
              onChange={(e) => onChange("website_url", e.target.value)}
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Instagram
            </label>
            <input
              type="text"
              value={data.sns_instagram || ""}
              onChange={(e) => onChange("sns_instagram", e.target.value)}
              placeholder="@username"
              className={inputClass}
            />
          </div>
        </div>

        {/* 登録日 */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            登録日
          </label>
          <div className="text-sm text-text-primary">
            {createdAt
              ? new Date(createdAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"}
          </div>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving || !dirty}
        className="mt-6 px-6 py-3 rounded-[28px] bg-accent-warm text-white text-sm font-semibold transition-all duration-300 hover:bg-accent-warm-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {saving ? "保存中..." : "変更を保存"}
      </button>
    </SettingsCard>
  );
}
