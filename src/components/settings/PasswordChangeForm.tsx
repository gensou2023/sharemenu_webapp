"use client";

import { useState } from "react";

export default function PasswordChangeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isValid = currentPassword.length > 0 && hasMinLength && hasLetter && hasNumber && passwordsMatch;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "パスワードを変更しました。");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsOpen(false);
      } else {
        setError(data.error || "パスワードの変更に失敗しました。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <div>
        {message && (
          <div className="mb-4 p-3 rounded-[8px] bg-accent-olive/10 border border-accent-olive/20 text-accent-olive text-sm">
            {message}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-[15px] mb-1">パスワード</div>
            <div className="text-xs text-text-secondary">パスワードを変更できます</div>
          </div>
          <button
            onClick={() => { setIsOpen(true); setMessage(""); setError(""); }}
            className="px-5 py-2.5 rounded-[28px] border border-accent-warm text-accent-warm text-[13px] font-semibold transition-all duration-300 hover:bg-accent-warm hover:text-white cursor-pointer"
          >
            変更する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="font-semibold text-[15px] mb-1">パスワード変更</div>

      {error && (
        <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">現在のパスワード</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-primary text-text-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">新しいパスワード</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-primary text-text-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)]"
        />
        {newPassword.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className={`text-[11px] flex items-center gap-1.5 ${hasMinLength ? "text-accent-olive" : "text-text-muted"}`}>
              <span>{hasMinLength ? "✓" : "○"}</span> 8文字以上
            </div>
            <div className={`text-[11px] flex items-center gap-1.5 ${hasLetter ? "text-accent-olive" : "text-text-muted"}`}>
              <span>{hasLetter ? "✓" : "○"}</span> 英字を含む
            </div>
            <div className={`text-[11px] flex items-center gap-1.5 ${hasNumber ? "text-accent-olive" : "text-text-muted"}`}>
              <span>{hasNumber ? "✓" : "○"}</span> 数字を含む
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">新しいパスワード（確認）</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-primary text-text-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)]"
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-[11px] text-red-500 mt-1">パスワードが一致しません</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={!isValid || saving}
          className="px-6 py-3 rounded-[28px] bg-accent-warm text-white text-sm font-semibold transition-all duration-300 hover:bg-accent-warm-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? "変更中..." : "パスワードを変更"}
        </button>
        <button
          onClick={() => { setIsOpen(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setError(""); }}
          disabled={saving}
          className="px-5 py-3 rounded-[28px] border border-border-light text-text-secondary text-sm font-semibold transition-all duration-300 hover:bg-bg-primary cursor-pointer disabled:opacity-50"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
