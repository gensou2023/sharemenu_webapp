export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "パスワードは8文字以上で設定してください。" };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, error: "パスワードには英字と数字の両方を含めてください。" };
  }
  return { valid: true };
}
