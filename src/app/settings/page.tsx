"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import ProfileSection from "@/components/settings/ProfileSection";
import PlanSection from "@/components/settings/PlanSection";
import SecuritySection from "@/components/settings/SecuritySection";
import GenerationDefaultsSection from "@/components/settings/GenerationDefaultsSection";
import UsageSection from "@/components/settings/UsageSection";
import DangerSection from "@/components/settings/DangerSection";
import PrivacySection from "@/components/settings/PrivacySection";
import NotificationSection from "@/components/settings/NotificationSection";

type UserData = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  business_type: string | null;
  shop_concept: string | null;
  brand_color_primary: string | null;
  brand_color_secondary: string | null;
  prefecture: string | null;
  website_url: string | null;
  sns_instagram: string | null;
  sns_x: string | null;
};

type ProfileForm = {
  name: string;
  business_type: string | null;
  shop_concept: string | null;
  prefecture: string | null;
  website_url: string | null;
  sns_instagram: string | null;
  sns_x: string | null;
};

function buildProfileForm(user: UserData): ProfileForm {
  return {
    name: user.name || "",
    business_type: user.business_type,
    shop_concept: user.shop_concept,
    prefecture: user.prefecture,
    website_url: user.website_url,
    sns_instagram: user.sns_instagram,
    sns_x: user.sns_x,
  };
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    business_type: null,
    shop_concept: null,
    prefecture: null,
    website_url: null,
    sns_instagram: null,
    sns_x: null,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      try {
        const res = await fetch("/api/account");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setProfile(buildProfileForm(data.user));
        }
      } catch {
        setError("アカウント情報の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    }
    fetchAccount();
  }, []);

  const handleProfileChange = useCallback((field: string, value: string | null) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }, []);

  const isDirty = user ? (
    profile.name !== (user.name || "") ||
    profile.business_type !== user.business_type ||
    profile.shop_concept !== user.shop_concept ||
    profile.prefecture !== user.prefecture ||
    profile.website_url !== user.website_url ||
    profile.sns_instagram !== user.sns_instagram ||
    profile.sns_x !== user.sns_x
  ) : false;

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "更新しました。");
        setUser((prev) => (prev ? { ...prev, ...profile } : null));
      } else {
        setError(data.error || "更新に失敗しました。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <main className="min-h-full relative overflow-hidden">
        {/* 背景ブラーサークル */}
        <div className="absolute top-[5%] left-[3%] w-72 h-72 bg-accent-warm/[.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] right-[5%] w-56 h-56 bg-accent-gold/[.05] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[10%] left-[12%] w-48 h-48 bg-accent-olive/[.04] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-10 relative z-10">
          {/* ヘッダー */}
          <div className="mb-8 animate-fade-in-up">
            <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-2">
              Account Settings
            </span>
            <h1 className="font-[family-name:var(--font-playfair)] text-[28px] font-bold mb-2">
              アカウント設定
            </h1>
            <p className="text-text-secondary text-sm">
              プロフィールとプランの管理
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-8 h-[2px] bg-accent-warm/30 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-accent-warm/40" />
              <div className="w-8 h-[2px] bg-accent-warm/30 rounded-full" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-bg-secondary rounded-[12px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {message && (
                <div className="p-3 rounded-[8px] bg-accent-olive/10 border border-accent-olive/20 text-accent-olive text-sm animate-fade-in-up">
                  {message}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in-up">
                  {error}
                </div>
              )}

              <ProfileSection
                data={profile}
                onChange={handleProfileChange}
                email={user?.email || ""}
                createdAt={user?.created_at}
                saving={saving}
                dirty={isDirty}
                onSave={handleSave}
              />

              <PlanSection planLabel="Free（無料プラン）" />

              <GenerationDefaultsSection />

              <UsageSection />

              <SecuritySection />

              <NotificationSection />

              <PrivacySection />

              <DangerSection onError={setError} />
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
