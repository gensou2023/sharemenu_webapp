import Link from "next/link";
import SettingsCard from "@/components/settings/shared/SettingsCard";

type Props = {
  planLabel: string;
};

export default function PlanSection({ planLabel }: Props) {
  return (
    <SettingsCard id="plan" title="プラン" accentColor="gold" animationDelay="0.2s">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-[15px] mb-1">
            {planLabel}
          </div>
          <div className="text-xs text-text-secondary">
            月3セッションまで · 基本テンプレート
          </div>
        </div>
        <Link
          href="/#pricing"
          className="px-5 py-2.5 rounded-[28px] border border-accent-warm text-accent-warm text-[13px] font-semibold no-underline transition-all duration-300 hover:bg-accent-warm hover:text-white"
        >
          プランを変更
        </Link>
      </div>
    </SettingsCard>
  );
}
