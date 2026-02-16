"use client";

import SettingsCard from "@/components/settings/shared/SettingsCard";
import UsageProgressBar from "@/components/settings/shared/UsageProgressBar";
import { useUsage } from "@/hooks/useUsage";

export default function UsageSection() {
  const { usage, loading } = useUsage();

  return (
    <SettingsCard id="usage" title="使用状況" accentColor="olive" animationDelay="0.25s">
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-border-light rounded animate-pulse" />
          ))}
        </div>
      ) : usage ? (
        <div className="space-y-5">
          {/* 月間画像生成 */}
          <UsageProgressBar
            label="今月の画像生成"
            current={usage.current_period.image_generations_this_month}
            limit={usage.current_period.image_generation_limit_month}
            unit="枚"
          />

          {/* 累計統計 */}
          <div className="pt-3 border-t border-border-light">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-text-muted mb-1">累計生成画像</div>
                <div className="text-lg font-bold font-[family-name:var(--font-playfair)]">
                  {usage.totals.total_images}
                  <span className="text-xs font-normal text-text-muted ml-1">枚</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">ストレージ</div>
                <div className="text-lg font-bold font-[family-name:var(--font-playfair)]">
                  {usage.totals.storage_used_mb}
                  <span className="text-xs font-normal text-text-muted ml-1">MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* 直近30日のバーチャート */}
          <div className="pt-3 border-t border-border-light">
            <div className="text-xs text-text-muted mb-3">直近30日の生成数</div>
            <div className="flex items-end gap-[2px] h-16">
              {usage.daily_chart.map((day) => {
                const maxCount = Math.max(...usage.daily_chart.map((d) => d.count), 1);
                const height = (day.count / maxCount) * 100;
                return (
                  <div
                    key={day.date}
                    className="flex-1 rounded-t-sm bg-accent-olive/30 hover:bg-accent-olive/60 transition-colors duration-200"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.date}: ${day.count}枚`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-muted">使用状況の取得に失敗しました。</p>
      )}
    </SettingsCard>
  );
}
