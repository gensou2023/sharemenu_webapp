export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "おはようございます";
  if (hour >= 11 && hour < 17) return "こんにちは";
  return "こんばんは";
}

export function getStatsMessage(monthlyImages: number, recentSessions?: number, sessionCount?: number): string {
  if (recentSessions !== undefined && recentSessions === 0) {
    return "最初のメニュー画像を作ってみましょう！";
  }
  if (sessionCount !== undefined && sessionCount >= 2) {
    const remaining = Math.max(0, 3 - sessionCount);
    return `今月の残りセッション: ${remaining}件`;
  }
  if (monthlyImages === 0) return "まだ画像を生成していません。始めましょう！";
  return `今月 ${monthlyImages}枚 のメニュー画像を作成しました`;
}
