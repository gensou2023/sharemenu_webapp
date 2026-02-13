import SettingsCard from "@/components/settings/shared/SettingsCard";
import PasswordChangeForm from "@/components/settings/PasswordChangeForm";

export default function SecuritySection() {
  return (
    <SettingsCard id="security" title="セキュリティ" accentColor="olive" animationDelay="0.3s">
      <PasswordChangeForm />
    </SettingsCard>
  );
}
